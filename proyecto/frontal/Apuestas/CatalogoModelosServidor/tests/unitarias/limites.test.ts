import { expect } from "chai";
import { comoLiteral, extraerLimites } from "../../scripts/limites.js";
import { LIMITES_SERVIDOR } from "../../src/index.js";

describe("extraerLimites", () => {
  const ESQUEMAS = {
    Cuota: {
      type: "number",
      exclusiveMinimum: 1,
      "x-decimales": 2,
      "x-invariante": "Cuota",
    },
    Seleccion: {
      type: "object",
      properties: {
        id: { type: "string", "x-invariante": "Identificador" },
        descripcion: {
          type: "string",
          minLength: 3,
          maxLength: 500,
          pattern: "^.+$",
        },
        cuota: { $ref: "#/components/schemas/Cuota" },
        // Lo del campo prevalece sobre lo del esquema al que apunta.
        cuotaInicial: {
          $ref: "#/components/schemas/Cuota",
          "x-invariante": "CuotaInicial",
        },
        mercados: { type: "array", maxItems: 100 },
      },
    },
    Detalle: {
      allOf: [
        { $ref: "#/components/schemas/Seleccion" },
        { properties: { nota: { maxLength: 9 } } },
      ],
    },
    Alias: { $ref: "#/components/schemas/Seleccion" },
  };
  const limites = extraerLimites(ESQUEMAS);

  it("saca longitudes, patrón, mínimo, decimales y máximo de elementos", () => {
    expect(limites["Seleccion"]).to.deep.equal({
      descripcion: { longitudMinima: 3, longitudMaxima: 500, patron: "^.+$" },
      cuota: { mayorQue: 1, decimales: 2, invariante: "Cuota" },
      cuotaInicial: { mayorQue: 1, decimales: 2, invariante: "CuotaInicial" },
      mercados: { elementosMaximos: 100 },
    });
  });

  it("un campo sin límites no sale, aunque tenga invariante", () => {
    expect(limites["Seleccion"]).not.to.have.property("id");
  });

  it("los esquemas sin propiedades no salen", () => {
    expect(limites).not.to.have.property("Cuota");
  });

  it("incluye lo heredado por allOf y lo del esquema al que se apunta", () => {
    expect(Object.keys(limites["Detalle"] ?? {})).to.include.members([
      "descripcion",
      "nota",
    ]);
    expect(limites["Alias"]).to.deep.equal(limites["Seleccion"]);
  });
});

describe("comoLiteral", () => {
  it("es JSON con las claves sin comillas", () => {
    expect(comoLiteral({ a: { b: "c" } })).to.equal(
      '{\n  a: {\n    b: "c"\n  }\n}',
    );
  });
});

// Lo generado del contrato de verdad. Las cifras van escritas a mano a propósito: si el
// contrato cambia un límite, esta prueba falla y alguien tiene que decidir qué hacer.
describe("LIMITES_SERVIDOR", () => {
  it("los textos", () => {
    expect(LIMITES_SERVIDOR.TipoEvento.nombre).to.include({
      longitudMinima: 2,
      longitudMaxima: 50,
    });
    expect(LIMITES_SERVIDOR.EventoResumen.nombre).to.include({
      longitudMinima: 3,
      longitudMaxima: 100,
    });
    expect(LIMITES_SERVIDOR.Mercado.descripcion).to.include({
      longitudMinima: 3,
      longitudMaxima: 500,
    });
    expect(LIMITES_SERVIDOR.GrupoMercados.clave).to.deep.equal({
      longitudMaxima: 50,
      patron: "^[a-z][a-z0-9-]*$",
    });
  });

  it("las cuotas, con la invariante de la que salen", () => {
    expect(LIMITES_SERVIDOR.Seleccion.cuota).to.deep.equal({
      mayorQue: 1,
      decimales: 2,
      invariante: "Cuota (Apuestas.Invariantes)",
    });
  });

  it("el detalle hereda los del resumen", () => {
    expect(LIMITES_SERVIDOR.EventoDetalle.nombre).to.deep.equal(
      LIMITES_SERVIDOR.EventoResumen.nombre,
    );
  });

  it("también los del hub", () => {
    expect(LIMITES_SERVIDOR.Suscripcion.mercados).to.deep.equal({
      elementosMaximos: 100,
    });
  });
});
