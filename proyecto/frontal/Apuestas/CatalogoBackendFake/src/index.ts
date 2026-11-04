import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Catalogo } from "./catalogo/catalogo.js";
import {
  leerDatos,
  RUTA_DATOS_EJEMPLO,
  type DatosCatalogo,
} from "./catalogo/datos.js";
import { atenderHttp } from "./servidor/http.js";
import { montarHub } from "./servidor/signalr.js";

export { Catalogo, CatalogoError } from "./catalogo/catalogo.js";
export type { DatosCatalogo } from "./catalogo/datos.js";

export interface OpcionesBackendFake {
  // 0: un puerto libre cualquiera (lo que conviene en las pruebas).
  readonly puerto?: number;
  readonly datos?: DatosCatalogo;
  // Cada cuánto se mueve una cuota al azar. 0: nunca (las pruebas mueven lo que quieren).
  readonly moverCuotasCadaMs?: number;
}

export interface BackendFake {
  readonly url: string;
  // Para provocar cambios desde las pruebas: cambiarCuota, cambiarEstadoMercado…
  readonly catalogo: Catalogo;
  // Cuántas conexiones están suscritas a ese evento ahora mismo.
  suscritosA(eventoId: string): number;
  // Corta todas las conexiones en tiempo real, como una caída de red.
  cortarConexiones(): void;
  parar(): Promise<void>;
}

export async function arrancarBackendFake(
  opciones: OpcionesBackendFake = {},
): Promise<BackendFake> {
  const catalogo = new Catalogo(
    opciones.datos ?? leerDatos(RUTA_DATOS_EJEMPLO),
  );
  const servidor = createServer((peticion, respuesta) => {
    atenderHttp(catalogo, peticion, respuesta);
  });
  const hub = montarHub(servidor, catalogo);
  const mover = opciones.moverCuotasCadaMs
    ? setInterval(() => {
        catalogo.moverUnaCuotaAlAzar();
      }, opciones.moverCuotasCadaMs)
    : undefined;

  await new Promise<void>((resolver) =>
    servidor.listen(opciones.puerto ?? 0, "127.0.0.1", resolver),
  );
  const { port } = servidor.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}`,
    catalogo,
    suscritosA: (eventoId) => hub.suscritosA(eventoId),
    cortarConexiones: () => {
      hub.cortarConexiones();
    },
    async parar() {
      clearInterval(mover);
      hub.desmontar();
      await new Promise<void>((resolver, rechazar) => {
        servidor.close((error) => {
          if (error) rechazar(error);
          else resolver();
        });
        servidor.closeAllConnections();
      });
    },
  };
}
