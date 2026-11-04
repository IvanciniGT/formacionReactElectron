import type {
  DatosDePrueba,
  EntornoDePruebas,
  EstadoEventoDePrueba,
} from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import { arrancarBackendFake, type BackendFake } from "../index.js";

// El entorno del TCK sobre este backend: un fake nuevo por escenario, en un puerto libre y
// con las cuotas quietas. Vale para cualquier implementación de ServicioEventos que hable
// el contrato: el servicio lo crea el TCK con la fábrica de la implementación.
//
// backend queda a la vista para las pruebas de caja blanca de cada implementación.
export class EntornoFake implements EntornoDePruebas {
  // Lo controla todo: carga los datos de prueba y provoca cualquier cambio.
  readonly controlaElBackend = true;
  private fake: BackendFake | undefined;

  get backend(): BackendFake {
    if (!this.fake) throw new Error("El entorno todavía no ha arrancado.");
    return this.fake;
  }

  async arrancar(datos: DatosDePrueba): Promise<string> {
    this.fake = await arrancarBackendFake({
      puerto: 0,
      moverCuotasCadaMs: 0,
      datos,
    });
    return this.fake.url;
  }

  // Se puede llamar más de una vez: una prueba de caja blanca puede tirar el backend a
  // propósito, y el After del TCK lo vuelve a parar.
  async parar(): Promise<void> {
    const fake = this.fake;
    this.fake = undefined;
    await fake?.parar();
  }

  idDe(evento: string): string {
    return this.backend.catalogo.buscarEventoPorNombre(evento);
  }

  cambiarCuota(
    evento: string,
    seleccion: string,
    cuota: number,
  ): Promise<void> {
    const { catalogo } = this.backend;
    const { seleccionId } = catalogo.buscarSeleccionPorDescripcion(
      this.idDe(evento),
      seleccion,
    );
    catalogo.cambiarCuota(seleccionId, cuota);
    return Promise.resolve();
  }

  cambiarEstadoMercado(
    evento: string,
    mercado: string,
    estado: "abierto" | "suspendido" | "cerrado",
  ): Promise<void> {
    const { catalogo } = this.backend;
    catalogo.cambiarEstadoMercado(
      catalogo.buscarMercadoPorDescripcion(this.idDe(evento), mercado),
      estado,
    );
    return Promise.resolve();
  }

  cambiarEstadoEvento(
    evento: string,
    estado: EstadoEventoDePrueba,
  ): Promise<void> {
    this.backend.catalogo.cambiarEstadoEvento(this.idDe(evento), estado);
    return Promise.resolve();
  }

  async suscripcionRegistrada(evento: string): Promise<void> {
    const eventoId = this.idDe(evento);
    const limite = Date.now() + 5_000;
    while (this.backend.suscritosA(eventoId) === 0) {
      if (Date.now() > limite)
        throw new Error(
          `El backend no ha registrado la suscripción a «${evento}».`,
        );
      await new Promise((resolver) => setTimeout(resolver, 20));
    }
  }
}
