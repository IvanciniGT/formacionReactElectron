// Las operaciones del catálogo, nombradas con un verbo en infinitivo: solicitarEvento,
// recibirEvento… Quien las emite no sabe quién las atiende (el reducer, los efectos, otro
// slice…). RTK recomienda nombrarlas como hechos en pasado; aquí se sigue la convención del
// curso, la de las operaciones del modelo de estado.
import { createAction } from "@reduxjs/toolkit";
import type {
  CambioEnEvento,
  Evento,
  EventoDetalle,
  FiltroEventos,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";

// Las del listado
export const cambiarFiltro = createAction<FiltroEventos>(
  "catalogo/cambiarFiltro",
);
export const solicitarListadoEventos = createAction(
  "catalogo/solicitarListadoEventos",
);
export const recibirListadoEventos = createAction<readonly Evento[]>(
  "catalogo/recibirListadoEventos",
);
export const recibirErrorListadoEventos = createAction<string>(
  "catalogo/recibirErrorListadoEventos",
);

// Lo que llega en tiempo real y cambia el estado. «recargar» no está: no cambia nada, sino
// que obliga a volver a pedir el evento, y eso lo hace el efecto.
export type CambioAplicable = Exclude<CambioEnEvento, { tipo: "recargar" }>;

// Las del evento abierto
export const solicitarEvento = createAction<string>("evento/solicitarEvento");
export const recibirEvento = createAction<EventoDetalle>(
  "evento/recibirEvento",
);
export const recibirErrorEvento = createAction<string>(
  "evento/recibirErrorEvento",
);
export const cerrarEvento = createAction("evento/cerrarEvento");

// Las de su grupo de mercados
export const abrirGrupo = createAction<string>("evento/abrirGrupo");
export const recibirMercados = createAction<readonly Mercado[]>(
  "evento/recibirMercados",
);
export const recibirErrorMercados = createAction<string>(
  "evento/recibirErrorMercados",
);

// Las del tiempo real. terminarEnVivo sin motivo: terminó porque tocaba (el evento dejó de
// verse, o se recarga).
export const iniciarEnVivo = createAction("evento/iniciarEnVivo");
export const terminarEnVivo = createAction<string | undefined>(
  "evento/terminarEnVivo",
);
export const recibirCambio = createAction<CambioAplicable>(
  "evento/recibirCambio",
);

// Todas las acciones del slice juntas, para consultarlas o tiparlas: AccionCatalogo es
// cualquiera de ellas.
export const accionesCatalogo = {
  cambiarFiltro,
  solicitarListadoEventos,
  recibirListadoEventos,
  recibirErrorListadoEventos,
  solicitarEvento,
  recibirEvento,
  recibirErrorEvento,
  cerrarEvento,
  abrirGrupo,
  recibirMercados,
  recibirErrorMercados,
  iniciarEnVivo,
  terminarEnVivo,
  recibirCambio,
};
export type AccionCatalogo = ReturnType<
  (typeof accionesCatalogo)[keyof typeof accionesCatalogo]
>;
