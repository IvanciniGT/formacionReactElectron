import { expect } from "chai";
import {
  arrancarBackendFake,
  type BackendFake,
} from "@apuestas-deportivas/catalogo-backend-fake";
import { crearServicioEventos } from "@apuestas-deportivas/catalogo-servicios-impl";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import { solicitarListadoEventos } from "../../src/acciones.js";
import { cerrarEvento, solicitarEvento } from "../../src/acciones.js";
import { seleccionarCatalogo } from "../../src/selectores.js";
import { crearStore } from "../store-de-prueba.js";

type Store = ReturnType<typeof crearStore>;

// Espera a que se cumpla algo, o falla pasado un tiempo.
async function esperarA(condicion: () => boolean, ms = 3000): Promise<void> {
  const limite = Date.now() + ms;
  while (!condicion()) {
    if (Date.now() > limite) throw new Error("No ha pasado a tiempo.");
    await new Promise((resolver) => setTimeout(resolver, 20));
  }
}

// De sistema: el store con la implementación de verdad, contra el backend fake.
describe("el estado, contra el backend fake", function () {
  this.timeout(10_000);
  let fake: BackendFake;
  let servicio: ServicioEventos;
  let store: Store;

  beforeEach(async () => {
    fake = await arrancarBackendFake({ puerto: 0, moverCuotasCadaMs: 0 });
    servicio = crearServicioEventos({
      urlBase: fake.url,
      tiempoMaximoPeticionMs: 2000,
      esperasReconexionMs: [0, 100],
      nivelDeRegistro: "ninguno",
    });
    store = crearStore(servicio);
  });

  afterEach(async () => {
    store.dispatch(cerrarEvento());
    await servicio.cerrar();
    await fake.parar();
  });

  it("carga los eventos, abre uno, y una cuota que cambia en el servidor llega sola", async () => {
    store.dispatch(solicitarListadoEventos());
    await esperarA(
      () => seleccionarCatalogo(store.getState()).listado.carga === "listo",
    );
    const [primero] = seleccionarCatalogo(store.getState()).listado.eventos;
    if (!primero) throw new Error("El fake no tiene eventos.");

    store.dispatch(solicitarEvento(primero.id));
    await esperarA(() => seleccionarCatalogo(store.getState()).evento.enVivo);
    const seleccion = seleccionarCatalogo(store.getState()).evento.detalle
      ?.mercadoPrincipal?.selecciones[0];
    if (!seleccion) throw new Error("El evento no tiene mercado principal.");

    fake.catalogo.cambiarCuota(seleccion.id, 7.77);

    await esperarA(
      () =>
        seleccionarCatalogo(store.getState()).evento.detalle?.mercadoPrincipal
          ?.selecciones[0]?.cuota === 7.77,
    );
    expect(fake.suscritosA(primero.id)).to.equal(1);
  });
});
