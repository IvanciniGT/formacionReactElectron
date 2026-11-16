// El listado conectado contra el store de prueba de verdad (el slice inyectado y el servicio
// en memoria): no se simula Redux, se usa.
import {
  seleccionarCatalogo,
  solicitarListadoEventos,
} from "@apuestas-deportivas/catalogo-estado-bueno";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { ListadoEventosConectado } from "../../src/ListadoEventosConectado/ListadoEventosConectado";
import { crearServicioEnMemoria } from "../../dobles/servicio-en-memoria";
import { crearStoreDePrueba } from "../../dobles/store-de-prueba";

function montar(servicio = crearServicioEnMemoria()) {
  const store = crearStoreDePrueba(servicio);
  render(
    <Provider store={store}>
      <ListadoEventosConectado />
    </Provider>,
  );
  return store;
}

describe("ListadoEventosConectado", () => {
  it("no pide nada al montarse: enseña lo que haya en el store", () => {
    const store = montar();

    expect(seleccionarCatalogo(store.getState()).listado.carga).toBe(
      "inactivo",
    );
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  it("cuando alguien pide el listado, enseña «cargando» y después los eventos", async () => {
    const store = montar();

    act(() => {
      store.dispatch(solicitarListadoEventos());
    });
    expect(screen.getByRole("status")).toHaveTextContent("Cargando eventos…");

    expect(await screen.findAllByRole("article")).toHaveLength(4);
  });

  it("si el servicio falla, enseña el motivo que quedó en el store", async () => {
    const servicio = crearServicioEnMemoria();
    const store = montar({
      ...servicio,
      listarEventos: () => Promise.reject(new Error("sin red")),
    });

    act(() => {
      store.dispatch(solicitarListadoEventos());
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("sin red");
  });

  it("al abrir un evento, lo pide al store con su id", async () => {
    const store = montar();
    act(() => {
      store.dispatch(solicitarListadoEventos());
    });
    const segundo = await screen.findByRole("article", {
      name: "Unión Costera - Real Sierra",
    });

    await userEvent.click(within(segundo).getByRole("button"));

    expect(seleccionarCatalogo(store.getState()).evento.id).toBe("e2");
  });
});
