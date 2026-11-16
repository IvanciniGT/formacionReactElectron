import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListadoEventos } from "../../src/ListadoEventos/ListadoEventos";
import { EVENTOS } from "../../dobles/datos";

const nombres = () =>
  screen.queryAllByRole("article").map((a) => a.getAttribute("aria-label"));

describe("ListadoEventos", () => {
  it("pinta un item por evento, en el orden en que llegan", () => {
    render(<ListadoEventos eventos={EVENTOS} carga="listo" />);

    expect(nombres()).toEqual(EVENTOS.map((e) => e.nombre));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("mientras carga la primera vez, lo dice; si ya había eventos, los sigue enseñando", () => {
    const { rerender } = render(
      <ListadoEventos eventos={[]} carga="cargando" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Cargando eventos…");
    expect(screen.getByRole("region", { name: "Eventos" })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    rerender(<ListadoEventos eventos={EVENTOS} carga="cargando" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(nombres()).toHaveLength(4);
  });

  it("si falla, enseña el motivo, sin quitar los eventos que hubiera", () => {
    render(
      <ListadoEventos eventos={EVENTOS} carga="error" error="sin conexión" />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se han podido cargar los eventos: sin conexión",
    );
    expect(nombres()).toHaveLength(4);
  });

  it("cargado y sin eventos, dice que no hay; sin pedir todavía, no dice nada", () => {
    const { rerender } = render(<ListadoEventos eventos={[]} carga="listo" />);
    expect(screen.getByText("No hay eventos que mostrar")).toBeInTheDocument();

    rerender(<ListadoEventos eventos={[]} carga="inactivo" />);
    expect(
      screen.getByRole("region", { name: "Eventos" }),
    ).toBeEmptyDOMElement();
  });

  it("avisa de qué evento abre el jugador", async () => {
    const onAbrirEvento = vi.fn();
    render(
      <ListadoEventos
        eventos={EVENTOS}
        carga="listo"
        onAbrirEvento={onAbrirEvento}
      />,
    );

    const tercero = screen.getByRole("article", { name: EVENTOS[2]!.nombre });
    await userEvent.click(within(tercero).getByRole("button"));

    expect(onAbrirEvento).toHaveBeenCalledExactlyOnceWith("e3");
  });
});
