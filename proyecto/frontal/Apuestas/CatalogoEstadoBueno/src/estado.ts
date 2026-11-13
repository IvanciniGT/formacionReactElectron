// El estado del slice «catalogo». Tiene dos propiedades: «listado», la lista de eventos que se
// está viendo, y «evento», el que el jugador tiene abierto. Lo que se guarda son los hechos;
// lo que se calcula a partir de ellos está en los selectores.
import type {
  Evento,
  EventoDetalle,
  EstadoEventoFinal,
  FiltroEventos,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";

// Cómo va una petición al servicio.
export type EstadoCarga = "inactivo" | "cargando" | "listo" | "error";

// Propiedad «listado»: la lista de eventos que se está viendo, con el filtro que se le aplica.
export interface EstadoListado {
  filtro: FiltroEventos;
  eventos: Evento[];
  carga: EstadoCarga;
  error?: string;
}

export const inicialListado: EstadoListado = {
  filtro: {},
  eventos: [],
  carga: "inactivo",
};

// Propiedad «evento»: el evento que el jugador tiene abierto, con el grupo de mercados que
// está viendo, todo al día con los cambios en tiempo real.
export interface EstadoEvento {
  id?: string;
  detalle?: EventoDetalle;
  carga: EstadoCarga;
  error?: string;
  // Si ha terminado mientras se veía (finalizado, aplazado, cancelado): llega en tiempo real
  // y el evento deja de verse.
  final?: EstadoEventoFinal;

  // El grupo abierto (su clave) y sus mercados, con sus selecciones.
  grupo?: string;
  mercados: Mercado[];
  cargaMercados: EstadoCarga;
  errorMercados?: string;

  // Si se están recibiendo los cambios en tiempo real, y por qué se dejaron de recibir.
  enVivo: boolean;
  errorEnVivo?: string;
}

export const inicialEvento: EstadoEvento = {
  carga: "inactivo",
  mercados: [],
  cargaMercados: "inactivo",
  enVivo: false,
};

// El estado del slice entero.
export interface EstadoCatalogo {
  listado: EstadoListado;
  evento: EstadoEvento;
}

export const inicialCatalogo: EstadoCatalogo = {
  listado: inicialListado,
  evento: inicialEvento,
};

// Lo único que el slice necesita del store en que se inyecte: su propia clave, que no está
// hasta que se inyecta. Así no depende de qué otros slices haya.
export interface EstadoConCatalogo {
  catalogo?: EstadoCatalogo;
}
