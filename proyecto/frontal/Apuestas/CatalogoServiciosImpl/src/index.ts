import type { CrearServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import { ServicioEventosHttp } from "./servicios/servicio-eventos-http.js";

export {
  ServicioEventosHttp,
  type DependenciasServicioEventos,
} from "./servicios/servicio-eventos-http.js";
export type { Registrador } from "./registro/registro.js";
export {
  adaptarHubConnection,
  type ConexionTiempoReal,
} from "./conexion/conexion.js";
export { conexionSignalR } from "./conexion/conexion-signalr.js";

// La fábrica que define la API, con fetch y SignalR. La configuración (y con ella, el
// entorno) la pone la aplicación. La configuración y su error se importan de la API.
export const crearServicioEventos: CrearServicioEventos = (configuracion) =>
  new ServicioEventosHttp(configuracion);
