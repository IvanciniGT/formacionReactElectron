import { LogLevel } from "@microsoft/signalr";
import type { NivelDeRegistro } from "@apuestas-deportivas/catalogo-servicios-api";

// Dónde escribe el servicio lo que registra. Por defecto, console.
export interface Registrador {
  depurar(mensaje: string, datos?: unknown): void;
  informar(mensaje: string, datos?: unknown): void;
  avisar(mensaje: string, datos?: unknown): void;
}

const ORDEN: readonly NivelDeRegistro[] = [
  "depuracion",
  "informacion",
  "aviso",
  "ninguno",
];

// Un registrador que solo deja pasar lo que esté a partir del nivel configurado.
export function filtrarPorNivel(
  registrador: Registrador,
  nivel: NivelDeRegistro,
): Registrador {
  const desde = ORDEN.indexOf(nivel);
  const pasa = (n: NivelDeRegistro) => ORDEN.indexOf(n) >= desde;
  return {
    depurar: (m, d) => {
      if (pasa("depuracion")) registrador.depurar(m, d);
    },
    informar: (m, d) => {
      if (pasa("informacion")) registrador.informar(m, d);
    },
    avisar: (m, d) => {
      if (pasa("aviso")) registrador.avisar(m, d);
    },
  };
}

export const registradorDeConsola: Registrador = {
  depurar: (m, d) => {
    console.debug(m, d ?? "");
  },
  informar: (m, d) => {
    console.info(m, d ?? "");
  },
  avisar: (m, d) => {
    console.warn(m, d ?? "");
  },
};

// El nivel equivalente de SignalR.
export function nivelSignalR(nivel: NivelDeRegistro): LogLevel {
  const niveles: Record<NivelDeRegistro, LogLevel> = {
    depuracion: LogLevel.Debug,
    informacion: LogLevel.Information,
    aviso: LogLevel.Warning,
    ninguno: LogLevel.None,
  };
  return niveles[nivel];
}
