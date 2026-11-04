import {
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  ServicioNoDisponibleError,
  SuscripcionDuplicadaError,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { expect } from "chai";
import type { ApiCucumber } from "../registrar.js";
import {
  esperarA,
  idDeEvento,
  suscribirse,
  type MundoCatalogo,
} from "../soporte/mundo.js";

// Un id que no es de ningún evento: válido como UUID, para que lo que falle sea que no
// existe y no que esté mal formado.
const NO_EXISTE = "00000000-0000-4000-8000-000000000001";

// Un puerto donde no escucha nadie: así se simula un backend caído desde fuera, sin que el
// entorno tenga que saber pararlo. Vale igual contra un backend fake que contra uno remoto.
const SIN_BACKEND = "http://127.0.0.1:1";

async function intentar(
  mundo: MundoCatalogo,
  accion: () => Promise<unknown>,
): Promise<void> {
  try {
    await accion();
  } catch (error) {
    mundo.error = error;
  }
}

async function terminaCon(
  mundo: MundoCatalogo,
  tipo: new (...argumentos: never[]) => Error,
): Promise<void> {
  await esperarA(
    () => mundo.error !== undefined,
    `que la suscripción termine con ${tipo.name}`,
  );
  expect(mundo.error).to.be.instanceOf(tipo);
}

export function registrarPasosErrores({
  Given: Dado,
  When: Cuando,
  Then: Entonces,
}: ApiCucumber): void {
  Dado("que el backend no responde", async function (this: MundoCatalogo) {
    await this.servicio.cerrar();
    this.servicio = this.crearServicio({
      ...this.configuracion,
      urlBase: SIN_BACKEND,
    });
  });

  // Un servidor que responde, pero no es el catálogo: sus 404 no son EventoNoEncontrado.
  Dado(
    "que el servicio apunta a una URL que no es la del backend",
    async function (this: MundoCatalogo) {
      await this.servicio.cerrar();
      this.servicio = this.crearServicio({
        ...this.configuracion,
        urlBase: `${this.configuracion.urlBase.replace(/\/+$/, "")}/esto-no-es-el-backend`,
      });
    },
  );

  Cuando(
    "intento pedir la lista de eventos",
    async function (this: MundoCatalogo) {
      await intentar(this, () => this.servicio.listarEventos());
    },
  );

  Cuando(
    "intento pedir la lista de eventos con tamaño {int}",
    async function (this: MundoCatalogo, tamano: number) {
      await intentar(this, () => this.servicio.listarEventos({ tamano }));
    },
  );

  Cuando(
    "intento abrir el grupo {string} del evento {string}",
    async function (this: MundoCatalogo, grupo: string, evento: string) {
      const eventoId = await idDeEvento(this, evento);
      await intentar(this, () => this.servicio.listarMercados(eventoId, grupo));
    },
  );

  Cuando(
    "intento abrir el grupo {string} de un evento que no existe",
    async function (this: MundoCatalogo, grupo: string) {
      await intentar(this, () =>
        this.servicio.listarMercados(NO_EXISTE, grupo),
      );
    },
  );

  Cuando(
    "me suscribo a los cambios de un evento que no existe",
    async function (this: MundoCatalogo) {
      const { marca } = await this.servicio.listarEventos();
      suscribirse(this, NO_EXISTE, marca);
    },
  );

  // Más de los que admite el contrato (maxItems: 100). Ids inventados: lo que se rechaza
  // es cuántos son, antes de mirar si existen.
  Cuando(
    "me suscribo a {int} mercados del evento {string}",
    async function (this: MundoCatalogo, cuantos: number, evento: string) {
      const eventoId = await idDeEvento(this, evento);
      const { marca } = await this.servicio.obtenerEvento(eventoId);
      const mercados = Array.from(
        { length: cuantos },
        (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      );
      suscribirse(this, eventoId, marca, mercados);
    },
  );

  // La primera es la de «que estoy viendo el evento»: esta es otra, aparte, que no toca
  // la del mundo.
  Cuando("me suscribo otra vez a sus cambios", function (this: MundoCatalogo) {
    if (!this.evento)
      throw new Error("Primero hay que estar viendo el evento.");
    this.servicio.cambios(this.evento.id, this.evento.marca).subscribe({
      error: (error: unknown) => {
        this.error = error;
      },
    });
  });

  Entonces(
    "me dice que la petición no es válida por {string}",
    function (this: MundoCatalogo, parametro: string) {
      expect(this.error).to.be.instanceOf(PeticionIncorrectaError);
      expect((this.error as PeticionIncorrectaError).parametro).to.equal(
        parametro,
      );
    },
  );

  Entonces(
    "la suscripción termina porque la petición no es válida",
    async function (this: MundoCatalogo) {
      await terminaCon(this, PeticionIncorrectaError);
    },
  );

  Entonces(
    "me dice que el servicio no está disponible",
    function (this: MundoCatalogo) {
      expect(this.error).to.be.instanceOf(ServicioNoDisponibleError);
    },
  );

  Entonces(
    "la suscripción termina porque el evento no se encuentra",
    async function (this: MundoCatalogo) {
      await terminaCon(this, EventoNoEncontradoError);
    },
  );

  Entonces(
    "esa segunda suscripción termina porque ya había una abierta",
    async function (this: MundoCatalogo) {
      await terminaCon(this, SuscripcionDuplicadaError);
      expect(this.terminada, "la primera no debería haber terminado").to.equal(
        false,
      );
    },
  );

  Entonces(
    "la suscripción termina porque el servicio no está disponible",
    async function (this: MundoCatalogo) {
      await terminaCon(this, ServicioNoDisponibleError);
    },
  );
}
