import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import type { ConfiguracionServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import type { ConexionTiempoReal } from "../../src/index.js";
import type {
  EventoDetalleServidor,
  MercadoServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";

chai.use(chaiAsPromised);
export const { expect } = chai;

export const ID_EVENTO = "11111111-1111-4111-8111-111111111111";

// La configuración de las pruebas: la que pondría una aplicación, con el registro apagado.
export const CONFIGURACION: ConfiguracionServicioEventos = {
  urlBase: "https://api.ejemplo",
  tiempoMaximoPeticionMs: 1000,
  esperasReconexionMs: [0, 10],
  nivelDeRegistro: "ninguno",
};

// Deja correr las promesas y los setImmediate pendientes.
export function esperar(): Promise<void> {
  return new Promise((resolver) => setImmediate(resolver));
}

export function respuesta(cuerpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function mercado(
  estado: "abierto" | "suspendido" = "abierto",
): MercadoServidor {
  return {
    id: "m-1x2",
    tipo: "1X2",
    grupo: "principales",
    descripcion: "Quién gana",
    estado,
    selecciones: [
      {
        id: "s-local",
        descripcion: "Gana el Madrid",
        cuota: 2.1,
        cuotaInicial: 2.4,
        tendencia: "baja",
      },
    ],
  };
}

export function eventoDetalle(): EventoDetalleServidor {
  return {
    id: ID_EVENTO,
    nombre: "Real Madrid - FC Barcelona",
    fechaHora: "2030-05-11T19:00:00Z",
    tipo: { id: "t-futbol", nombre: "Partido de fútbol" },
    estado: "programado",
    mercadoPrincipal: mercado(),
    grupos: [{ clave: "goles", nombre: "Goles", numeroMercados: 2 }],
    marca: "7",
  };
}

// Un doble de ConexionTiempoReal: guarda lo que se le invoca y deja simular lo que
// llegaría del servidor (emitir) y una reconexión (reconectar). Sin red ni SignalR.
export class ConexionFalsa implements ConexionTiempoReal {
  readonly iniciar = sinon.stub<[], Promise<void>>().resolves();
  readonly detener = sinon.stub<[], Promise<void>>().resolves();
  readonly invocar = sinon.stub<[string, unknown], Promise<void>>().resolves();
  private readonly manejadores = new Map<
    string,
    (argumento: unknown) => void
  >();
  private alReconectarManejador: (() => void) | undefined;
  private alCerrarManejador: ((error?: Error) => void) | undefined;

  alRecibir(metodo: string, manejador: (argumento: unknown) => void): void {
    this.manejadores.set(metodo, manejador);
  }

  alReconectar(manejador: () => void): void {
    this.alReconectarManejador = manejador;
  }

  emitir(metodo: string, argumento: unknown): void {
    this.manejadores.get(metodo)?.(argumento);
  }

  reconectar(): void {
    this.alReconectarManejador?.();
  }

  alCerrar(manejador: (error?: Error) => void): void {
    this.alCerrarManejador = manejador;
  }

  // Como SignalR al agotar los reintentos: se cierra por su cuenta, con el último error.
  cerrarse(error?: Error): void {
    this.alCerrarManejador?.(error);
  }

  invocaciones(metodo: string): unknown[] {
    return this.invocar
      .getCalls()
      .filter((llamada) => llamada.args[0] === metodo)
      .map((llamada) => llamada.args[1]);
  }
}
