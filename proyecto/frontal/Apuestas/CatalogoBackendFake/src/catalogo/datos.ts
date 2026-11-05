import type { DatosDePrueba } from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import { readFileSync } from "node:fs";

// Los datos con los que arranca el fake son los del TCK, y su forma también: son los que
// esperan sus escenarios, y el TCK tiene que poder cargarlos igual en el backend de verdad.
// Así hay un solo catálogo de prueba, y no dos copias que acaban separándose.
//
// No es la forma del contrato: es lo mínimo para describir un catálogo a mano. El fake
// calcula lo demás (grupos, mercado principal, cuota inicial, tendencia, marca).
export type DatosCatalogo = DatosDePrueba;
export type EventoDatos = DatosCatalogo["eventos"][number];
export type MercadoDatos = EventoDatos["mercados"][number];
export type SeleccionDatos = MercadoDatos["selecciones"][number];
export type EstadoEventoDatos = EventoDatos["estado"];
export type EstadoMercadoDatos = MercadoDatos["estado"];

export function leerDatos(ruta: string | URL): DatosCatalogo {
  return JSON.parse(readFileSync(ruta, "utf8")) as DatosCatalogo;
}

// Donde npm haya instalado el TCK: en este node_modules, en el de la raíz, o en otro sitio.
export const RUTA_DATOS_EJEMPLO = new URL(
  import.meta
    .resolve("@apuestas-deportivas/catalogo-servicios-api-pruebas/datos/catalogo.json"),
);
