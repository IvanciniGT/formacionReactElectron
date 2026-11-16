import { expect } from "chai";
import type { EstadoCatalogo, EstadoConCatalogo } from "../../src/estado.js";
import {
  seleccionarCargaEvento,
  seleccionarEnVivo,
  seleccionarEvento,
  seleccionarGrupos,
  seleccionarMercadosConApuestas,
} from "../../src/selectores.js";
import {
  seleccionarCargaCatalogo,
  seleccionarErrorCatalogo,
  seleccionarEventos,
} from "../../src/selectores.js";
import { detalle, mercado } from "./datos.js";

// Solo la parte del estado que lee cada prueba: el resto no importa.
const con = (catalogo: Partial<EstadoCatalogo>) =>
  ({ catalogo }) as EstadoConCatalogo;
const conMercados = (mercados: EstadoCatalogo["evento"]["mercados"]) =>
  con({ evento: { mercados } as EstadoCatalogo["evento"] });

describe("selectores", () => {
  it("los mercados con apuestas, memorizado: con los mismos mercados, la misma lista", () => {
    const suspendido = { ...mercado("m2"), seAdmitenApuestas: false };
    const estado = conMercados([mercado("m1"), suspendido]);
    const primera = seleccionarMercadosConApuestas(estado);
    expect(primera.map((m) => m.id)).to.deep.equal(["m1"]);
    expect(seleccionarMercadosConApuestas({ ...estado })).to.equal(primera);
  });

  it("sin evento, siempre la misma lista vacía de grupos", () => {
    const sinEvento = con({ evento: {} as EstadoCatalogo["evento"] });
    expect(seleccionarGrupos(sinEvento)).to.deep.equal([]);
    expect(seleccionarGrupos(sinEvento)).to.equal(
      seleccionarGrupos({ ...sinEvento }),
    );
  });

  it("los simples devuelven lo que hay en el estado, tal cual", () => {
    const evento = detalle();
    const estado = con({
      listado: { eventos: [evento], carga: "listo", filtro: {} },
      evento: {
        detalle: evento,
        carga: "listo",
        enVivo: true,
        mercados: [],
        cargaMercados: "inactivo",
      },
    });
    expect(seleccionarEventos(estado)).to.equal(
      estado.catalogo?.listado.eventos,
    );
    expect(seleccionarCargaCatalogo(estado)).to.equal("listo");
    expect(seleccionarErrorCatalogo(estado)).to.equal(undefined);
    expect(
      seleccionarErrorCatalogo(
        con({
          listado: {
            eventos: [],
            carga: "error",
            filtro: {},
            error: "sin red",
          },
        }),
      ),
    ).to.equal("sin red");
    expect(seleccionarEvento(estado)).to.equal(evento);
    expect(seleccionarCargaEvento(estado)).to.equal("listo");
    expect(seleccionarEnVivo(estado)).to.equal(true);
    expect(seleccionarGrupos(estado)).to.equal(evento.grupos);
  });
});
