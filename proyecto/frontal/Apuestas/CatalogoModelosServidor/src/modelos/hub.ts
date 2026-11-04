import type { components } from "../generado/contrato.js";

// Los mensajes del hub de SignalR (asyncapi.yaml): lo que va en el único argumento de cada
// invocación.
type Esquemas = components["schemas"];

export type EstadoEventoNotificadoServidor = Esquemas["EstadoEventoNotificado"];

// Del frontal al servidor.
export type SuscripcionServidor = Esquemas["MensajeSuscribir"];
export type CancelacionServidor = Esquemas["MensajeCancelar"];

// Del servidor al frontal.
export type CambiosServidor = Esquemas["MensajeCambios"];
export type CambioDeEventoServidor = Esquemas["MensajeCambioDeEvento"];
export type RecargarServidor = Esquemas["MensajeRecargar"];
