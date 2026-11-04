import { readFileSync } from "node:fs";

// La forma del fichero de datos (datos/eventos.json). No es la del contrato: es lo mínimo
// para describir un catálogo a mano. El fake calcula lo demás (grupos, mercado
// principal, cuota inicial, tendencia, marca).

export type EstadoEventoDatos =
  | "programado"
  | "enJuego"
  | "interrumpido"
  | "finalizado"
  | "aplazado"
  | "cancelado";

export type EstadoMercadoDatos = "abierto" | "suspendido" | "cerrado";

export interface SeleccionDatos {
  readonly id: string;
  readonly descripcion: string;
  readonly cuota: number;
}

export interface MercadoDatos {
  readonly id: string;
  readonly tipo: string;
  readonly grupo: string;
  readonly descripcion: string;
  readonly estado: EstadoMercadoDatos;
  readonly principal?: boolean;
  readonly selecciones: readonly SeleccionDatos[];
}

export interface EventoDatos {
  readonly id: string;
  readonly nombre: string;
  readonly tipoId: string;
  readonly comienzo: string;
  readonly estado: EstadoEventoDatos;
  readonly mercados: readonly MercadoDatos[];
}

export interface DatosCatalogo {
  readonly grupos: Readonly<Record<string, string>>;
  readonly tipos: readonly { readonly id: string; readonly nombre: string }[];
  readonly eventos: readonly EventoDatos[];
}

export function leerDatos(ruta: string | URL): DatosCatalogo {
  return JSON.parse(readFileSync(ruta, "utf8")) as DatosCatalogo;
}

export const RUTA_DATOS_EJEMPLO = new URL(
  "../../datos/eventos.json",
  import.meta.url,
);
