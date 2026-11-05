import { createSelector } from "@reduxjs/toolkit";
import type { GrupoMercados } from "@apuestas-deportivas/catalogo-servicios-api";
import type { Estado } from "../estado.js";

// Siempre la misma lista vacía: un [] nuevo en cada llamada haría que el componente que lo
// lee se volviera a pintar con cualquier evento.
const SIN_GRUPOS: readonly GrupoMercados[] = [];

export const seleccionarEventos = (estado: Estado) => estado.catalogo.eventos;
export const seleccionarCargaCatalogo = (estado: Estado) =>
  estado.catalogo.carga;

export const seleccionarEvento = (estado: Estado) => estado.evento.detalle;
export const seleccionarCargaEvento = (estado: Estado) => estado.evento.carga;
export const seleccionarGrupos = (estado: Estado) =>
  estado.evento.detalle?.grupos ?? SIN_GRUPOS;
export const seleccionarMercados = (estado: Estado) => estado.evento.mercados;
export const seleccionarEnVivo = (estado: Estado) => estado.evento.enVivo;

// Derivado y memorizado: solo da una lista nueva si cambian los mercados.
export const seleccionarMercadosConApuestas = createSelector(
  [seleccionarMercados],
  (mercados) => mercados.filter((m) => m.seAdmitenApuestas),
);
