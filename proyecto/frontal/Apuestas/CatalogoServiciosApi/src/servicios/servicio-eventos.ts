import type { Observable } from "rxjs";
import type { ConfiguracionServicioEventos } from "../configuracion/configuracion.js";
import type {
  CambioEnEvento,
  EventoDetalle,
  FiltroEventos,
  Id,
  Marca,
  MercadosDeGrupo,
  PaginaEventos,
  TipoEvento,
} from "../modelos/modelos.js";

// Todos los métodos pueden lanzar ServicioNoDisponibleError: el servicio no responde, tarda
// más de lo configurado o falla por su cuenta. Reintentar puede servir. Los demás errores
// son de lo que se pide, y reintentar lo mismo no sirve.
//
// Lo único que un frontal sabe del catálogo. Las consultas devuelven Promise, que es lo que
// espera React Query; los cambios en tiempo real, Observable, que se cancela con
// unsubscribe. Quién lo implementa (fetch + SignalR, datos simulados, un doble de prueba)
// lo decide quien lo inyecta.
export interface ServicioEventos {
  /** @throws ServicioNoDisponibleError */
  listarTipos(): Promise<readonly TipoEvento[]>;

  /**
   * @throws PeticionIncorrectaError si el filtro no es válido (una página o un tamaño
   * fuera de rango, ver el contrato).
   * @throws ServicioNoDisponibleError
   */
  listarEventos(filtro?: FiltroEventos): Promise<PaginaEventos>;

  /**
   * @throws EventoNoEncontradoError si no existe o no se puede ver.
   * @throws ServicioNoDisponibleError
   */
  obtenerEvento(eventoId: Id): Promise<EventoDetalle>;

  /**
   * @throws EventoNoEncontradoError si el evento no existe o no se puede ver.
   * @throws PeticionIncorrectaError si la clave del grupo no es válida.
   * @throws ServicioNoDisponibleError
   */
  listarMercados(eventoId: Id, grupo: string): Promise<MercadosDeGrupo>;

  /**
   * Los cambios del evento desde la marca indicada: la de la respuesta con la que se
   * cargó. Si se pierde la conexión, se recupera sola sin perder cambios. Termina cuando
   * el evento deja de verse, o tras un «recargar». Con mercados, solo los de esos mercados.
   *
   * No lanza nada al llamarlo: los errores terminan el Observable (su error).
   * - EventoNoEncontradoError: el evento no existe o ya no se ve.
   * - PeticionIncorrectaError: la suscripción no cumple el contrato (más de 100 mercados).
   * - SuscripcionDuplicadaError: ya hay una suscripción abierta a ese evento.
   * - DemasiadasSuscripcionesError: ya se siguen todos los eventos que admite el servidor.
   * - ServicioNoDisponibleError: se ha perdido la conexión y no se ha podido recuperar.
   */
  cambios(
    eventoId: Id,
    desde: Marca,
    mercados?: readonly Id[],
  ): Observable<CambioEnEvento>;

  /**
   * Libera lo que tenga abierto (conexiones, temporizadores) y termina las suscripciones.
   * Quien crea el servicio lo cierra cuando ya no lo necesita.
   */
  cerrar(): Promise<void>;
}

// Cómo se obtiene un ServicioEventos: cada implementación exporta una función con esta
// forma, y la aplicación elige cuál inyectar. Recibe la configuración y la comprueba con
// comprobarConfiguracion.
/** @throws ConfiguracionNoValidaError si la configuración no es válida. */
export type CrearServicioEventos = (
  configuracion: ConfiguracionServicioEventos,
) => ServicioEventos;
