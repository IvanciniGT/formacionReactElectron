// Solo para los {@link LIMITES…} de los TSDoc: así el editor los enlaza al pasar el ratón.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LIMITES } from "./limites.js";

// Los modelos con los que trabaja el frontal. No son los del servidor: aquí las fechas son
// Date, los estados son uniones de literales y hay datos derivados que la pantalla necesita
// (enDirecto, seAdmitenApuestas, hayMas). Lo que manda el servidor y cómo se convierte a
// esto es asunto de la implementación.
//
// Cada campo de texto o de cuota apunta, en su TSDoc, a LIMITES: lo que puede llegar en él
// según el contrato. Es un hecho, no una regla de presentación: cómo lo enseña cada frontal
// (truncar, con cuántos caracteres…) lo decide cada uno.

export type Id = string;

// Opaca: el frontal la guarda y la devuelve tal cual para suscribirse a los cambios.
export type Marca = string;

// Mayor que 1 y con 2 decimales como mucho. Un number basta: con 2 decimales, comparar
// la cuota que vio el jugador con la vigente da el resultado exacto.
export type Cuota = number;

export type EstadoEvento = "programado" | "enJuego" | "interrumpido";

// Los estados con los que un evento deja de verse. Solo llegan como cambio en tiempo real.
export type EstadoEventoFinal = "finalizado" | "aplazado" | "cancelado";

export type EstadoMercado = "abierto" | "suspendido";

export type Tendencia = "sube" | "baja" | "igual";

export interface TipoEvento {
  readonly id: Id;
  /** Ver {@link LIMITES.TipoEvento.nombre}. */
  readonly nombre: string;
}

export interface Seleccion {
  readonly id: Id;
  /** Ver {@link LIMITES.Seleccion.descripcion}. */
  readonly descripcion: string;
  /** Ver {@link LIMITES.Seleccion.cuota}. */
  readonly cuota: Cuota;
  /** Ver {@link LIMITES.Seleccion.cuotaInicial}. */
  readonly cuotaInicial: Cuota;
  readonly tendencia: Tendencia;
}

export interface Mercado {
  readonly id: Id;
  /** Ver {@link LIMITES.Mercado.tipo}. */
  readonly tipo: string;
  /** Ver {@link LIMITES.Mercado.grupo}. */
  readonly grupo: string;
  /** Ver {@link LIMITES.Mercado.descripcion}. */
  readonly descripcion: string;
  readonly estado: EstadoMercado;
  // Un mercado suspendido se ve, pero no se puede apostar en él.
  readonly seAdmitenApuestas: boolean;
  readonly selecciones: readonly Seleccion[];
}

export interface Evento {
  readonly id: Id;
  /** Ver {@link LIMITES.Evento.nombre}. */
  readonly nombre: string;
  readonly comienzo: Date;
  readonly tipo: TipoEvento;
  readonly estado: EstadoEvento;
  readonly enDirecto: boolean;
  // El que se enseña en un listado (en un partido, el 1X2). Puede no haberlo todavía.
  readonly mercadoPrincipal: Mercado | null;
}

export interface GrupoMercados {
  /** Ver {@link LIMITES.GrupoMercados.clave}. */
  readonly clave: string;
  /** Ver {@link LIMITES.GrupoMercados.nombre}. */
  readonly nombre: string;
  readonly numeroMercados: number;
}

export interface EventoDetalle extends Evento {
  readonly grupos: readonly GrupoMercados[];
  readonly marca: Marca;
}

export interface PaginaEventos {
  readonly eventos: readonly Evento[];
  readonly pagina: number;
  readonly tamano: number;
  readonly total: number;
  readonly hayMas: boolean;
  readonly marca: Marca;
}

export interface MercadosDeGrupo {
  readonly mercados: readonly Mercado[];
  readonly marca: Marca;
}

export interface FiltroEventos {
  readonly tipo?: Id;
  readonly estado?: EstadoEvento;
  readonly desde?: Date;
  readonly hasta?: Date;
  readonly pagina?: number;
  readonly tamano?: number;
}

export interface CambioDeCuota {
  readonly seleccionId: Id;
  readonly mercadoId: Id;
  /** Ver {@link LIMITES.CambioDeCuota.cuota}. */
  readonly cuota: Cuota;
  readonly tendencia: Tendencia;
}

export interface CambioDeMercado {
  readonly mercadoId: Id;
  // null: el mercado ya no se ve (se ha cerrado o anulado) y hay que quitarlo de la pantalla.
  readonly estado: EstadoMercado | null;
}

// Lo que llega de un evento en tiempo real. Unión discriminada por «tipo»: con un switch
// sobre él, el compilador obliga a tratar todos los casos (ver comprobarExhaustivo).
export type CambioEnEvento =
  | {
      readonly tipo: "cuotas";
      readonly marca: Marca;
      readonly cuotas: readonly CambioDeCuota[];
      readonly mercados: readonly CambioDeMercado[];
    }
  | {
      readonly tipo: "estado";
      readonly marca: Marca;
      readonly estado: EstadoEvento | EstadoEventoFinal;
    }
  | {
      // La marca era demasiado antigua: hay que volver a cargar el evento y suscribirse con
      // la marca nueva. Después de esto, la suscripción termina.
      readonly tipo: "recargar";
    };
