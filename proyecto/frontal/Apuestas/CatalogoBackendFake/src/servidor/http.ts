import type {
  CodigoProblemaServidor,
  ProblemaServidor,
} from "@apuestas-deportivas/catalogo-modelos-servidor";
import type { IncomingMessage, ServerResponse } from "node:http";
import { CatalogoError, type Catalogo } from "../catalogo/catalogo.js";

// El API REST de openapi.yaml. Sin framework: son cinco rutas de solo lectura.

const RUTA_HUB = "/v1/hubs/catalogo";
const RUTA_EVENTO = /^\/v1\/eventos\/([^/]+)(\/mercados|\/cuotas)?$/;

export function atenderHttp(
  catalogo: Catalogo,
  peticion: IncomingMessage,
  respuesta: ServerResponse,
): void {
  permitirOrigen(peticion, respuesta);
  if (peticion.method === "OPTIONS") {
    respuesta.writeHead(204).end();
    return;
  }
  const url = new URL(peticion.url ?? "/", "http://backend-fake");
  // El evento de la ruta, si la hay: para el EventoNoEncontrado.
  let eventoId: string | undefined;
  try {
    if (
      peticion.method === "POST" &&
      url.pathname === `${RUTA_HUB}/negotiate`
    ) {
      // SignalR negocia el transporte antes de abrir el WebSocket. Solo se ofrece ese.
      const id = crypto.randomUUID();
      json(respuesta, 200, {
        negotiateVersion: 1,
        connectionId: id,
        connectionToken: id,
        availableTransports: [
          { transport: "WebSockets", transferFormats: ["Text", "Binary"] },
        ],
      });
      return;
    }
    if (peticion.method !== "GET") {
      fueraDelContrato(respuesta, 405, "Método no permitido");
      return;
    }
    if (url.pathname === "/v1/tipos") {
      json(respuesta, 200, catalogo.listarTipos());
      return;
    }
    if (url.pathname === "/v1/eventos") {
      json(
        respuesta,
        200,
        catalogo.listarEventos(leerFiltro(url.searchParams)),
      );
      return;
    }
    const ruta = RUTA_EVENTO.exec(url.pathname);
    if (ruta) {
      eventoId = decodeURIComponent(ruta[1] ?? "");
      switch (ruta[2]) {
        case undefined:
          json(respuesta, 200, catalogo.obtenerEvento(eventoId));
          return;
        case "/mercados": {
          const grupo = url.searchParams.get("grupo");
          if (!grupo)
            throw new ParametroIncorrecto("grupo", "falta el parámetro grupo");
          // ClaveGrupo en el contrato: minúsculas, dígitos y guiones, hasta 50.
          if (!/^[a-z][a-z0-9-]*$/.test(grupo) || grupo.length > 50)
            throw new ParametroIncorrecto(
              "grupo",
              `la clave de grupo «${grupo}» no es válida`,
            );
          json(respuesta, 200, catalogo.listarMercados(eventoId, grupo));
          return;
        }
        default: {
          const cambios = leerCambios(catalogo, eventoId, url.searchParams);
          if (cambios === undefined)
            problema(respuesta, 410, {
              codigo: "MarcaCaducada",
              title: "Marca demasiado antigua",
              detail: "Vuelve a pedir sin desde.",
            });
          else json(respuesta, 200, cambios);
          return;
        }
      }
    }
    // Una ruta que no existe no es un EventoNoEncontrado: va sin código, como respondería
    // un proxy o cualquier otro servidor.
    fueraDelContrato(respuesta, 404, "No encontrado");
  } catch (error) {
    if (error instanceof ParametroIncorrecto)
      problema(respuesta, 400, {
        codigo: "ParametroNoValido",
        title: "Petición incorrecta",
        detail: error.message,
        parametro: error.parametro,
      });
    else if (error instanceof CatalogoError && eventoId !== undefined)
      problema(respuesta, 404, {
        codigo: "EventoNoEncontrado",
        title: "Evento no encontrado",
        detail: error.message,
        eventoId,
      });
    else throw error;
  }
}

class ParametroIncorrecto extends Error {
  constructor(
    readonly parametro: string,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

function leerFiltro(p: URLSearchParams) {
  const desde = leerFecha(p, "desde");
  const hasta = leerFecha(p, "hasta");
  const tipo = p.get("tipo");
  const estado = p.get("estado");
  return {
    pagina: leerEntero(p, "pagina", 1, 1, Number.MAX_SAFE_INTEGER),
    tamano: leerEntero(p, "tamano", 20, 1, 100),
    ...(tipo ? { tipo } : {}),
    ...(estado ? { estado } : {}),
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  };
}

function leerCambios(catalogo: Catalogo, eventoId: string, p: URLSearchParams) {
  const lista = p.get("mercados");
  const mercados = lista ? new Set(lista.split(",")) : undefined;
  if (mercados && mercados.size > 100)
    throw new ParametroIncorrecto("mercados", "mercados admite hasta 100 ids");
  const desde = p.get("desde");
  if (desde === null) {
    // Sin desde: el estado actual de todo lo pedido.
    return catalogo.describirCambiosActuales(eventoId, mercados);
  }
  const marca = Number(desde);
  if (!Number.isInteger(marca) || marca < 0)
    throw new ParametroIncorrecto("desde", "desde no es una marca válida");
  return catalogo.cambiosDesde(eventoId, marca, mercados);
}

function leerEntero(
  p: URLSearchParams,
  nombre: string,
  porDefecto: number,
  minimo: number,
  maximo: number,
): number {
  const texto = p.get(nombre);
  if (texto === null) return porDefecto;
  const valor = Number(texto);
  if (!Number.isInteger(valor) || valor < minimo || valor > maximo)
    throw new ParametroIncorrecto(
      nombre,
      `${nombre} tiene que ser un entero entre ${minimo} y ${maximo}`,
    );
  return valor;
}

function leerFecha(p: URLSearchParams, nombre: string): Date | undefined {
  const texto = p.get(nombre);
  if (texto === null) return undefined;
  const fecha = new Date(texto);
  if (Number.isNaN(fecha.getTime()))
    throw new ParametroIncorrecto(nombre, `${nombre} no es una fecha válida`);
  return fecha;
}

// El cliente de SignalR manda credenciales, así que no vale «*»: hay que devolver el origen.
function permitirOrigen(
  peticion: IncomingMessage,
  respuesta: ServerResponse,
): void {
  const origen = peticion.headers.origin;
  if (!origen) return;
  respuesta.setHeader("Access-Control-Allow-Origin", origen);
  respuesta.setHeader("Access-Control-Allow-Credentials", "true");
  respuesta.setHeader("Access-Control-Allow-Headers", "*");
  respuesta.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  respuesta.setHeader("Vary", "Origin");
}

function json(
  respuesta: ServerResponse,
  estado: number,
  cuerpo: unknown,
): void {
  respuesta.writeHead(estado, { "Content-Type": "application/json" });
  respuesta.end(JSON.stringify(cuerpo));
}

// RFC 9457, como el backend de verdad.
// Un error del catálogo, como dice el contrato (Problema): con su código y su type.
function problema(
  respuesta: ServerResponse,
  status: number,
  datos: Omit<ProblemaServidor, "type" | "status"> & {
    readonly codigo: CodigoProblemaServidor;
  },
): void {
  const cuerpo: ProblemaServidor = {
    type: `urn:apuestas-deportivas:problema:${datos.codigo}`,
    status,
    ...datos,
  };
  respuesta.writeHead(status, { "Content-Type": "application/problem+json" });
  respuesta.end(JSON.stringify(cuerpo));
}

// Lo que no es del catálogo (un método o una ruta que no existen): sin código.
function fueraDelContrato(
  respuesta: ServerResponse,
  status: number,
  title: string,
): void {
  respuesta.writeHead(status, { "Content-Type": "application/problem+json" });
  respuesta.end(JSON.stringify({ title, status }));
}
