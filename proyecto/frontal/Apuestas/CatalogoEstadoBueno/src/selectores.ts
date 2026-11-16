// Cómo se lee el estado del catálogo. Reciben el estado entero del store en que esté
// inyectado, pero solo saben de su clave.
import { createSelector } from "@reduxjs/toolkit";
import type { GrupoMercados } from "@apuestas-deportivas/catalogo-servicios-api";
import { inicialCatalogo, type EstadoConCatalogo } from "./estado.js";

// La parte del catálogo. Sin inyectar todavía, se lee como recién creada: lo mismo que hacen
// los slices de RTK inyectados con combineSlices.
export const seleccionarCatalogo = (estado: EstadoConCatalogo) =>
  estado.catalogo ?? inicialCatalogo;

// Del listado
export const seleccionarEventos = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).listado.eventos;
export const seleccionarCargaCatalogo = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).listado.carga;
export const seleccionarErrorCatalogo = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).listado.error;

// Del evento abierto

// Siempre la misma lista vacía: un [] nuevo en cada llamada haría que el componente que lo
// lee se volviera a pintar con cualquier acción.
const SIN_GRUPOS: readonly GrupoMercados[] = [];

export const seleccionarEvento = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).evento.detalle;
export const seleccionarCargaEvento = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).evento.carga;
export const seleccionarGrupos = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).evento.detalle?.grupos ?? SIN_GRUPOS;
export const seleccionarMercados = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).evento.mercados;
export const seleccionarEnVivo = (estado: EstadoConCatalogo) =>
  seleccionarCatalogo(estado).evento.enVivo;

// Derivado y memorizado: solo da una lista nueva si cambian los mercados.
export const seleccionarMercadosConApuestas = createSelector(
  [seleccionarMercados],
  (mercados) => mercados.filter((m) => m.seAdmitenApuestas),
);
