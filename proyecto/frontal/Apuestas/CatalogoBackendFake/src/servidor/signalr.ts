import type { IncomingMessage, Server } from "node:http";
import type {
  CambioDeEventoServidor,
  CambiosServidor,
  CodigoProblemaServidor,
  RecargarServidor,
  SuscripcionServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";
import { WebSocket, WebSocketServer, type RawData } from "ws";
import {
  CatalogoError,
  type Catalogo,
  type Cambio,
} from "../catalogo/catalogo.js";

// El hub de asyncapi.yaml, hablando el protocolo de SignalR (JSON) lo justo para que el
// cliente oficial, @microsoft/signalr, no note diferencia con el backend real:
//
//   1. POST /negotiate (en http.ts) → el cliente abre el WebSocket con ?id=…
//   2. Saludo: el cliente manda {"protocol":"json","version":1}, el servidor responde {}.
//   3. Mensajes JSON, cada uno terminado en el carácter 0x1E:
//        1 invocación  {type:1, invocationId?, target, arguments:[…]}
//        3 resultado   {type:3, invocationId, error?}
//        6 ping        {type:6}
//        7 cierre      {type:7}
//
// Nada de grupos, reconexión con estado ni varios protocolos: lo que no usa este hub.

const SEPARADOR = "\u001e";
const RUTA = "/v1/hubs/catalogo";
const MAXIMO_SUSCRIPCIONES = 50;
// El cliente da la conexión por muerta si pasan 30 s sin oír nada del servidor.
const PING_CADA_MS = 15_000;
const ESTADOS_FINALES = new Set(["finalizado", "aplazado", "cancelado"]);

interface Suscripcion {
  readonly mercados: ReadonlySet<string> | undefined;
}

// Lo que el hub manda al frontal, por método: los mensajes de asyncapi.yaml.
interface MensajesAlFrontal {
  readonly Cambios: CambiosServidor;
  readonly CambioDeEvento: CambioDeEventoServidor;
  readonly Recargar: RecargarServidor;
}

interface Invocacion {
  readonly type: number;
  readonly invocationId?: string;
  readonly target?: string;
  readonly arguments?: readonly unknown[];
}

export interface Hub {
  // Corta todas las conexiones de golpe, como una caída de red: los clientes tienen que
  // reconectar solos. Para las pruebas de reconexión.
  cortarConexiones(): void;
  // Cuántas conexiones siguen ese evento. Para que las pruebas esperen a que una
  // suscripción esté registrada antes de provocar cambios.
  suscritosA(eventoId: string): number;
  desmontar(): void;
}

export function montarHub(servidor: Server, catalogo: Catalogo): Hub {
  const ws = new WebSocketServer({ noServer: true });
  const conexiones = new Set<ConexionHub>();

  servidor.on("upgrade", (peticion: IncomingMessage, socket, cabecera) => {
    const ruta = new URL(peticion.url ?? "/", "http://backend-fake").pathname;
    if (ruta !== RUTA) {
      socket.destroy();
      return;
    }
    ws.handleUpgrade(peticion, socket, cabecera, (socketWs) => {
      const conexion = new ConexionHub(socketWs, catalogo);
      conexiones.add(conexion);
      socketWs.on("close", () => {
        conexion.cerrar();
        conexiones.delete(conexion);
      });
    });
  });

  const dejarDeOir = catalogo.alCambiar((cambio) => {
    for (const conexion of conexiones) conexion.notificar(cambio);
  });

  return {
    cortarConexiones() {
      for (const conexion of conexiones) conexion.terminar();
    },
    suscritosA: (eventoId) =>
      [...conexiones].filter((c) => c.sigue(eventoId)).length,
    desmontar() {
      dejarDeOir();
      for (const conexion of conexiones) conexion.terminar();
      ws.close();
    },
  };
}

class ConexionHub {
  private saludada = false;
  private readonly suscripciones = new Map<string, Suscripcion>();
  private readonly ping: NodeJS.Timeout;

  constructor(
    private readonly socket: WebSocket,
    private readonly catalogo: Catalogo,
  ) {
    socket.on("message", (datos) => {
      this.recibir(aTexto(datos));
    });
    this.ping = setInterval(() => {
      this.enviar({ type: 6 });
    }, PING_CADA_MS);
  }

  cerrar(): void {
    clearInterval(this.ping);
  }

  sigue(eventoId: string): boolean {
    return this.suscripciones.has(eventoId);
  }

  terminar(): void {
    this.cerrar();
    this.socket.terminate();
  }

  notificar(cambio: Cambio): void {
    const suscripcion = this.suscripciones.get(cambio.eventoId);
    if (!suscripcion) return;
    if (cambio.tipo === "evento") {
      this.invocar("CambioDeEvento", {
        eventoId: cambio.eventoId,
        estado: cambio.estado,
        marca: String(cambio.marca),
      });
      // Tras un estado final la suscripción se cancela sola (asyncapi.yaml).
      if (ESTADOS_FINALES.has(cambio.estado))
        this.suscripciones.delete(cambio.eventoId);
      return;
    }
    if (suscripcion.mercados && !suscripcion.mercados.has(cambio.mercadoId))
      return;
    const cambios =
      cambio.tipo === "cuota"
        ? this.catalogo.describirCambios([cambio.seleccionId], [])
        : this.catalogo.describirCambios([], [cambio.mercadoId]);
    this.invocar("Cambios", { eventoId: cambio.eventoId, ...cambios });
  }

  private recibir(texto: string): void {
    for (const trozo of texto.split(SEPARADOR)) {
      if (!trozo) continue;
      if (!this.saludada) {
        // El primer mensaje es el saludo: protocolo json, versión 1.
        this.saludada = true;
        this.socket.send(`{}${SEPARADOR}`);
        continue;
      }
      this.atender(JSON.parse(trozo) as Invocacion);
    }
  }

  private atender(mensaje: Invocacion): void {
    if (mensaje.type === 7) {
      this.socket.close();
      return;
    }
    if (mensaje.type !== 1) return;
    // Lo que llega del frontal no es de fiar: los campos son los del contrato, pero se
    // comprueban uno a uno.
    const argumento = (mensaje.arguments?.[0] ?? {}) as Partial<
      Record<keyof SuscripcionServidor, unknown>
    >;
    try {
      if (mensaje.target === "Suscribir") this.suscribir(argumento);
      else if (mensaje.target === "Cancelar")
        this.suscripciones.delete(String(argumento["eventoId"]));
      else throw new Error(`No existe el método ${String(mensaje.target)}.`);
      this.responder(mensaje.invocationId);
    } catch (error) {
      this.responder(
        mensaje.invocationId,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private suscribir(
    argumento: Partial<Record<keyof SuscripcionServidor, unknown>>,
  ): void {
    const eventoId = String(argumento["eventoId"]);
    const desde = Number(argumento["desde"]);
    const lista = argumento["mercados"];
    const mercados = Array.isArray(lista)
      ? new Set(lista.map(String))
      : undefined;
    if (Array.isArray(lista) && lista.length > 100)
      throw errorDelHub("ParametroNoValido", "mercados admite hasta 100 ids");
    if (!this.catalogo.esEventoVisible(eventoId))
      throw new CatalogoError(
        "EventoNoEncontrado",
        `no hay ningún evento visible con id ${eventoId}`,
      );
    if (
      !this.suscripciones.has(eventoId) &&
      this.suscripciones.size >= MAXIMO_SUSCRIPCIONES
    )
      throw errorDelHub(
        "DemasiadasSuscripciones",
        `esta conexión ya sigue ${MAXIMO_SUSCRIPCIONES} eventos`,
      );
    this.suscripciones.set(eventoId, { mercados });
    // Lo que haya pasado desde la marca con la que se cargó, para no perder nada. Se
    // manda después de responder a la invocación, como haría el backend real.
    setImmediate(() => {
      const pendientes = Number.isInteger(desde)
        ? this.catalogo.cambiosDesde(eventoId, desde, mercados)
        : undefined;
      if (pendientes === undefined) {
        this.suscripciones.delete(eventoId);
        this.invocar("Recargar", { eventoId });
      } else if (pendientes.cuotas.length > 0 || pendientes.mercados.length > 0)
        this.invocar("Cambios", { eventoId, ...pendientes });
    });
  }

  private invocar<M extends keyof MensajesAlFrontal>(
    metodo: M,
    argumento: MensajesAlFrontal[M],
  ): void {
    this.enviar({ type: 1, target: metodo, arguments: [argumento] });
  }

  private responder(invocationId: string | undefined, error?: string): void {
    if (invocationId === undefined) return;
    this.enviar({ type: 3, invocationId, ...(error ? { error } : {}) });
  }

  private enviar(mensaje: object): void {
    if (this.saludada && this.socket.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(mensaje) + SEPARADOR);
  }
}

// ws entrega un Buffer, un ArrayBuffer o una lista de Buffer según cómo llegue el mensaje.
function aTexto(datos: RawData): string {
  if (Array.isArray(datos)) return Buffer.concat(datos).toString("utf8");
  if (Buffer.isBuffer(datos)) return datos.toString("utf8");
  return Buffer.from(new Uint8Array(datos)).toString("utf8");
}

// SignalR solo transmite el texto del error: empieza por su código, de los del contrato.
function errorDelHub(codigo: CodigoProblemaServidor, texto: string): Error {
  return new Error(`${codigo}: ${texto}`);
}
