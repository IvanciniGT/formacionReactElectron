import type { components } from "../generado/contrato.js";

// Los modelos del API REST, tal cual los manda el servidor, con nombre para no escribir
// components["schemas"][…] en cada sitio. Terminan en Servidor para que nunca se
// confundan con los del frontal, que se llaman igual y no son lo mismo.
type Esquemas = components["schemas"];

export type IdServidor = Esquemas["Id"];
export type MarcaServidor = Esquemas["Marca"];
export type CuotaServidor = Esquemas["Cuota"];
export type TendenciaServidor = Esquemas["Tendencia"];
export type EstadoEventoServidor = Esquemas["EstadoEvento"];
export type EstadoMercadoServidor = Esquemas["EstadoMercado"];
export type TipoEventoServidor = Esquemas["TipoEvento"];
export type SeleccionServidor = Esquemas["Seleccion"];
export type MercadoServidor = Esquemas["Mercado"];
export type GrupoMercadosServidor = Esquemas["GrupoMercados"];
export type EventoResumenServidor = Esquemas["EventoResumen"];
export type EventoDetalleServidor = Esquemas["EventoDetalle"];
export type MercadosDeGrupoServidor = Esquemas["MercadosDeGrupo"];
export type PaginaEventosServidor = Esquemas["PaginaEventos"];
export type CambioDeCuotaServidor = Esquemas["CambioDeCuota"];
export type CambioDeMercadoServidor = Esquemas["CambioDeMercado"];
export type CambiosDeCuotasServidor = Esquemas["CambiosDeCuotas"];
export type ProblemaServidor = Esquemas["Problema"];
// Los mismos en REST (ProblemaServidor.codigo) y en el texto de los errores del hub.
export type CodigoProblemaServidor = Esquemas["CodigoProblema"];
