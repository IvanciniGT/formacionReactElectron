import { expect } from "chai";
import {
  combinar,
  type DocumentoAsyncApi,
  type DocumentoOpenApi,
} from "../../scripts/combinar.js";

const OPENAPI: DocumentoOpenApi = {
  openapi: "3.1.0",
  components: { schemas: { Id: { type: "string" } } },
};

const asyncapi = (
  schemas: DocumentoAsyncApi["components"]["schemas"],
): DocumentoAsyncApi => ({
  components: {
    ...(schemas ? { schemas } : {}),
    messages: {
      Cancelar: {
        name: "Cancelar",
        payload: {
          type: "object",
          properties: {
            eventoId: { $ref: "./openapi.yaml#/components/schemas/Id" },
          },
        },
      },
    },
  },
});

describe("combinar", () => {
  it("añade los esquemas del hub y sus mensajes, como Mensaje<Nombre>", () => {
    const { components } = combinar(
      OPENAPI,
      asyncapi({ Suscripcion: { type: "object" } }),
    );
    expect(Object.keys(components.schemas)).to.deep.equal([
      "Id",
      "Suscripcion",
      "MensajeCancelar",
    ]);
  });

  it("las referencias a openapi.yaml pasan a ser del propio documento", () => {
    const { components } = combinar(OPENAPI, asyncapi(undefined));
    expect(components.schemas["MensajeCancelar"]?.properties).to.deep.equal({
      eventoId: { $ref: "#/components/schemas/Id" },
    });
  });

  it("deja igual lo que no es una referencia, también dentro de listas", () => {
    const { components } = combinar(
      OPENAPI,
      asyncapi({ Estado: { type: "string", enum: ["a", "b"] } }),
    );
    expect(components.schemas["Estado"]).to.deep.equal({
      type: "string",
      enum: ["a", "b"],
    });
  });

  it("falla si los dos ficheros definen el mismo esquema", () => {
    expect(() =>
      combinar(OPENAPI, asyncapi({ Id: { type: "number" } })),
    ).to.throw("asyncapi.yaml y openapi.yaml definen los mismos esquemas: Id.");
  });
});
