import type { EntornoDePruebas } from "./entorno.js";

// Un backend que ya está desplegado y no se controla: solo se sabe su URL. Con él, el TCK
// es una prueba de integración (la implementación contra el backend de verdad), y solo se
// ejecutan los escenarios que no necesitan los datos de prueba ni provocar cambios. Los
// demás llegarán cuando el backend tenga un API del operador con el que provocarlos.
export class EntornoRemoto implements EntornoDePruebas {
  readonly controlaElBackend = false;

  constructor(private readonly urlBase: string) {}

  arrancar(): Promise<string> {
    return Promise.resolve(this.urlBase);
  }

  parar(): Promise<void> {
    return Promise.resolve();
  }

  cambiarCuota(): Promise<void> {
    return this.noSePuede();
  }

  cambiarEstadoMercado(): Promise<void> {
    return this.noSePuede();
  }

  cambiarEstadoEvento(): Promise<void> {
    return this.noSePuede();
  }

  suscripcionRegistrada(): Promise<void> {
    return this.noSePuede();
  }

  // No debería llegar a pasar: los escenarios que lo usan llevan @controla-el-backend.
  private noSePuede(): Promise<never> {
    return Promise.reject(
      new Error(
        "Este entorno no controla el backend: al escenario le falta @controla-el-backend.",
      ),
    );
  }
}
