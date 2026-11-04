import type {
  CambioDeCuota,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { expect } from "chai";
import {
  esperarA,
  idDeEvento,
  mercadosDeEvento,
  suscribirse,
  type MundoCatalogo,
} from "../soporte/mundo.js";
import type { ApiCucumber } from "../registrar.js";

const EVENTO = "Real Madrid - FC Barcelona";

function cuotasRecibidas(mundo: MundoCatalogo): CambioDeCuota[] {
  return mundo.recibidos.flatMap((c) => (c.tipo === "cuotas" ? c.cuotas : []));
}

async function buscarEnEvento<T>(
  mundo: MundoCatalogo,
  encontrar: (mercados: readonly Mercado[]) => T | undefined,
  descripcion: string,
): Promise<T> {
  const encontrado = encontrar(
    await mercadosDeEvento(mundo, await idDeEvento(mundo, EVENTO)),
  );
  if (encontrado === undefined)
    throw new Error(`No se ve «${descripcion}» en ${EVENTO}.`);
  return encontrado;
}

const idDeSeleccion = (mundo: MundoCatalogo, descripcion: string) =>
  buscarEnEvento(
    mundo,
    (ms) =>
      ms
        .flatMap((m) => m.selecciones)
        .find((s) => s.descripcion === descripcion)?.id,
    descripcion,
  );

const idDeMercado = (mundo: MundoCatalogo, descripcion: string) =>
  buscarEnEvento(
    mundo,
    (ms) => ms.find((m) => m.descripcion === descripcion)?.id,
    descripcion,
  );

export function registrarPasosTiempoReal({
  Given: Dado,
  When: Cuando,
  Then: Entonces,
}: ApiCucumber): void {
  Dado(
    "que he cargado el evento {string}",
    async function (this: MundoCatalogo, nombre: string) {
      this.evento = await this.servicio.obtenerEvento(
        await idDeEvento(this, nombre),
      );
    },
  );

  Dado(
    "que estoy viendo el evento {string}",
    async function (this: MundoCatalogo, nombre: string) {
      this.evento = await this.servicio.obtenerEvento(
        await idDeEvento(this, nombre),
      );
      suscribirse(this, this.evento.id, this.evento.marca);
      await this.entorno.suscripcionRegistrada(nombre);
    },
  );

  Dado(
    "que estoy viendo solo el grupo {string} del evento {string}",
    async function (this: MundoCatalogo, grupo: string, nombre: string) {
      const eventoId = await idDeEvento(this, nombre);
      const { mercados, marca } = await this.servicio.listarMercados(
        eventoId,
        grupo,
      );
      suscribirse(
        this,
        eventoId,
        marca,
        mercados.map((m) => m.id),
      );
      await this.entorno.suscripcionRegistrada(nombre);
    },
  );

  Cuando("me suscribo a sus cambios", async function (this: MundoCatalogo) {
    if (!this.evento) throw new Error("Primero hay que cargar el evento.");
    suscribirse(this, this.evento.id, this.evento.marca);
    await this.entorno.suscripcionRegistrada(this.evento.nombre);
  });

  Cuando(
    "la cuota de {string} pasa a {float}",
    async function (this: MundoCatalogo, seleccion: string, cuota: number) {
      await this.entorno.cambiarCuota(EVENTO, seleccion, cuota);
    },
  );

  Cuando(
    "se suspende el mercado {string}",
    async function (this: MundoCatalogo, mercado: string) {
      await this.entorno.cambiarEstadoMercado(EVENTO, mercado, "suspendido");
    },
  );

  Cuando(
    "el evento pasa a {string}",
    async function (this: MundoCatalogo, estado: string) {
      await this.entorno.cambiarEstadoEvento(EVENTO, estado as "finalizado");
    },
  );

  Cuando("dejo de verlo", function (this: MundoCatalogo) {
    this.suscripcion?.unsubscribe();
  });

  Entonces(
    "veo que la cuota de {string} es {float} y {word}",
    async function (
      this: MundoCatalogo,
      seleccion: string,
      cuota: number,
      tendencia: string,
    ) {
      const id = await idDeSeleccion(this, seleccion);
      await esperarA(
        () => cuotasRecibidas(this).some((c) => c.seleccionId === id),
        `un cambio de la cuota de «${seleccion}»`,
      );
      expect(
        cuotasRecibidas(this)
          .filter((c) => c.seleccionId === id)
          .at(-1),
      ).to.include({
        cuota,
        tendencia,
      });
    },
  );

  Entonces(
    "no veo ningún cambio de {string}",
    async function (this: MundoCatalogo, seleccion: string) {
      const id = await idDeSeleccion(this, seleccion);
      expect(cuotasRecibidas(this).map((c) => c.seleccionId)).not.to.include(
        id,
      );
    },
  );

  Entonces(
    "veo que el mercado {string} está suspendido",
    async function (this: MundoCatalogo, mercado: string) {
      const id = await idDeMercado(this, mercado);
      await esperarA(
        () =>
          this.recibidos.some(
            (c) =>
              c.tipo === "cuotas" &&
              c.mercados.some(
                (m) => m.mercadoId === id && m.estado === "suspendido",
              ),
          ),
        `que el mercado «${mercado}» se suspenda`,
      );
    },
  );

  Entonces(
    "veo que el evento pasa a {string}",
    async function (this: MundoCatalogo, estado: string) {
      await esperarA(
        () =>
          this.recibidos.some(
            (c) => c.tipo === "estado" && c.estado === estado,
          ),
        `que el evento pase a ${estado}`,
      );
    },
  );

  Entonces("la suscripción ha terminado", async function (this: MundoCatalogo) {
    await esperarA(() => this.terminada, "que la suscripción termine");
  });

  Entonces("no recibo nada más", async function (this: MundoCatalogo) {
    // No hay forma de esperar a que algo no llegue: se da un margen generoso y se comprueba.
    await new Promise((resolver) => setTimeout(resolver, 300));
    expect(this.recibidos).to.deep.equal([]);
  });
}
