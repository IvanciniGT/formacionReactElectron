import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListadoEventosItem } from "../../src/ListadoEventosItem/ListadoEventosItem";
import { EVENTOS } from "../../dobles/datos";

const [programado, enDirecto, suspendido, sinMercado] = EVENTOS as [
  (typeof EVENTOS)[number],
  (typeof EVENTOS)[number],
  (typeof EVENTOS)[number],
  (typeof EVENTOS)[number],
];

describe("ListadoEventosItem", () => {
  it("enseña el tipo, el nombre, cuándo empieza y las cuotas con dos decimales", () => {
    render(<ListadoEventosItem evento={programado} />);

    const item = screen.getByRole("article", { name: programado.nombre });
    expect(within(item).getByText("Fútbol")).toBeInTheDocument();
    expect(item.querySelector("time")).toHaveAttribute(
      "datetime",
      "2030-05-11T19:00:00.000Z",
    );
    const cuotas = within(item).getByRole("list", { name: "Cuotas" });
    expect(
      within(cuotas)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["11.85", "X3.40", "24.10"]);
    expect(screen.queryByText("En directo")).not.toBeInTheDocument();
  });

  it("en directo, dice «En directo» en vez de la hora, y marca hacia dónde va cada cuota", () => {
    render(<ListadoEventosItem evento={enDirecto} />);

    expect(screen.getByText("En directo")).toBeInTheDocument();
    expect(screen.queryByRole("time")).not.toBeInTheDocument();
    const tendencias = screen
      .getAllByRole("listitem")
      .map((li) => li.dataset.tendencia);
    expect(tendencias).toEqual(["baja", "sube", "igual"]);
  });

  it("con el mercado suspendido, las cuotas se ven pero marcadas; si está interrumpido, se dice", () => {
    render(<ListadoEventosItem evento={suspendido} />);

    expect(screen.getByRole("list", { name: "Cuotas" })).toHaveAttribute(
      "data-suspendido",
      "true",
    );
    expect(screen.getByText("Interrumpido")).toBeInTheDocument();
  });

  it("sin mercado principal, avisa de que aún no hay cuotas", () => {
    render(<ListadoEventosItem evento={sinMercado} />);

    expect(screen.getByText("Sin cuotas todavía")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("al pulsarlo avisa con el id del evento; sin callback, no pasa nada", async () => {
    const onAbrir = vi.fn();
    const { rerender } = render(
      <ListadoEventosItem evento={programado} onAbrir={onAbrir} />,
    );

    await userEvent.click(screen.getByRole("button"));
    expect(onAbrir).toHaveBeenCalledExactlyOnceWith("e1");

    rerender(<ListadoEventosItem evento={programado} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onAbrir).toHaveBeenCalledTimes(1);
  });
});
