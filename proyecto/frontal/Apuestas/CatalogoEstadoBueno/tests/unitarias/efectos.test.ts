import { expect } from "chai";
import type {
  CambioEnEvento,
  PaginaEventos,
  ServicioEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { Subject } from "rxjs";
import { solicitarListadoEventos, cambiarFiltro } from "../../src/acciones.js";
import {
  cerrarEvento,
  solicitarEvento,
  abrirGrupo,
} from "../../src/acciones.js";
import { seleccionarCatalogo } from "../../src/selectores.js";
import { crearStore } from "../store-de-prueba.js";
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

    store.dispatch(solicitarListadoEventos());
    await esperar();
    expect(
      seleccionarCatalogo(store.getState()).listado.eventos.map((e) => e.id),
    ).to.deep.equal(["todos"]);

    store.dispatch(cambiarFiltro({ tipo: "futbol" }));
    await esperar();
    expect(
      seleccionarCatalogo(store.getState()).listado.eventos.map((e) => e.id),
    ).to.deep.equal(["futbol"]);
  });

  it("abrir un evento lo carga y sigue sus cambios desde su marca", async () => {
    const { servicio, cambios, llamadas } = servicioFalso();
    const store = crearStore(servicio);

    store.dispatch(solicitarEvento("e1"));
    await esperar();
    expect(llamadas.cambios).to.deep.equal(["e1@10"]);
    expect(seleccionarCatalogo(store.getState()).evento.enVivo).to.equal(true);

    cambios.next({ tipo: "estado", marca: "11", estado: "enJuego" });
    expect(
      seleccionarCatalogo(store.getState()).evento.detalle?.estado,
    ).to.equal("enJuego");
  });

  it("con «recargar», vuelve a cargar el evento y su grupo, y a seguirlo", async () => {
    const { servicio, cambios, llamadas } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(solicitarEvento("e1"));
    await esperar();
    store.dispatch(abrirGrupo("principales"));
    await esperar();

    cambios.next({ tipo: "recargar" });
    await esperar();

    expect(llamadas.obtenerEvento).to.equal(2);
    expect(llamadas.cambios).to.deep.equal(["e1@10", "e1@10"]);
    expect(seleccionarCatalogo(store.getState()).evento.grupo).to.equal(
      "principales",
    );
    expect(
      seleccionarCatalogo(store.getState()).evento.mercados.map((m) => m.id),
    ).to.deep.equal(["m2"]);
  });

  it("al cerrar el evento deja de seguirlo", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    store.dispatch(cerrarEvento());
    await esperar();

    expect(cambios.observed).to.equal(false);
  });

  it("si el servicio deja de mandar cambios por un error, se apunta por qué", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    cambios.error(new Error("sin conexión"));
    await esperar();

    expect(seleccionarCatalogo(store.getState()).evento).to.include({
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

    store.dispatch(solicitarEvento("lento"));
    store.dispatch(solicitarEvento("rapido"));
    await esperar();
    soltarPrimero?.();
    await esperar();

    expect(seleccionarCatalogo(store.getState()).evento.detalle?.id).to.equal(
      "rapido",
    );
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

    store.dispatch(solicitarListadoEventos());
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    expect(seleccionarCatalogo(store.getState()).listado).to.include({
      carga: "error",
      error: "sin red",
    });
    expect(seleccionarCatalogo(store.getState()).evento).to.include({
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
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    store.dispatch(abrirGrupo("raro"));
    await esperar();

    expect(seleccionarCatalogo(store.getState()).evento).to.include({
      cargaMercados: "error",
      errorMercados: "grupo no válido",
    });
  });

  it("si el servicio termina los cambios sin error, se deja de seguir sin motivo", async () => {
    const { servicio, cambios } = servicioFalso();
    const store = crearStore(servicio);
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    cambios.complete();
    await esperar();

    expect(seleccionarCatalogo(store.getState()).evento.enVivo).to.equal(false);
    expect(seleccionarCatalogo(store.getState()).evento).not.to.have.property(
      "errorEnVivo",
    );
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

    store.dispatch(abrirGrupo("principales"));
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
    store.dispatch(solicitarEvento("e1"));
    await esperar();

    store.dispatch(cambiarFiltro({ tipo: "viejo" }));
    store.dispatch(cambiarFiltro({ tipo: "nuevo" }));
    store.dispatch(abrirGrupo("viejo"));
    store.dispatch(abrirGrupo("nuevo"));
    // Las respuestas llegan al revés: primero la última.
    for (const s of soltar.reverse()) s();
    await esperar();

    expect(
      seleccionarCatalogo(store.getState()).listado.eventos.map((e) => e.id),
    ).to.deep.equal(["nuevo"]);
    expect(
      seleccionarCatalogo(store.getState()).evento.mercados.map((m) => m.id),
    ).to.deep.equal(["nuevo"]);
  });
});
