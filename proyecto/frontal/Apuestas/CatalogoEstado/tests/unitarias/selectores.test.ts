import { expect } from "chai";
import type { Estado } from "../../src/estado.js";
import {
  seleccionarCargaCatalogo,
  seleccionarCargaEvento,
  seleccionarEnVivo,
  seleccionarEvento,
  seleccionarEventos,
  seleccionarGrupos,
  seleccionarMercadosConApuestas,
} from "../../src/selectores/selectores.js";
import { detalle, mercado } from "./datos.js";

const conMercados = (mercados: Estado["evento"]["mercados"]) =>
  ({ evento: { mercados } }) as Estado;

describe("selectores", () => {
  it("los mercados con apuestas, memorizado: con los mismos mercados, la misma lista", () => {
    const suspendido = { ...mercado("m2"), seAdmitenApuestas: false };
    const estado = conMercados([mercado("m1"), suspendido]);
    const primera = seleccionarMercadosConApuestas(estado);
    expect(primera.map((m) => m.id)).to.deep.equal(["m1"]);
    expect(seleccionarMercadosConApuestas({ ...estado })).to.equal(primera);
  });

  it("sin evento, siempre la misma lista vacía de grupos", () => {
    const sinEvento = { evento: {} } as Estado;
    expect(seleccionarGrupos(sinEvento)).to.deep.equal([]);
    expect(seleccionarGrupos(sinEvento)).to.equal(
      seleccionarGrupos({ ...sinEvento }),
    );
  });

  it("los simples devuelven lo que hay en el estado, tal cual", () => {
    const evento = detalle();
    const estado = {
      catalogo: { eventos: [evento], carga: "listo", filtro: {} },
      evento: {
        detalle: evento,
        carga: "listo",
        enVivo: true,
        mercados: [],
        cargaMercados: "inactivo",
      },
    } as Estado;
    expect(seleccionarEventos(estado)).to.equal(estado.catalogo.eventos);
    expect(seleccionarCargaCatalogo(estado)).to.equal("listo");
    expect(seleccionarEvento(estado)).to.equal(evento);
    expect(seleccionarCargaEvento(estado)).to.equal("listo");
    expect(seleccionarEnVivo(estado)).to.equal(true);
    expect(seleccionarGrupos(estado)).to.equal(evento.grupos);
  });
});
