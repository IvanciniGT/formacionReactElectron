// Lo que pasa en el catálogo. Son eventos: no dicen qué hacer, sino qué ha ocurrido, y los
// escucha quien quiera (el reducer, los efectos, otro slice…).
import { createAction } from "@reduxjs/toolkit";
import type {
  CambioEnEvento,
  Evento,
  EventoDetalle,
  FiltroEventos,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";

// Las del listado
export const filtroCambiado = createAction<FiltroEventos>(
  "catalogo/filtroCambiado",
);
export const eventosPedidos = createAction("catalogo/eventosPedidos");
export const eventosCargados = createAction<readonly Evento[]>(
  "catalogo/eventosCargados",
);
export const eventosFallidos = createAction<string>("catalogo/eventosFallidos");

// Lo que llega en tiempo real y cambia el estado. «recargar» no está: no cambia nada, sino
// que obliga a volver a pedir el evento, y eso lo hace el efecto.
export type CambioAplicable = Exclude<CambioEnEvento, { tipo: "recargar" }>;

// Las del evento abierto
export const eventoPedido = createAction<string>("evento/eventoPedido");
export const eventoCargado = createAction<EventoDetalle>(
  "evento/eventoCargado",
);
export const eventoFallido = createAction<string>("evento/eventoFallido");
export const eventoCerrado = createAction("evento/eventoCerrado");

// Las de su grupo de mercados
export const grupoAbierto = createAction<string>("evento/grupoAbierto");
export const mercadosCargados = createAction<readonly Mercado[]>(
  "evento/mercadosCargados",
);
export const mercadosFallidos = createAction<string>("evento/mercadosFallidos");

// Las del tiempo real. enVivoTerminado sin motivo: terminó porque tocaba (el evento dejó de
// verse, o se recarga).
export const enVivoIniciado = createAction("evento/enVivoIniciado");
export const enVivoTerminado = createAction<string | undefined>(
  "evento/enVivoTerminado",
);
export const cambioRecibido = createAction<CambioAplicable>(
  "evento/cambioRecibido",
);

// Todas las acciones del slice juntas, para consultarlas o tiparlas: AccionCatalogo es
// cualquiera de ellas.
export const accionesCatalogo = {
  filtroCambiado,
  eventosPedidos,
  eventosCargados,
  eventosFallidos,
  eventoPedido,
  eventoCargado,
  eventoFallido,
  eventoCerrado,
  grupoAbierto,
  mercadosCargados,
  mercadosFallidos,
  enVivoIniciado,
  enVivoTerminado,
  cambioRecibido,
};
export type AccionCatalogo = ReturnType<
  (typeof accionesCatalogo)[keyof typeof accionesCatalogo]
>;
