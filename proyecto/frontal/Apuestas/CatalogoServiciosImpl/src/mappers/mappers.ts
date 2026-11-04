import type {
  CambioEnEvento,
  EstadoEvento,
  Evento,
  EventoDetalle,
  FiltroEventos,
  Mercado,
  MercadosDeGrupo,
  PaginaEventos,
  Seleccion,
  TipoEvento,
} from "@apuestas-deportivas/catalogo-servicios-api";
import type {
  CambioDeEventoServidor,
  CambiosServidor,
  EventoDetalleServidor,
  EventoResumenServidor,
  MercadoServidor,
  MercadosDeGrupoServidor,
  PaginaEventosServidor,
  SeleccionServidor,
  TipoEventoServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";

// Del servidor al frontal. Funciones puras y a mano: en TypeScript los tipos no existen
// en ejecución, así que una librería tipo MapStruct no tiene de dónde generar nada. Si el
// contrato cambia, el compilador marca la línea exacta que hay que tocar.

export function aTipoEvento(t: TipoEventoServidor): TipoEvento {
  return { id: t.id, nombre: t.nombre };
}

export function aSeleccion(s: SeleccionServidor): Seleccion {
  return {
    id: s.id,
    descripcion: s.descripcion,
    cuota: s.cuota,
    cuotaInicial: s.cuotaInicial,
    tendencia: s.tendencia,
  };
}

export function aMercado(m: MercadoServidor): Mercado {
  return {
    id: m.id,
    tipo: m.tipo,
    grupo: m.grupo,
    descripcion: m.descripcion,
    estado: m.estado,
    seAdmitenApuestas: m.estado === "abierto",
    selecciones: m.selecciones.map(aSeleccion),
  };
}

export function aEvento(e: EventoResumenServidor): Evento {
  return {
    id: e.id,
    nombre: e.nombre,
    comienzo: new Date(e.fechaHora),
    tipo: aTipoEvento(e.tipo),
    estado: e.estado,
    enDirecto: e.estado === "enJuego",
    mercadoPrincipal: e.mercadoPrincipal ? aMercado(e.mercadoPrincipal) : null,
  };
}

export function aEventoDetalle(e: EventoDetalleServidor): EventoDetalle {
  return {
    ...aEvento(e),
    grupos: e.grupos.map((g) => ({
      clave: g.clave,
      nombre: g.nombre,
      numeroMercados: g.numeroMercados,
    })),
    marca: e.marca,
  };
}

export function aPaginaEventos(p: PaginaEventosServidor): PaginaEventos {
  return {
    eventos: p.elementos.map(aEvento),
    pagina: p.pagina,
    tamano: p.tamano,
    total: p.total,
    hayMas: p.pagina * p.tamano < p.total,
    marca: p.marca,
  };
}

export function aMercadosDeGrupo(m: MercadosDeGrupoServidor): MercadosDeGrupo {
  return { mercados: m.mercados.map(aMercado), marca: m.marca };
}

export function aCambioDeCuotas(c: CambiosServidor): CambioEnEvento {
  return {
    tipo: "cuotas",
    marca: c.marca,
    cuotas: c.cuotas.map((cuota) => ({
      seleccionId: cuota.seleccionId,
      mercadoId: cuota.mercadoId,
      cuota: cuota.cuota,
      tendencia: cuota.tendencia,
    })),
    mercados: c.mercados.map((m) => ({
      mercadoId: m.mercadoId,
      estado: m.estado ?? null,
    })),
  };
}

export function aCambioDeEstado(c: CambioDeEventoServidor): CambioEnEvento {
  return { tipo: "estado", marca: c.marca, estado: c.estado };
}

// Del frontal al servidor: el filtro, como parámetros de la URL. Lo que no se indica no
// se manda, y las fechas van en ISO 8601 (UTC).
export function aParametros(filtro: FiltroEventos = {}): URLSearchParams {
  const parametros = new URLSearchParams();
  const poner = (nombre: string, valor: string | number | undefined) => {
    if (valor !== undefined) parametros.set(nombre, String(valor));
  };
  poner("tipo", filtro.tipo);
  poner("estado", filtro.estado satisfies EstadoEvento | undefined);
  poner("desde", filtro.desde?.toISOString());
  poner("hasta", filtro.hasta?.toISOString());
  poner("pagina", filtro.pagina);
  poner("tamano", filtro.tamano);
  return parametros;
}
