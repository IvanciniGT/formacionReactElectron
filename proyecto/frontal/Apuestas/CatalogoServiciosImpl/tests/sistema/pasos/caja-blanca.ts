import { Then as Entonces, When as Cuando } from "@cucumber/cucumber";
import {
  esperarA,
  type MundoCatalogo,
} from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import type { EntornoFake } from "@apuestas-deportivas/catalogo-backend-fake/pruebas";

const EVENTO = "Real Madrid - FC Barcelona";

// Caja blanca: el entorno es el nuestro, y se puede mirar dentro.
const fake = (mundo: MundoCatalogo) => (mundo.entorno as EntornoFake).backend;

Entonces(
  "el servidor ya no me envía sus cambios",
  async function (this: MundoCatalogo) {
    const eventoId = fake(this).catalogo.buscarEventoPorNombre(EVENTO);
    await esperarA(
      () => fake(this).suscritosA(eventoId) === 0,
      "que el servidor dé por cancelada la suscripción",
    );
  },
);

// En el mismo paso y sin esperar: el cambio ocurre con la conexión caída, cuando el servidor
// ya no tiene a quién mandárselo. Solo puede llegar si al reconectar se vuelve a suscribir
// desde la última marca.
Cuando(
  "se corta la conexión y la cuota de {string} pasa a {float} antes de reconectar",
  function (this: MundoCatalogo, seleccion: string, cuota: number) {
    const backend = fake(this);
    const eventoId = backend.catalogo.buscarEventoPorNombre(EVENTO);
    backend.cortarConexiones();
    backend.catalogo.cambiarCuota(
      backend.catalogo.buscarSeleccionPorDescripcion(eventoId, seleccion)
        .seleccionId,
      cuota,
    );
  },
);

// Se acaban las esperas de reconexión (las de CONFIGURACION_DE_PRUEBA son cortas) y la
// suscripción tiene que terminar con error, no quedarse esperando para siempre.
Cuando("el backend se cae y no vuelve", async function (this: MundoCatalogo) {
  await (this.entorno as EntornoFake).parar();
});
