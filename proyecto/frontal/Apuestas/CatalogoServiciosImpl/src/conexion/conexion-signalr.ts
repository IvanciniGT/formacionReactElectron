import { HubConnectionBuilder } from "@microsoft/signalr";
import { adaptarHubConnection, type ConexionTiempoReal } from "./conexion.js";
import type { ConfiguracionServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import { nivelSignalR } from "../registro/registro.js";
import { sinBarrasFinales } from "../url/url.js";

// La única función que construye SignalR de verdad. Queda fuera de las pruebas unitarias
// (no hay nada nuestro que probar aquí) y la ejercitan las de sistema, contra el backend fake.
export function conexionSignalR(
  configuracion: ConfiguracionServicioEventos,
): ConexionTiempoReal {
  return adaptarHubConnection(
    new HubConnectionBuilder()
      .withUrl(`${sinBarrasFinales(configuracion.urlBase)}/v1/hubs/catalogo`)
      .withAutomaticReconnect([...configuracion.esperasReconexionMs])
      .configureLogging(nivelSignalR(configuracion.nivelDeRegistro))
      .build(),
  );
}
