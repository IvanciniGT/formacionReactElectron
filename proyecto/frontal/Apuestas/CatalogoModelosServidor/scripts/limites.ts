// Los límites de cada campo según el contrato (longitudes, patrón, mínimo, decimales), como
// constantes. Son los del servidor: el frontal tiene los suyos, que puede decidir distintos,
// y su detector de divergencias avisa de en qué no coinciden.
import type { Esquema, Esquemas } from "./combinar.js";

export interface Limite {
  longitudMinima?: number;
  longitudMaxima?: number;
  patron?: string;
  mayorQue?: number;
  decimales?: number;
  elementosMaximos?: number;
  invariante?: string;
}

export type Limites = Record<string, Record<string, Limite>>;

// Un campo puede apuntar a un esquema común (Cuota, Id…): lo suyo prevalece sobre el común.
function resolver(campo: Esquema, esquemas: Esquemas): Esquema {
  const nombre = campo.$ref?.split("/").at(-1);
  const comun = nombre ? esquemas[nombre] : undefined;
  return { ...(comun ?? {}), ...campo };
}

function limite(campo: Esquema): Limite | undefined {
  const l: Limite = {};
  if (campo.minLength !== undefined) l.longitudMinima = campo.minLength;
  if (campo.maxLength !== undefined) l.longitudMaxima = campo.maxLength;
  if (campo.pattern !== undefined) l.patron = campo.pattern;
  if (campo.exclusiveMinimum !== undefined) l.mayorQue = campo.exclusiveMinimum;
  if (campo["x-decimales"] !== undefined) l.decimales = campo["x-decimales"];
  if (campo.maxItems !== undefined) l.elementosMaximos = campo.maxItems;
  // Un campo que solo tiene invariante (id, fecha, estado) ya lo describe su tipo.
  if (Object.keys(l).length === 0) return undefined;
  if (campo["x-invariante"] !== undefined) l.invariante = campo["x-invariante"];
  return l;
}

// Los campos de un esquema, también los que hereda por allOf (EventoDetalle de
// EventoResumen) o los del esquema al que solo apunta (MensajeSuscribir).
function propiedades(esquema: Esquema, esquemas: Esquemas): Esquemas {
  const nombre = esquema.$ref?.split("/").at(-1);
  const apuntado = nombre ? esquemas[nombre] : undefined;
  const partes = Array.isArray(esquema["allOf"])
    ? (esquema["allOf"] as Esquema[])
    : [];
  return Object.assign(
    {},
    apuntado ? propiedades(apuntado, esquemas) : {},
    ...partes.map((parte) => propiedades(parte, esquemas)),
    esquema.properties,
  ) as Esquemas;
}

// Por esquema y campo. Los esquemas sin propiedades (Id, Cuota…) no salen: sus límites
// aparecen en los campos que los usan.
export function extraerLimites(esquemas: Esquemas): Limites {
  const limites: Limites = {};
  for (const [nombre, esquema] of Object.entries(esquemas))
    for (const [campo, definicion] of Object.entries(
      propiedades(esquema, esquemas),
    )) {
      const l = limite(resolver(definicion, esquemas));
      if (l) (limites[nombre] ??= {})[campo] = l;
    }
  return limites;
}

// JSON con las claves sin comillas: son identificadores, y así se lee como TypeScript.
export function comoLiteral(valor: unknown): string {
  return JSON.stringify(valor, null, 2).replace(/^(\s*)"(\w+)":/gm, "$1$2:");
}
