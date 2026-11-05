// El día 0 de los modelos del frontal: una primera versión escrita a partir del contrato,
// para no empezar de cero. Se ejecuta una vez. Después los modelos son del frontal y se
// cambian a mano (nombres propios, Date, campos calculados…); el detector de divergencias
// vigila en qué se separan del servidor.
//
// Traduce cada esquema a lo más natural en el frontal: readonly en todo, las fechas como
// Date, los enum como uniones de literales, la herencia (allOf) como extends y lo que puede
// ser null (oneOf con null) como T | null.
import type { Correspondencia, Limites } from "../divergencias/comparar.js";

export interface Esquema {
  readonly $ref?: string;
  readonly type?: string;
  readonly format?: string;
  readonly enum?: readonly string[];
  readonly description?: string;
  readonly properties?: Readonly<Record<string, Esquema>>;
  readonly required?: readonly string[];
  readonly items?: Esquema;
  readonly oneOf?: readonly Esquema[];
  readonly anyOf?: readonly Esquema[];
  readonly allOf?: readonly Esquema[];
}

// Lo que no es un modelo del frontal, con el porqué.
export const EXCLUIDOS: Readonly<Record<string, string>> = {
  Problema:
    "El error HTTP: la implementación lo traduce a las clases de errores.ts.",
  CodigoProblema:
    "Los códigos de error del servidor: en el frontal son las clases de errores.ts.",
  Suscripcion: "Lo que el frontal manda al hub: es cosa de la implementación.",
};
// Los mensajes del hub (Mensaje<Nombre>) son envoltorios de otros esquemas.
const ES_MENSAJE = /^Mensaje[A-Z]/;

export interface Inicializacion {
  readonly modelos: string;
  readonly limites: string;
  readonly correspondencias: string;
  // Lo mismo, como datos: para comprobar que el día 0 no tiene divergencias.
  readonly datos: {
    readonly correspondencias: readonly Correspondencia[];
    readonly limites: Limites;
  };
}

const nombreDe = (ref: string) => ref.slice(ref.lastIndexOf("/") + 1);
const esObjeto = (e: Esquema) =>
  e.properties !== undefined || e.allOf !== undefined;

function tipo(e: Esquema): string {
  if (e.$ref) return nombreDe(e.$ref);
  const alternativas = e.oneOf ?? e.anyOf;
  if (alternativas) return alternativas.map(tipo).join(" | ");
  if (e.enum) return e.enum.map((v) => JSON.stringify(v)).join(" | ");
  switch (e.type) {
    case "null":
      return "null";
    case "string":
      return e.format === "date-time" ? "Date" : "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "array": {
      const elemento = e.items ? tipo(e.items) : "unknown";
      return `readonly ${elemento.includes(" ") ? `(${elemento})` : elemento}[]`;
    }
    default:
      return e.properties
        ? `{ ${campos(e.properties, e.required, undefined, undefined, "").join(" ")} }`
        : "unknown";
  }
}

function comentario(lineas: readonly string[], sangria: string): string[] {
  // Ninguna o una línea: en una sola, /** … */.
  if (lineas.length <= 1) return lineas.map((l) => `${sangria}/** ${l} */`);
  return [
    `${sangria}/**`,
    ...lineas.map((l) => `${sangria} * ${l}`.trimEnd()),
    `${sangria} */`,
  ];
}

function descripcion(e: Esquema): string[] {
  return (e.description ?? "")
    .trim()
    .split("\n")
    .filter((l, i, todas) => l !== "" || i < todas.length - 1);
}

function campos(
  propiedades: Readonly<Record<string, Esquema>>,
  requeridos: readonly string[] | undefined,
  limites: Limites[string] | undefined,
  modelo: string | undefined,
  sangria = "  ",
): string[] {
  const obligatorios = new Set(requeridos);
  return Object.entries(propiedades).flatMap(([nombre, campo]) => {
    const doc = descripcion(campo);
    if (modelo && limites?.[nombre])
      doc.push(`Ver {@link LIMITES.${modelo}.${nombre}}.`);
    const opcional = obligatorios.has(nombre) ? "" : "?";
    return [
      ...comentario(doc, sangria),
      `${sangria}readonly ${nombre}${opcional}: ${tipo(campo)};`,
    ];
  });
}

function modelo(nombre: string, e: Esquema, limites: Limites): string {
  const doc = comentario(descripcion(e), "");
  if (!esObjeto(e))
    return [...doc, `export type ${nombre} = ${tipo(e)};`].join("\n");

  const partes = e.allOf ?? [e];
  const base = partes.flatMap((p) => (p.$ref ? [nombreDe(p.$ref)] : []));
  const propias = partes
    .filter((p) => !p.$ref)
    .reduce<{
      properties: Readonly<Record<string, Esquema>>;
      required: readonly string[];
    }>(
      (todo, p) => ({
        properties: { ...todo.properties, ...p.properties },
        required: [...todo.required, ...(p.required ?? [])],
      }),
      { properties: {}, required: [] },
    );
  const extiende = base.length > 0 ? ` extends ${base.join(", ")}` : "";
  return [
    ...doc,
    `export interface ${nombre}${extiende} {`,
    ...campos(propias.properties, propias.required, limites[nombre], nombre),
    "}",
  ].join("\n");
}

// JSON con las claves sin comillas: son identificadores, y así se lee como TypeScript.
const comoLiteral = (valor: unknown) =>
  JSON.stringify(valor, null, 2).replace(/^(\s*)"(\w+)":/gm, "$1$2:");

export function inicializar(
  esquemas: Readonly<Record<string, Esquema>>,
  limitesServidor: Limites,
): Inicializacion {
  const incluidos = Object.entries(esquemas).filter(
    ([nombre]) => EXCLUIDOS[nombre] === undefined && !ES_MENSAJE.test(nombre),
  );

  const limites: Record<string, Limites[string]> = {};
  for (const [nombre] of incluidos) {
    const deServidor = limitesServidor[nombre];
    if (deServidor) limites[nombre] = deServidor;
  }

  const correspondencias: Correspondencia[] = incluidos
    .filter(([, e]) => esObjeto(e))
    .map(([nombre]) => ({
      frontal: nombre,
      servidor: `components["schemas"]["${nombre}"]`,
      ...(limites[nombre] ? { esquema: nombre } : {}),
    }));

  const modelos = `// Día 0: generado del contrato por npm run inicializar-modelos. Desde aquí, es del
// frontal y se cambia a mano. Lo que se separe del servidor lo vigila npm run divergencias.

// Solo para los {@link LIMITES…} de los TSDoc: así el editor los enlaza al pasar el ratón.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LIMITES } from "./limites.js";

${incluidos.map(([nombre, e]) => modelo(nombre, e, limites)).join("\n\n")}
`;

  return {
    modelos,
    limites: `// Día 0: los límites del servidor, copiados. Desde aquí son del frontal: si decide otros,
// npm run divergencias avisa de en qué difieren.
//
// invariante: la anotación del dominio de la que sale, si sale de una.
export const LIMITES = ${comoLiteral(limites)} as const;
`,
    correspondencias: `import type { Correspondencia } from "./comparar.js";

// Día 0: cada modelo del frontal con el esquema del mismo nombre. Al renombrar un modelo o un
// campo, o al añadir uno calculado, se dice aquí, con su porqué.
export const CORRESPONDENCIAS: readonly Correspondencia[] = ${comoLiteral(correspondencias)};

// Modelos del frontal que no se corresponden con nada del servidor, con el porqué.
export const SIN_EQUIVALENTE: Readonly<Record<string, string>> = {};
`,
    datos: { correspondencias, limites },
  };
}
