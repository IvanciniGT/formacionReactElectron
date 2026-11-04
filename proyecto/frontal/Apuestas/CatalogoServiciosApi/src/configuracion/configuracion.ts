// Lo que se configura de cualquier ServicioEventos, sea cual sea la implementación. Ninguna
// librería decide los valores: los pone quien la ensambla (la aplicación, según su
// entorno) al crear el servicio. Los perfiles de desarrollo y producción viven allí.
export interface ConfiguracionServicioEventos {
  // Donde está el backend, por ejemplo https://apuestas.ejemplo.
  readonly urlBase: string;
  // Lo que se espera a una petición REST antes de darla por fallida.
  readonly tiempoMaximoPeticionMs: number;
  // Las esperas entre intentos al perder la conexión con el backend. Agotadas, se deja de
  // intentar y las suscripciones terminan con ServicioNoDisponibleError. [] es no
  // reintentar.
  readonly esperasReconexionMs: readonly number[];
  // Desarrollo, 1, 2, 3, 4, 
  // Producción: 1, 10, 30, 60
  readonly nivelDeRegistro: NivelDeRegistro;
}

export type NivelDeRegistro =
  "depuracion" | "informacion" | "aviso" | "ninguno";

export class ConfiguracionNoValidaError extends Error {
  override readonly name = "ConfiguracionNoValidaError";
}

// Toda implementación la comprueba al crear el servicio, con esta misma función: así todas
// rechazan lo mismo con el mismo error. Mejor fallar al construir que en la primera
// petición, cuando ya no se sabe de dónde vino.
export function comprobarConfiguracion(c: ConfiguracionServicioEventos): void {
  let url: URL;
  try {
    url = new URL(c.urlBase);
  } catch {
    throw new ConfiguracionNoValidaError(
      `urlBase no es una URL: «${c.urlBase}».`,
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new ConfiguracionNoValidaError(
      `urlBase tiene que ser http o https: «${c.urlBase}».`,
    );
  if (
    !Number.isFinite(c.tiempoMaximoPeticionMs) ||
    c.tiempoMaximoPeticionMs <= 0
  )
    throw new ConfiguracionNoValidaError(
      "tiempoMaximoPeticionMs tiene que ser mayor que 0.",
    );
  if (c.esperasReconexionMs.some((ms) => !Number.isFinite(ms) || ms < 0))
    throw new ConfiguracionNoValidaError(
      "esperasReconexionMs no admite esperas negativas.",
    );
}
