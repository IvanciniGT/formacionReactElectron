import { expect } from "chai";
import type {
  CambioEnEvento,
  PaginaEventos,
  ServicioEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { Subject } from "rxjs";
import { eventosPedidos, filtroCambiado } from "../../src/catalogo/catalogo.js";
import {
  eventoCerrado,
  eventoPedido,
  grupoAbierto,
} from "../../src/evento/evento.js";
import { crearStore } from "../../src/store.js";
import { detalle, mercado } from "./datos.js";

// Que terminen los efectos que estén en marcha.
const esperar = () => new Promise((resolver) => setTimeout(resolver));

// Un doble del servicio: responde lo que se le diga, y los cambios se emiten a mano.
function servicioFalso() {
  const cambios = new Subject<CambioEnEvento>();
  const llamadas = { obtenerEvento: 0, cambios: [] as string[] };
  const servicio = {
    listarEventos: (filtro?: { tipo?: string }) =>
      Promise.resolve({
        eventos: [{ id: filtro?.tipo ?? "todos" }],
      } as unknown as PaginaEventos),
    obtenerEvento: (id: string) => {
      llamadas.obtenerEvento++;
      return Promise.resolve(detalle(id));
    },
    listarMercados: () =>
      Promise.resolve({ mercados: [mercado("m2")], marca: "10" }),
    cambios: (id: string, desde: string) => {
      llamadas.cambios.push(`${id}@${desde}`);
      return cambios.asObservable();
    },
  } as unknown as ServicioEventos;
  return { servicio, cambios, llamadas };
}

describe("efectos", () => {
  it("pedir eventos los carga del servicio, y cambiar el filtro los vuelve a pedir", async () => {
    const { servicio } = servicioFalso();
    const store = crearStore(servicio);

    store.dispatch(eventosPedidos());
    await esperar();
    expect(store.getState().catalogo.eventos.map((e) => e.id)).to.deep.equal([
      "todos",
    ]);

    store.dispatch(filtroCambiado({ tipo: "futbol" }));
    await esperar();
    expect(store.getState().catalogo.eventos.map((e) => e.id)).to.deep.equal([
      "futbol",
    ]);
  });

  it("abrir un evento lo carga y sigue sus cambios desde su marca", async () => {
    const { servicio, cambios, llamadas } = servicioFalso();
    const store = crearStore(servicio);

    store.dispatch(eventoPedido("e1"));
    await esperar();
    expect(llamadas.cambios).to.deep.equal(["e1@10"]);
    expect(store.getState().evento.enVivo).to.equal(true);

    cambios.next({ tipo: "estado", marca: "11", estado: "enJuego" });
    expect(store.getState().evento.detalle?.estado).to.equal("enJuego");
  });

  it("con «recargar», vuelve a cargar el evento y su grupo, y a seguirlo", async () => {
    const { servicio, cambios, llamadas } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(eventoPedido("e1"));
    await esperar();
    store.dispatch(grupoAbierto("principales"));
    await esperar();

    cambios.next({ tipo: "recargar" });
    await esperar();

    expect(llamadas.obtenerEvento).to.equal(2);
    expect(llamadas.cambios).to.deep.equal(["e1@10", "e1@10"]);
    expect(store.getState().evento.grupo).to.equal("principales");
    expect(store.getState().evento.mercados.map((m) => m.id)).to.deep.equal([
      "m2",
    ]);
  });

  it("al cerrar el evento deja de seguirlo", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(eventoPedido("e1"));
    await esperar();

    store.dispatch(eventoCerrado());
    await esperar();

    expect(cambios.observed).to.equal(false);
  });

  it("si el servicio deja de mandar cambios por un error, se apunta por qué", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(eventoPedido("e1"));
    await esperar();

    cambios.error(new Error("sin conexión"));
    await esperar();

    expect(store.getState().evento).to.include({
      enVivo: false,
      errorEnVivo: "sin conexión",
    });
  });

  it("si se abre otro evento antes de que llegue el primero, el primero no cuenta", async () => {
    const { servicio } = servicioFalso();
    let soltarPrimero: (() => void) | undefined;
    const lento = Object.assign(Object.create(servicio) as ServicioEventos, {
      obtenerEvento: (id: string) =>
        id === "lento"
          ? new Promise(
              (resolver) =>
                (soltarPrimero = () => {
                  resolver(detalle("lento"));
                }),
            )
          : Promise.resolve(detalle(id)),
    });
    const store = crearStore(lento);

    store.dispatch(eventoPedido("lento"));
    store.dispatch(eventoPedido("rapido"));
    await esperar();
    soltarPrimero?.();
    await esperar();

    expect(store.getState().evento.detalle?.id).to.equal("rapido");
  });

  it("si el servicio falla, cada bloque apunta su error", async () => {
    const { servicio } = servicioFalso();
    const fallan = Object.assign(Object.create(servicio) as ServicioEventos, {
      listarEventos: () => Promise.reject(new Error("sin red")),
      // Lo que se rechaza no siempre es un Error: aquí, a propósito, un texto.
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      obtenerEvento: () => Promise.reject("no existe"),
    });
    const store = crearStore(fallan);

    store.dispatch(eventosPedidos());
    store.dispatch(eventoPedido("e1"));
    await esperar();

    expect(store.getState().catalogo).to.include({
      carga: "error",
      error: "sin red",
    });
    expect(store.getState().evento).to.include({
      carga: "error",
      error: "no existe",
    });
  });

  it("si fallan los mercados del grupo, se apunta en el grupo", async () => {
    const { servicio } = servicioFalso();
    const fallan = Object.assign(Object.create(servicio) as ServicioEventos, {
      listarMercados: () => Promise.reject(new Error("grupo no válido")),
    });
    const store = crearStore(fallan);
    store.dispatch(eventoPedido("e1"));
    await esperar();

    store.dispatch(grupoAbierto("raro"));
    await esperar();

    expect(store.getState().evento).to.include({
      cargaMercados: "error",
      errorMercados: "grupo no válido",
    });
  });

  it("si el servicio termina los cambios sin error, se deja de seguir sin motivo", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(eventoPedido("e1"));
    await esperar();

    cambios.complete();
    await esperar();

    expect(store.getState().evento.enVivo).to.equal(false);
    expect(store.getState().evento).not.to.have.property("errorEnVivo");
  });

  it("abrir un grupo sin evento abierto no pide nada", async () => {
    const { servicio } = servicioFalso();
    let pedidos = 0;
    const cuenta = Object.assign(Object.create(servicio) as ServicioEventos, {
      listarMercados: () => {
        pedidos++;
        return Promise.resolve({ mercados: [], marca: "1" });
      },
    });
    const store = crearStore(cuenta);

    store.dispatch(grupoAbierto("principales"));
    await esperar();

    expect(pedidos).to.equal(0);
  });

  it("en el catálogo y en los grupos, también gana la última petición", async () => {
    const { servicio } = servicioFalso();
    const soltar: (() => void)[] = [];
    const lento = Object.assign(Object.create(servicio) as ServicioEventos, {
      listarEventos: (filtro?: { tipo?: string }) =>
        new Promise((resolver) => {
          soltar.push(() => {
            resolver({ eventos: [{ id: filtro?.tipo ?? "todos" }] });
          });
        }),
      listarMercados: (_id: string, grupo: string) =>
        new Promise((resolver) => {
          soltar.push(() => {
            resolver({ mercados: [mercado(grupo)], marca: "1" });
          });
        }),
    });
    const store = crearStore(lento);
    store.dispatch(eventoPedido("e1"));
    await esperar();

    store.dispatch(filtroCambiado({ tipo: "viejo" }));
    store.dispatch(filtroCambiado({ tipo: "nuevo" }));
    store.dispatch(grupoAbierto("viejo"));
    store.dispatch(grupoAbierto("nuevo"));
    // Las respuestas llegan al revés: primero la última.
    for (const s of soltar.reverse()) s();
    await esperar();

    expect(store.getState().catalogo.eventos.map((e) => e.id)).to.deep.equal([
      "nuevo",
    ]);
    expect(store.getState().evento.mercados.map((m) => m.id)).to.deep.equal([
      "nuevo",
    ]);
  });
});
