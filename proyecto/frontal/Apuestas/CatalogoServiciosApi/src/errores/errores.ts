// Los errores que puede dar un ServicioEventos, sea cual sea su implementación. Son
// clases para poder distinguirlos con instanceof en el frontal.

export class EventoNoEncontradoError extends Error {
  override readonly name = "EventoNoEncontradoError";

  constructor(readonly eventoId: string) {
    super(`No hay ningún evento visible con id ${eventoId}.`);
  }
}

// Lo que se ha pedido no es válido (un filtro mal formado, por ejemplo). Es un fallo de
// quien llama, no del servidor: reintentar no sirve. parametro: cuál, si se sabe.
export class PeticionIncorrectaError extends Error {
  override readonly name = "PeticionIncorrectaError";

  constructor(
    readonly detalle: string,
    readonly parametro?: string,
  ) {
    super(`Petición incorrecta: ${detalle}`);
  }
}

// El servicio no responde o responde con un error suyo. Reintentar puede servir.
export class ServicioNoDisponibleError extends Error {
  override readonly name = "ServicioNoDisponibleError";

  constructor(
    readonly motivo: string,
    options?: ErrorOptions,
  ) {
    super(`El servicio de eventos no está disponible: ${motivo}`, options);
  }
}

// La conexión ya sigue tantos eventos como admite el servidor. No es una caída: reintentar
// no sirve hasta que se deje de seguir alguno.
export class DemasiadasSuscripcionesError extends Error {
  override readonly name = "DemasiadasSuscripcionesError";

  constructor(readonly eventoId: string) {
    super(
      `No se puede seguir el evento ${eventoId}: ya se siguen todos los que admite el servidor.`,
    );
  }
}

// Ya hay una suscripción abierta a ese evento en este servicio. Si dos componentes
// necesitan el mismo evento, que compartan el Observable (share() de RxJS): una segunda
// suscripción en el servidor sustituiría a la primera sin que esta se enterase.
export class SuscripcionDuplicadaError extends Error {
  override readonly name = "SuscripcionDuplicadaError";

  constructor(readonly eventoId: string) {
    super(`Ya hay una suscripción abierta al evento ${eventoId}.`);
  }
}

// Todo lo que puede lanzar un ServicioEventos ya creado (el de crearlo es
// ConfiguracionNoValidaError). Para un catch o un switch que quiera tratarlos todos.
export type ErrorServicioEventos =
  | EventoNoEncontradoError
  | PeticionIncorrectaError
  | ServicioNoDisponibleError
  | DemasiadasSuscripcionesError
  | SuscripcionDuplicadaError;

// Para el default de un switch sobre una unión discriminada: si falta tratar un caso, no
// compila, porque solo se le puede pasar never.
export function comprobarExhaustivo(valor: never): never {
  throw new Error(`Caso no tratado: ${JSON.stringify(valor)}`);
}
