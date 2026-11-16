// Cuatro eventos, uno por cada caso que el listado tiene que saber pintar: uno por empezar,
// uno en directo, uno con el mercado suspendido y uno sin mercado principal todavía.
import type {
  EventoDetalle,
  Mercado,
  Seleccion,
  Tendencia,
} from "@apuestas-deportivas/catalogo-servicios-api";

const FUTBOL = { id: "futbol", nombre: "Fútbol" };
const TENIS = { id: "tenis", nombre: "Tenis" };
const BALONCESTO = { id: "baloncesto", nombre: "Baloncesto" };

function seleccion(
  id: string,
  descripcion: string,
  cuota: number,
  tendencia: Tendencia = "igual",
): Seleccion {
  return { id, descripcion, cuota, cuotaInicial: cuota, tendencia };
}

function mercado(
  id: string,
  descripcion: string,
  selecciones: Seleccion[],
  estado: Mercado["estado"] = "abierto",
): Mercado {
  return {
    id,
    tipo: selecciones.length === 3 ? "1x2" : "ganador",
    grupo: "principales",
    descripcion,
    estado,
    seAdmitenApuestas: estado === "abierto",
    selecciones,
  };
}

const PRINCIPALES = [
  { clave: "principales", nombre: "Principales", numeroMercados: 1 },
];

export const EVENTOS: readonly EventoDetalle[] = [
  {
    id: "e1",
    nombre: "Atlético Ribera - Deportivo Norte",
    comienzo: new Date("2030-05-11T19:00:00Z"),
    tipo: FUTBOL,
    estado: "programado",
    enDirecto: false,
    mercadoPrincipal: mercado("e1-1x2", "Resultado final", [
      seleccion("e1-1", "1", 1.85),
      seleccion("e1-x", "X", 3.4),
      seleccion("e1-2", "2", 4.1),
    ]),
    grupos: PRINCIPALES,
    marca: "1",
  },
  {
    id: "e2",
    nombre: "Unión Costera - Real Sierra",
    comienzo: new Date("2030-05-10T18:30:00Z"),
    tipo: FUTBOL,
    estado: "enJuego",
    enDirecto: true,
    mercadoPrincipal: mercado("e2-1x2", "Resultado final", [
      seleccion("e2-1", "1", 2.2, "baja"),
      seleccion("e2-x", "X", 3.1, "sube"),
      seleccion("e2-2", "2", 3.6),
    ]),
    grupos: PRINCIPALES,
    marca: "1",
  },
  {
    id: "e3",
    nombre: "L. Prado - M. Olmedo",
    comienzo: new Date("2030-05-12T10:00:00Z"),
    tipo: TENIS,
    estado: "interrumpido",
    enDirecto: false,
    mercadoPrincipal: mercado(
      "e3-ganador",
      "Ganador del partido",
      [seleccion("e3-1", "Prado", 1.6), seleccion("e3-2", "Olmedo", 2.35)],
      "suspendido",
    ),
    grupos: PRINCIPALES,
    marca: "1",
  },
  {
    id: "e4",
    nombre: "Club Valle - Ciudad Alta",
    comienzo: new Date("2030-05-13T20:45:00Z"),
    tipo: BALONCESTO,
    estado: "programado",
    enDirecto: false,
    mercadoPrincipal: null,
    grupos: [],
    marca: "1",
  },
];
