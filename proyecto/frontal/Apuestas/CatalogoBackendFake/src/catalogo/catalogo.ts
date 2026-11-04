import type {
  CambiosDeCuotasServidor,
  EstadoEventoServidor,
  EstadoMercadoServidor,
  EventoDetalleServidor,
  EventoResumenServidor,
  MercadoServidor,
  MercadosDeGrupoServidor,
  PaginaEventosServidor,
  TendenciaServidor,
  TipoEventoServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";
import type {
  DatosCatalogo,
  EstadoEventoDatos,
  EstadoMercadoDatos,
} from "./datos.js";

// Lo que el jugador puede ver, según el contrato.
const EVENTOS_VISIBLES: readonly EstadoEventoDatos[] = [
  "programado",
  "enJuego",
  "interrumpido",
];
const MERCADOS_VISIBLES: readonly EstadoMercadoDatos[] = [
  "abierto",
  "suspendido",
];

export interface FiltroEventos {
  readonly tipo?: string;
  readonly estado?: string;
  readonly desde?: Date;
  readonly hasta?: Date;
  readonly pagina: number;
  readonly tamano: number;
}

// Un apunte del registro de cambios. La marca es la posición en el registro.
export type Cambio =
  | {
      readonly marca: number;
      readonly eventoId: string;
      readonly tipo: "cuota";
      readonly mercadoId: string;
      readonly seleccionId: string;
    }
  | {
      readonly marca: number;
      readonly eventoId: string;
      readonly tipo: "mercado";
      readonly mercadoId: string;
    }
  | {
      readonly marca: number;
      readonly eventoId: string;
      readonly tipo: "evento";
      readonly estado: EstadoEventoDatos;
    };

interface Seleccion {
  readonly id: string;
  readonly descripcion: string;
  cuota: number;
  readonly cuotaInicial: number;
  tendencia: TendenciaServidor;
}

interface Mercado {
  readonly id: string;
  readonly eventoId: string;
  readonly tipo: string;
  readonly grupo: string;
  readonly descripcion: string;
  readonly principal: boolean;
  estado: EstadoMercadoDatos;
  readonly selecciones: Seleccion[];
}

interface Evento {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoEventoServidor;
  readonly comienzo: string;
  estado: EstadoEventoDatos;
  readonly mercados: Mercado[];
}

export class CatalogoError extends Error {
  override readonly name = "CatalogoError";

  constructor(
    readonly codigo:
      "EventoNoEncontrado" | "SeleccionNoEncontrada" | "MercadoNoEncontrado",
    mensaje: string,
  ) {
    super(`${codigo}: ${mensaje}`);
  }
}

// El catálogo en memoria. Todas las consultas devuelven la forma exacta del contrato
// (los tipos que publica su paquete): si el contrato cambia, esto deja de compilar.
export class Catalogo {
  private readonly eventos = new Map<string, Evento>();
  private readonly mercados = new Map<string, Mercado>();
  private readonly selecciones = new Map<
    string,
    { seleccion: Seleccion; mercado: Mercado }
  >();
  private readonly nombresGrupos: Readonly<Record<string, string>>;
  private readonly tipos: readonly TipoEventoServidor[];
  private readonly registro: Cambio[] = [];
  private readonly oyentes = new Set<(cambio: Cambio) => void>();
  private ultimaMarca = 0;

  constructor(
    datos: DatosCatalogo,
    // Cuántos cambios se guardan para poder responder «desde una marca». Una marca más
    // antigua obliga al frontal a recargar.
    private readonly cambiosRetenidos = 1000,
  ) {
    this.nombresGrupos = datos.grupos;
    this.tipos = datos.tipos;
    const tipos = new Map(datos.tipos.map((t) => [t.id, t]));
    for (const e of datos.eventos) {
      const tipo = tipos.get(e.tipoId);
      if (!tipo)
        throw new Error(`El evento ${e.id} tiene un tipo que no existe.`);
      const evento: Evento = {
        id: e.id,
        nombre: e.nombre,
        tipo,
        comienzo: e.comienzo,
        estado: e.estado,
        mercados: [],
      };
      for (const m of e.mercados) {
        const mercado: Mercado = {
          id: m.id,
          eventoId: e.id,
          tipo: m.tipo,
          grupo: m.grupo,
          descripcion: m.descripcion,
          principal: m.principal === true,
          estado: m.estado,
          selecciones: m.selecciones.map((s) => ({
            id: s.id,
            descripcion: s.descripcion,
            cuota: s.cuota,
            cuotaInicial: s.cuota,
            tendencia: "igual",
          })),
        };
        evento.mercados.push(mercado);
        this.mercados.set(mercado.id, mercado);
        for (const seleccion of mercado.selecciones)
          this.selecciones.set(seleccion.id, { seleccion, mercado });
      }
      this.eventos.set(evento.id, evento);
    }
  }

  get marca(): string {
    return String(this.ultimaMarca);
  }

  alCambiar(oyente: (cambio: Cambio) => void): () => void {
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }

  // ---------------------------------------------------------------- consultas

  listarTipos(): TipoEventoServidor[] {
    const conEventos = new Set(
      [...this.eventos.values()].filter(esVisible).map((e) => e.tipo.id),
    );
    return this.tipos.filter((t) => conEventos.has(t.id));
  }

  listarEventos(filtro: FiltroEventos): PaginaEventosServidor {
    const todos = [...this.eventos.values()]
      .filter(esVisible)
      .filter((e) => filtro.tipo === undefined || e.tipo.id === filtro.tipo)
      .filter((e) => filtro.estado === undefined || e.estado === filtro.estado)
      .filter((e) => !filtro.desde || new Date(e.comienzo) >= filtro.desde)
      .filter((e) => !filtro.hasta || new Date(e.comienzo) < filtro.hasta)
      .sort((a, b) => a.comienzo.localeCompare(b.comienzo));
    const inicio = (filtro.pagina - 1) * filtro.tamano;
    return {
      elementos: todos
        .slice(inicio, inicio + filtro.tamano)
        .map((e) => this.resumen(e)),
      pagina: filtro.pagina,
      tamano: filtro.tamano,
      total: todos.length,
      marca: this.marca,
    };
  }

  obtenerEvento(eventoId: string): EventoDetalleServidor {
    const evento = this.eventoVisible(eventoId);
    const grupos = new Map<string, number>();
    for (const m of mercadosVisibles(evento))
      grupos.set(m.grupo, (grupos.get(m.grupo) ?? 0) + 1);
    return {
      ...this.resumen(evento),
      grupos: [...grupos].map(([clave, numeroMercados]) => ({
        clave,
        nombre: this.nombresGrupos[clave] ?? clave,
        numeroMercados,
      })),
      marca: this.marca,
    };
  }

  listarMercados(eventoId: string, grupo: string): MercadosDeGrupoServidor {
    const evento = this.eventoVisible(eventoId);
    return {
      marca: this.marca,
      mercados: mercadosVisibles(evento)
        .filter((m) => m.grupo === grupo)
        .map(aMercado),
    };
  }

  // Lo que ha cambiado del evento después de la marca «desde»: el estado actual de cada
  // cuota y de cada mercado que cambió. undefined si la marca es demasiado antigua.
  cambiosDesde(
    eventoId: string,
    desde: number,
    mercados?: ReadonlySet<string>,
  ): CambiosDeCuotasServidor | undefined {
    const evento = this.eventoVisible(eventoId);
    const primeraRetenida = this.registro[0]?.marca ?? this.ultimaMarca + 1;
    if (desde < primeraRetenida - 1) return undefined;
    const cuotas = new Set<string>();
    const deMercados = new Set<string>();
    for (const c of this.registro) {
      if (c.marca <= desde || c.eventoId !== evento.id || c.tipo === "evento")
        continue;
      if (mercados && !mercados.has(c.mercadoId)) continue;
      if (c.tipo === "cuota") cuotas.add(c.seleccionId);
      else deMercados.add(c.mercadoId);
    }
    return this.describirCambios(cuotas, deMercados);
  }

  // El estado actual de todas las cuotas y los mercados visibles del evento (o de los
  // pedidos), en el formato de los cambios. Es lo que devuelve /cuotas sin «desde».
  describirCambiosActuales(
    eventoId: string,
    mercados?: ReadonlySet<string>,
  ): CambiosDeCuotasServidor {
    const pedidos = mercadosVisibles(this.eventoVisible(eventoId)).filter(
      (m) => !mercados || mercados.has(m.id),
    );
    return this.describirCambios(
      pedidos.flatMap((m) => m.selecciones.map((s) => s.id)),
      pedidos.map((m) => m.id),
    );
  }

  describirCambios(
    seleccionIds: Iterable<string>,
    mercadoIds: Iterable<string>,
  ): CambiosDeCuotasServidor {
    return {
      marca: this.marca,
      cuotas: [...seleccionIds].map((id) => {
        const { seleccion, mercado } = this.buscarSeleccion(id);
        return {
          seleccionId: id,
          mercadoId: mercado.id,
          cuota: seleccion.cuota,
          tendencia: seleccion.tendencia,
        };
      }),
      mercados: [...mercadoIds].map((id) => {
        const estado = this.buscarMercado(id).estado;
        return { mercadoId: id, estado: estado === "cerrado" ? null : estado };
      }),
    };
  }

  // ----------------------------------------------------------------- cambios

  cambiarCuota(seleccionId: string, cuota: number): void {
    const { seleccion, mercado } = this.buscarSeleccion(seleccionId);
    const nueva = Math.round(cuota * 100) / 100;
    if (nueva <= 1)
      throw new RangeError("Una cuota tiene que ser mayor que 1.");
    seleccion.tendencia =
      nueva > seleccion.cuota
        ? "sube"
        : nueva < seleccion.cuota
          ? "baja"
          : "igual";
    seleccion.cuota = nueva;
    this.apuntar({
      eventoId: mercado.eventoId,
      tipo: "cuota",
      mercadoId: mercado.id,
      seleccionId,
    });
  }

  cambiarEstadoMercado(mercadoId: string, estado: EstadoMercadoDatos): void {
    const mercado = this.buscarMercado(mercadoId);
    mercado.estado = estado;
    this.apuntar({ eventoId: mercado.eventoId, tipo: "mercado", mercadoId });
  }

  cambiarEstadoEvento(eventoId: string, estado: EstadoEventoDatos): void {
    const evento = this.eventos.get(eventoId);
    if (!evento)
      throw new CatalogoError(
        "EventoNoEncontrado",
        `no existe el evento ${eventoId}`,
      );
    evento.estado = estado;
    this.apuntar({ eventoId, tipo: "evento", estado });
  }

  // Para las pruebas a mano: mueve un poco una cuota cualquiera de un mercado abierto.
  moverUnaCuotaAlAzar(azar: () => number = Math.random): void {
    const candidatas = [...this.selecciones.values()].filter(
      ({ mercado }) =>
        mercado.estado === "abierto" &&
        esVisible(this.eventos.get(mercado.eventoId)),
    );
    const elegida = candidatas[Math.floor(azar() * candidatas.length)];
    if (!elegida) return;
    const variacion = (azar() - 0.5) * 0.4;
    const cuota = Math.max(1.01, elegida.seleccion.cuota + variacion);
    this.cambiarCuota(elegida.seleccion.id, cuota);
  }

  // ------------------------------------------------------------------ apoyo

  buscarSeleccionPorDescripcion(
    eventoId: string,
    descripcion: string,
  ): { seleccionId: string; mercadoId: string } {
    for (const m of this.eventos.get(eventoId)?.mercados ?? [])
      for (const s of m.selecciones)
        if (s.descripcion === descripcion)
          return { seleccionId: s.id, mercadoId: m.id };
    throw new CatalogoError(
      "SeleccionNoEncontrada",
      `no hay ninguna selección «${descripcion}» en ${eventoId}`,
    );
  }

  buscarMercadoPorDescripcion(eventoId: string, descripcion: string): string {
    const mercado = this.eventos
      .get(eventoId)
      ?.mercados.find((m) => m.descripcion === descripcion);
    if (!mercado)
      throw new CatalogoError(
        "MercadoNoEncontrado",
        `no hay ningún mercado «${descripcion}» en ${eventoId}`,
      );
    return mercado.id;
  }

  buscarEventoPorNombre(nombre: string): string {
    for (const e of this.eventos.values()) if (e.nombre === nombre) return e.id;
    throw new CatalogoError(
      "EventoNoEncontrado",
      `no hay ningún evento «${nombre}»`,
    );
  }

  esEventoVisible(eventoId: string): boolean {
    return esVisible(this.eventos.get(eventoId));
  }

  private apuntar(cambio: DistributiveOmit<Cambio, "marca">): void {
    this.ultimaMarca += 1;
    const conMarca = { ...cambio, marca: this.ultimaMarca } as Cambio;
    this.registro.push(conMarca);
    if (this.registro.length > this.cambiosRetenidos) this.registro.shift();
    for (const oyente of this.oyentes) oyente(conMarca);
  }

  private resumen(e: Evento): EventoResumenServidor {
    const principal = mercadosVisibles(e).find((m) => m.principal);
    return {
      id: e.id,
      nombre: e.nombre,
      fechaHora: e.comienzo,
      tipo: e.tipo,
      estado: e.estado as EstadoEventoServidor,
      mercadoPrincipal: principal ? aMercado(principal) : null,
    };
  }

  private eventoVisible(eventoId: string): Evento {
    const evento = this.eventos.get(eventoId);
    if (!evento || !esVisible(evento))
      throw new CatalogoError(
        "EventoNoEncontrado",
        `no hay ningún evento visible con id ${eventoId}`,
      );
    return evento;
  }

  private buscarSeleccion(id: string): {
    seleccion: Seleccion;
    mercado: Mercado;
  } {
    const encontrada = this.selecciones.get(id);
    if (!encontrada)
      throw new CatalogoError(
        "SeleccionNoEncontrada",
        `no existe la selección ${id}`,
      );
    return encontrada;
  }

  private buscarMercado(id: string): Mercado {
    const mercado = this.mercados.get(id);
    if (!mercado)
      throw new CatalogoError(
        "MercadoNoEncontrado",
        `no existe el mercado ${id}`,
      );
    return mercado;
  }
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

function esVisible(evento: Evento | undefined): evento is Evento {
  return evento !== undefined && EVENTOS_VISIBLES.includes(evento.estado);
}

function mercadosVisibles(evento: Evento): Mercado[] {
  return evento.mercados.filter((m) => MERCADOS_VISIBLES.includes(m.estado));
}

function aMercado(m: Mercado): MercadoServidor {
  return {
    id: m.id,
    tipo: m.tipo,
    grupo: m.grupo,
    descripcion: m.descripcion,
    estado: m.estado as EstadoMercadoServidor,
    selecciones: m.selecciones.map((s) => ({
      id: s.id,
      descripcion: s.descripcion,
      cuota: s.cuota,
      cuotaInicial: s.cuotaInicial,
      tendencia: s.tendencia,
    })),
  };
}
