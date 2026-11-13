import type {
  EventoDetalle,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";

export function mercado(id: string, cuota = 2): Mercado {
  return {
    id,
    tipo: "1x2",
    grupo: "principales",
    descripcion: `Mercado ${id}`,
    estado: "abierto",
    seAdmitenApuestas: true,
    selecciones: [
      {
        id: `${id}-1`,
        descripcion: "Uno",
        cuota,
        cuotaInicial: cuota,
        tendencia: "igual",
      },
      {
        id: `${id}-2`,
        descripcion: "Dos",
        cuota,
        cuotaInicial: cuota,
        tendencia: "igual",
      },
    ],
  };
}

export function detalle(id = "e1"): EventoDetalle {
  return {
    id,
    nombre: `Evento ${id}`,
    comienzo: new Date("2030-05-11T16:00:00Z"),
    tipo: { id: "t", nombre: "Fútbol" },
    estado: "programado",
    enDirecto: false,
    mercadoPrincipal: mercado("m1"),
    grupos: [
      { clave: "principales", nombre: "Principales", numeroMercados: 2 },
    ],
    marca: "10",
  };
}
