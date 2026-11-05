import { assert, expect } from "chai";
import {
  comprobarExhaustivo,
  DemasiadasSuscripcionesError,
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  ServicioNoDisponibleError,
  SuscripcionDuplicadaError,
  type ErrorServicioEventos,
} from "../../src/index.js";
import type { CambioEnEvento } from "../../src/index.js";

describe("errores", () => {
  it("EventoNoEncontradoError lleva el id y se distingue con instanceof", () => {
    const error: unknown = new EventoNoEncontradoError("e-1");

    expect(error).to.be.instanceOf(EventoNoEncontradoError);
    expect(error).to.be.instanceOf(Error);
    expect(error).to.include({
      name: "EventoNoEncontradoError",
      eventoId: "e-1",
    });
    expect((error as Error).message).to.equal(
      "No hay ningún evento visible con id e-1.",
    );
  });

  it("PeticionIncorrectaError puede decir qué parámetro no vale", () => {
    expect(new PeticionIncorrectaError("x", "tamano").parametro).to.equal(
      "tamano",
    );
    assert.isUndefined(new PeticionIncorrectaError("x").parametro);
  });

  it("PeticionIncorrectaError lleva el detalle", () => {
    const error = new PeticionIncorrectaError("tamano fuera de rango");

    expect(error.name).to.equal("PeticionIncorrectaError");
    expect(error.detalle).to.equal("tamano fuera de rango");
    expect(error.message).to.equal(
      "Petición incorrecta: tamano fuera de rango",
    );
  });

  it("ServicioNoDisponibleError lleva el motivo y la causa original", () => {
    const causa = new TypeError("fetch failed");
    const error = new ServicioNoDisponibleError("sin conexión", {
      cause: causa,
    });

    expect(error.name).to.equal("ServicioNoDisponibleError");
    expect(error.motivo).to.equal("sin conexión");
    expect(error.cause).to.equal(causa);
    expect(error.message).to.equal(
      "El servicio de eventos no está disponible: sin conexión",
    );
  });

  it("DemasiadasSuscripcionesError lleva el evento que no se ha podido seguir", () => {
    const error = new DemasiadasSuscripcionesError("e-1");

    expect(error.eventoId).to.equal("e-1");
    expect(error.name).to.equal("DemasiadasSuscripcionesError");
    expect(error.message).to.equal(
      "No se puede seguir el evento e-1: ya se siguen todos los que admite el servidor.",
    );
  });

  it("SuscripcionDuplicadaError lleva el evento", () => {
    const error = new SuscripcionDuplicadaError("e-1");

    expect(error.eventoId).to.equal("e-1");
    expect(error.name).to.equal("SuscripcionDuplicadaError");
    expect(error.message).to.equal(
      "Ya hay una suscripción abierta al evento e-1.",
    );
  });

  it("todos son distintos entre sí: cada uno se distingue con instanceof", () => {
    const todos: readonly ErrorServicioEventos[] = [
      new EventoNoEncontradoError("x"),
      new PeticionIncorrectaError("x"),
      new ServicioNoDisponibleError("x"),
      new DemasiadasSuscripcionesError("x"),
      new SuscripcionDuplicadaError("x"),
    ];
    for (const [i, error] of todos.entries())
      for (const [j, otro] of todos.entries())
        expect(
          error instanceof otro.constructor,
          `${error.name} / ${otro.name}`,
        ).to.equal(i === j);
  });
});

describe("comprobarExhaustivo", () => {
  // Un switch completo sobre la unión: si se añadiera un tipo nuevo a CambioEnEvento sin
  // tratarlo aquí, esto dejaría de compilar (npm run tipos).
  function describir(cambio: CambioEnEvento): string {
    switch (cambio.tipo) {
      case "cuotas":
        return `${cambio.cuotas.length} cuotas`;
      case "estado":
        return cambio.estado;
      case "recargar":
        return "recargar";
      default:
        return comprobarExhaustivo(cambio);
    }
  }

  it("trata todos los casos de la unión", () => {
    expect(
      describir({ tipo: "cuotas", marca: "1", cuotas: [], mercados: [] }),
    ).to.equal("0 cuotas");
    expect(
      describir({ tipo: "estado", marca: "2", estado: "finalizado" }),
    ).to.equal("finalizado");
    expect(describir({ tipo: "recargar" })).to.equal("recargar");
  });

  it("si llega un caso que no está en la unión, lanza", () => {
    const desconocido = { tipo: "otro" } as unknown as never;

    expect(() => comprobarExhaustivo(desconocido)).to.throw(
      'Caso no tratado: {"tipo":"otro"}',
    );
  });
});
