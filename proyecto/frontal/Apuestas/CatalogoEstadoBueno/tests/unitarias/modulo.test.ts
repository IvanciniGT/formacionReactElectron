import { expect } from "chai";
import type {
  PaginaEventos,
  ServicioEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { seleccionarCatalogo } from "../../src/selectores.js";
import { eventosPedidos } from "../../src/acciones.js";
import { seleccionarEventos } from "../../src/selectores.js";
import { crearStoreAnfitrion } from "../store-de-prueba.js";

const esperar = () => new Promise((resolver) => setTimeout(resolver));

const servicio = {
  listarEventos: () =>
    Promise.resolve({ eventos: [{ id: "e1" }] } as unknown as PaginaEventos),
} as unknown as ServicioEventos;

describe("el slice, inyectado en un store", () => {
  it("antes de inyectarlo, se lee como recién creado y sus acciones no hacen nada", async () => {
    const { store } = crearStoreAnfitrion();

    store.dispatch(eventosPedidos());
    await esperar();

    expect(seleccionarEventos(store.getState())).to.deep.equal([]);
    expect(seleccionarCatalogo(store.getState()).listado.carga).to.equal(
      "inactivo",
    );
  });

  it("se inyecta en un store que ya existía, junto a los otros slices", async () => {
    const { store, inyectarCatalogo } = crearStoreAnfitrion();

    inyectarCatalogo(servicio);
    store.dispatch(eventosPedidos());
    await esperar();

    expect(seleccionarEventos(store.getState()).map((e) => e.id)).to.deep.equal(
      ["e1"],
    );
    expect(store.getState().usuarios).to.deep.equal({ nombre: "anónimo" });
  });
});
