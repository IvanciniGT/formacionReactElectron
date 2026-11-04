import type { HubConnection } from "@microsoft/signalr";

// Lo que ServicioEventosHttp necesita de una conexión en tiempo real, y nada más. Depende
// de esta interfaz y no de SignalR: así sus pruebas unitarias le dan una conexión falsa,
// sin red, y SignalR queda como un detalle detrás del adaptador (inversión de
// dependencias).
export interface ConexionTiempoReal {
  iniciar(): Promise<void>;
  detener(): Promise<void>;
  invocar(metodo: string, argumento: unknown): Promise<void>;
  alRecibir(metodo: string, manejador: (argumento: unknown) => void): void;
  alReconectar(manejador: () => void): void;
  // Se ha cerrado por su cuenta: se agotaron los reintentos de reconexión, o la cerró el
  // servidor. También al detenerla a propósito (sin error).
  alCerrar(manejador: (error?: Error) => void): void;
}

// El adaptador: ConexionTiempoReal sobre un HubConnection de Microsoft.
export function adaptarHubConnection(hub: HubConnection): ConexionTiempoReal {
  return {
    iniciar: () => hub.start(),
    detener: () => hub.stop(),
    async invocar(metodo, argumento) {
      await hub.invoke(metodo, argumento);
    },
    alRecibir(metodo, manejador) {
      hub.on(metodo, manejador);
    },
    alReconectar(manejador) {
      hub.onreconnected(() => {
        manejador();
      });
    },
    alCerrar(manejador) {
      hub.onclose((error) => {
        manejador(error);
      });
    },
  };
}
