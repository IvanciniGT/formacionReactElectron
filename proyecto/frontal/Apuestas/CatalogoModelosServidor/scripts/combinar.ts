// Junta openapi.yaml y asyncapi.yaml en un solo documento OpenAPI, para que openapi-typescript
// genere también los mensajes del hub. No hay un generador de AsyncAPI a TypeScript que no
// arrastre medio mundo, y no hace falta: los mensajes ya son JSON Schema, y casi todo lo que
// usan son esquemas de openapi.yaml.

export interface Esquema {
  readonly $ref?: string;
  readonly properties?: Readonly<Record<string, Esquema>>;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly exclusiveMinimum?: number;
  readonly "x-decimales"?: number;
  readonly maxItems?: number;
  readonly "x-invariante"?: string;
  readonly [otra: string]: unknown;
}

export type Esquemas = Readonly<Record<string, Esquema>>;

export interface DocumentoOpenApi {
  readonly components: { readonly schemas: Esquemas };
  readonly [otra: string]: unknown;
}

export interface DocumentoAsyncApi {
  readonly components: {
    readonly schemas?: Esquemas;
    readonly messages: Readonly<
      Record<string, { readonly name: string; readonly payload: Esquema }>
    >;
  };
}

// asyncapi.yaml apunta a los esquemas de openapi.yaml por fichero; en el documento único,
// son del mismo.
const REF_EXTERNA = /^\.\/openapi\.yaml#/;

function sinRefsExternas(valor: unknown): unknown {
  if (Array.isArray(valor)) return valor.map(sinRefsExternas);
  if (valor === null || typeof valor !== "object") return valor;
  return Object.fromEntries(
    Object.entries(valor).map(([clave, v]) => [
      clave,
      clave === "$ref" && typeof v === "string"
        ? v.replace(REF_EXTERNA, "#")
        : sinRefsExternas(v),
    ]),
  );
}

// Los mensajes se llaman Mensaje<Nombre>: así no chocan con un esquema y se sabe de dónde
// salen.
export function combinar(
  openapi: DocumentoOpenApi,
  asyncapi: DocumentoAsyncApi,
): DocumentoOpenApi {
  const delHub: Record<string, Esquema> = {};
  for (const [nombre, esquema] of Object.entries(
    asyncapi.components.schemas ?? {},
  ))
    delHub[nombre] = esquema;
  for (const mensaje of Object.values(asyncapi.components.messages))
    delHub[`Mensaje${mensaje.name}`] = mensaje.payload;

  const repetidos = Object.keys(delHub).filter(
    (nombre) => nombre in openapi.components.schemas,
  );
  if (repetidos.length > 0)
    throw new Error(
      `asyncapi.yaml y openapi.yaml definen los mismos esquemas: ${repetidos.join(", ")}.`,
    );

  return {
    ...openapi,
    components: {
      ...openapi.components,
      schemas: {
        ...openapi.components.schemas,
        ...(sinRefsExternas(delHub) as Esquemas),
      },
    },
  };
}
