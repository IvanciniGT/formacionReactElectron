import {
  comprobarConfiguracion,
  DemasiadasSuscripcionesError,
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  ServicioNoDisponibleError,
  SuscripcionDuplicadaError,
  type CambioEnEvento,
  type ConfiguracionServicioEventos,
  type EventoDetalle,
  type FiltroEventos,
  type Id,
  type Marca,
  type MercadosDeGrupo,
  type PaginaEventos,
  type ServicioEventos,
  type TipoEvento,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { Observable, type Subscriber } from "rxjs";
import { conexionSignalR } from "../conexion/conexion-signalr.js";
import type { ConexionTiempoReal } from "../conexion/conexion.js";
import {
  filtrarPorNivel,
  registradorDeConsola,
  type Registrador,
} from "../registro/registro.js";
import {
  aCambioDeCuotas,
  aCambioDeEstado,
  aEventoDetalle,
  aMercadosDeGrupo,
  aPaginaEventos,
  aParametros,
  aTipoEvento,
} from "../mappers/mappers.js";
import type {
  CambioDeEventoServidor,
  CambiosServidor,
  EventoDetalleServidor,
  MercadosDeGrupoServidor,
  PaginaEventosServidor,
  ProblemaServidor,
  RecargarServidor,
  SuscripcionServidor,
  TipoEventoServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";

// Los colaboradores del servicio. A diferencia de la configuración, tienen uno por defecto
// razonable; se sustituyen sobre todo en las pruebas.
export interface DependenciasServicioEventos {
  // Por defecto, el fetch del navegador o de Node.
  readonly fetch?: typeof fetch;
  // Por defecto, SignalR contra {urlBase}/v1/hubs/catalogo, con la configuración dada.
  readonly conexion?: ConexionTiempoReal;
  // Por defecto, console. Solo recibe lo que permita nivelDeRegistro.
  readonly registrador?: Registrador;
}

// Después de estos estados el evento deja de verse y el servidor cancela la suscripción.
const ESTADOS_FINALES = new Set(["finalizado", "aplazado", "cancelado"]);

interface Suscripcion {
  readonly eventoId: Id;
  readonly mercados: readonly Id[] | undefined;
  readonly suscriptor: Subscriber<CambioEnEvento>;
  // La de lo último recibido: con ella se vuelve a suscribir al reconectar sin perder nada.
  marca: Marca;
}

export class ServicioEventosHttp implements ServicioEventos {
  private readonly urlBase: string;
  private readonly tiempoMaximoPeticionMs: number;
  private readonly fetch: typeof fetch;
  private readonly conexion: ConexionTiempoReal;
  private readonly registro: Registrador;
  private readonly suscripciones = new Map<Id, Suscripcion>();
  private iniciando: Promise<void> | undefined;

  /** @throws ConfiguracionNoValidaError si la configuración no es válida. */
  constructor(
    configuracion: ConfiguracionServicioEventos,
    dependencias: DependenciasServicioEventos = {},
  ) {
    comprobarConfiguracion(configuracion);
    this.urlBase = configuracion.urlBase.replace(/\/+$/, "");
    this.tiempoMaximoPeticionMs = configuracion.tiempoMaximoPeticionMs;
    this.fetch = dependencias.fetch ?? globalThis.fetch.bind(globalThis);
    this.conexion = dependencias.conexion ?? conexionSignalR(configuracion);
    this.registro = filtrarPorNivel(
      dependencias.registrador ?? registradorDeConsola,
      configuracion.nivelDeRegistro,
    );

    // Una sola conexión para todos los eventos: cada mensaje dice de qué evento es.
    this.conexion.alRecibir("Cambios", (argumento) => {
      this.recibirCambios(argumento as CambiosServidor);
    });
    this.conexion.alRecibir("CambioDeEvento", (argumento) => {
      this.recibirCambioDeEvento(argumento as CambioDeEventoServidor);
    });
    this.conexion.alRecibir("Recargar", (argumento) => {
      this.recibirRecargar(argumento as RecargarServidor);
    });
    // SignalR no conserva las suscripciones de una conexión a la siguiente: al reconectar
    // hay que volver a pedirlas, cada una desde la última marca que recibió.
    this.conexion.alReconectar(() => {
      this.registro.informar(
        "Reconectado: se vuelven a pedir las suscripciones",
        {
          eventos: [...this.suscripciones.keys()],
        },
      );
      for (const suscripcion of this.suscripciones.values())
        this.suscribirEnServidor(suscripcion).catch((error: unknown) => {
          this.terminarConError(suscripcion, error);
        });
    });
    // Si SignalR se rinde (se agotan las esperas de reconexión), nadie va a mandar nada
    // más: las suscripciones abiertas terminan con error en vez de quedarse esperando, y la
    // siguiente suscripción vuelve a abrir la conexión. Al cerrar el servicio a propósito ya
    // no queda ninguna, así que esto no hace nada.
    this.conexion.alCerrar((error) => {
      this.iniciando = undefined;
      const perdida = new ServicioNoDisponibleError(
        "se ha perdido la conexión en tiempo real y no se ha podido recuperar",
        { cause: error },
      );
      for (const suscripcion of [...this.suscripciones.values()])
        this.terminarConError(suscripcion, perdida);
    });
  }

  // ------------------------------------------------------------------- REST

  async listarTipos(): Promise<readonly TipoEvento[]> {
    const tipos = await this.obtener<TipoEventoServidor[]>("/v1/tipos");
    return tipos.map(aTipoEvento);
  }

  async listarEventos(filtro?: FiltroEventos): Promise<PaginaEventos> {
    const parametros = aParametros(filtro).toString();
    const ruta = parametros ? `/v1/eventos?${parametros}` : "/v1/eventos";
    return aPaginaEventos(await this.obtener<PaginaEventosServidor>(ruta));
  }

  async obtenerEvento(eventoId: Id): Promise<EventoDetalle> {
    return aEventoDetalle(
      await this.obtener<EventoDetalleServidor>(
        `/v1/eventos/${encodeURIComponent(eventoId)}`,
        eventoId,
      ),
    );
  }

  async listarMercados(eventoId: Id, grupo: string): Promise<MercadosDeGrupo> {
    const ruta = `/v1/eventos/${encodeURIComponent(eventoId)}/mercados?${new URLSearchParams({ grupo }).toString()}`;
    return aMercadosDeGrupo(
      await this.obtener<MercadosDeGrupoServidor>(ruta, eventoId),
    );
  }

  // ------------------------------------------------------------ tiempo real

  cambios(
    eventoId: Id,
    desde: Marca,
    mercados?: readonly Id[],
  ): Observable<CambioEnEvento> {
    return new Observable<CambioEnEvento>((suscriptor) => {
      // El servidor guarda una suscripción por evento y conexión: una segunda sobre el
      // mismo evento sustituiría a la primera sin que esta se enterase. Si dos
      // componentes necesitan el mismo evento, que compartan el Observable (share()).
      if (this.suscripciones.has(eventoId)) {
        suscriptor.error(new SuscripcionDuplicadaError(eventoId));
        return;
      }
      const suscripcion: Suscripcion = {
        eventoId,
        mercados,
        suscriptor,
        marca: desde,
      };
      this.suscripciones.set(eventoId, suscripcion);

      this.asegurarConexion()
        .then(() => {
          // Si se canceló mientras se abría la conexión, ya no hay que suscribirse.
          if (this.suscripciones.get(eventoId) === suscripcion)
            return this.suscribirEnServidor(suscripcion);
          return undefined;
        })
        .catch((error: unknown) => {
          this.terminarConError(suscripcion, error);
        });

      return () => {
        // Si terminó por su cuenta (evento final, recargar, error), el servidor ya no la tiene.
        if (this.suscripciones.get(eventoId) !== suscripcion) return;
        this.suscripciones.delete(eventoId);
        this.conexion.invocar("Cancelar", { eventoId }).catch(() => {
          // Si la conexión ya no está, tampoco queda nada que cancelar en el servidor.
        });
      };
    });
  }

  // Cierra la conexión en tiempo real y termina todas las suscripciones.
  async cerrar(): Promise<void> {
    for (const suscripcion of [...this.suscripciones.values()]) {
      this.suscripciones.delete(suscripcion.eventoId);
      suscripcion.suscriptor.complete();
    }
    this.iniciando = undefined;
    await this.conexion.detener();
  }

  private asegurarConexion(): Promise<void> {
    this.iniciando ??= this.conexion.iniciar().catch((error: unknown) => {
      // Que la siguiente suscripción lo vuelva a intentar.
      this.iniciando = undefined;
      throw new ServicioNoDisponibleError(
        "no se ha podido abrir la conexión en tiempo real",
        { cause: error },
      );
    });
    return this.iniciando;
  }

  private async suscribirEnServidor(suscripcion: Suscripcion): Promise<void> {
    const argumento: SuscripcionServidor = {
      eventoId: suscripcion.eventoId,
      desde: suscripcion.marca,
      ...(suscripcion.mercados ? { mercados: suscripcion.mercados } : {}),
    };
    await this.conexion.invocar("Suscribir", argumento);
  }

  private recibirCambios(cambios: CambiosServidor): void {
    this.registro.depurar("Cambios recibidos", cambios);
    const suscripcion = this.suscripciones.get(cambios.eventoId);
    if (!suscripcion) return;
    suscripcion.marca = cambios.marca;
    suscripcion.suscriptor.next(aCambioDeCuotas(cambios));
  }

  private recibirCambioDeEvento(cambio: CambioDeEventoServidor): void {
    this.registro.depurar("Cambio de evento recibido", cambio);
    const suscripcion = this.suscripciones.get(cambio.eventoId);
    if (!suscripcion) return;
    suscripcion.marca = cambio.marca;
    if (ESTADOS_FINALES.has(cambio.estado))
      this.suscripciones.delete(cambio.eventoId);
    suscripcion.suscriptor.next(aCambioDeEstado(cambio));
    if (ESTADOS_FINALES.has(cambio.estado)) suscripcion.suscriptor.complete();
  }

  private recibirRecargar({ eventoId }: RecargarServidor): void {
    const suscripcion = this.suscripciones.get(eventoId);
    if (!suscripcion) return;
    this.suscripciones.delete(eventoId);
    suscripcion.suscriptor.next({ tipo: "recargar" });
    suscripcion.suscriptor.complete();
  }

  private terminarConError(suscripcion: Suscripcion, error: unknown): void {
    if (this.suscripciones.get(suscripcion.eventoId) !== suscripcion) return;
    this.suscripciones.delete(suscripcion.eventoId);
    this.registro.avisar(
      `La suscripción a ${suscripcion.eventoId} termina con error`,
      error,
    );
    suscripcion.suscriptor.error(
      traducirErrorDelHub(error, suscripcion.eventoId),
    );
  }

  // ------------------------------------------------------------------ apoyo

  private async obtener<T>(ruta: string, eventoId?: Id): Promise<T> {
    let respuesta: Response;
    try {
      respuesta = await this.fetch(`${this.urlBase}${ruta}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.tiempoMaximoPeticionMs),
      });
    } catch (error) {
      const motivo =
        error instanceof DOMException && error.name === "TimeoutError"
          ? `no ha respondido en ${this.tiempoMaximoPeticionMs} ms`
          : "no se ha podido conectar";
      throw new ServicioNoDisponibleError(motivo, { cause: error });
    }
    if (respuesta.ok) return (await respuesta.json()) as T;

    // Se decide por el código del contrato, no por el status: un 404 de un proxy o de una
    // urlBase equivocada no es un EventoNoEncontrado, aunque sea un 404. Un código que esta
    // versión no conoce (el contrato puede añadirlos) es un fallo del servicio.
    const problema = await leerProblema(respuesta);
    switch (problema?.codigo) {
      case "EventoNoEncontrado":
        throw new EventoNoEncontradoError(problema.eventoId ?? eventoId ?? "");
      case "ParametroNoValido":
        throw new PeticionIncorrectaError(
          problema.detail ?? problema.title,
          problema.parametro,
        );
      case undefined:
        throw new ServicioNoDisponibleError(
          `respondió ${respuesta.status} sin ser un error del catálogo (¿es urlBase la del backend?)`,
        );
      default:
        throw new ServicioNoDisponibleError(
          `respondió ${respuesta.status} con el error ${String(problema?.codigo)}`,
        );
    }
  }
}

// Un error de un 4xx o 5xx viene en problem+json (RFC 9457). Si no, no hay detalle.
async function leerProblema(
  respuesta: Response,
): Promise<ProblemaServidor | undefined> {
  try {
    return (await respuesta.json()) as ProblemaServidor;
  } catch {
    return undefined;
  }
}

// SignalR solo transmite el texto del error. El hub lo empieza por un código
// (asyncapi.yaml), de los de CodigoProblema: los mismos que en REST. Se busca con includes y no
// con startsWith porque el cliente de SignalR le antepone su propio texto
// («… HubException: EventoNoEncontrado: …»).
function traducirErrorDelHub(error: unknown, eventoId: Id): Error {
  if (error instanceof ServicioNoDisponibleError) return error;
  const mensaje = error instanceof Error ? error.message : String(error);
  if (mensaje.includes("EventoNoEncontrado"))
    return new EventoNoEncontradoError(eventoId);
  // Reintentar no sirve hasta que se deje de seguir otro evento: no es una caída.
  if (mensaje.includes("DemasiadasSuscripciones"))
    return new DemasiadasSuscripcionesError(eventoId);
  if (mensaje.includes("ParametroNoValido"))
    return new PeticionIncorrectaError(mensaje);
  return new ServicioNoDisponibleError(mensaje, { cause: error });
}
