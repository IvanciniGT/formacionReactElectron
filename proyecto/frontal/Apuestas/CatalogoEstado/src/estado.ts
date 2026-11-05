// La forma del estado: un bloque por slice. Lo que se guarda son los hechos (lo que dijo el
// servidor y lo que eligió el jugador); lo que se calcula a partir de ellos está en los
// selectores.
import type {
  Evento,
  EventoDetalle,
  EstadoEventoFinal,
  FiltroEventos,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";

// Cómo va una petición al servicio.
export type EstadoCarga = "inactivo" | "cargando" | "listo" | "error";

// Bloque «catalogo»: la lista de eventos que se está viendo.
export interface EstadoCatalogo {
  filtro: FiltroEventos;
  eventos: Evento[];
  carga: EstadoCarga;
  error?: string;
}

// Bloque «evento»: el evento que el jugador tiene abierto, con el grupo de mercados que
// está viendo, y todo al día con los cambios en tiempo real.
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

export interface Estado {
  catalogo: EstadoCatalogo;
  evento: EstadoEvento;
}
