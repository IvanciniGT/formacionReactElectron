import { EventoNoEncontradoError } from "@apuestas-deportivas/catalogo-servicios-api";
import type { DataTable } from "@cucumber/cucumber";
import { expect } from "chai";
import { idDeEvento, type MundoCatalogo } from "../soporte/mundo.js";
import type { ApiCucumber } from "../registrar.js";

export function registrarPasosCatalogo({
  Given: Dado,
  When: Cuando,
  Then: Entonces,
}: ApiCucumber): void {
  Dado("el catálogo de pruebas", function (this: MundoCatalogo) {
    // Lo carga el Before: datos/catalogo.json del TCK.
    expect(this.servicio).not.to.equal(undefined);
  });

  Cuando("pido la lista de eventos", async function (this: MundoCatalogo) {
    this.pagina = await this.servicio.listarEventos();
  });

  Entonces(
    "veo estos eventos, en este orden:",
    function (this: MundoCatalogo, tabla: DataTable) {
      expect(this.pagina?.eventos.map((e) => e.nombre)).to.deep.equal(
        tabla.raw().map((f) => f[0]),
      );
    },
  );

  Entonces(
    "{string} está en directo",
    function (this: MundoCatalogo, nombre: string) {
      expect(
        this.pagina?.eventos.find((e) => e.nombre === nombre)?.enDirecto,
      ).to.equal(true);
    },
  );

  Entonces(
    "{string} no está en directo",
    function (this: MundoCatalogo, nombre: string) {
      expect(
        this.pagina?.eventos.find((e) => e.nombre === nombre)?.enDirecto,
      ).to.equal(false);
    },
  );

  Entonces(
    "el mercado principal de {string} es {string}, con estas cuotas:",
    function (
      this: MundoCatalogo,
      nombre: string,
      descripcion: string,
      tabla: DataTable,
    ) {
      const mercado = this.pagina?.eventos.find(
        (e) => e.nombre === nombre,
      )?.mercadoPrincipal;
      expect(mercado?.descripcion).to.equal(descripcion);
      expect(
        mercado?.selecciones.map((s) => [s.descripcion, s.cuota]),
      ).to.deep.equal(
        tabla.raw().map(([seleccion, cuota]) => [seleccion, Number(cuota)]),
      );
    },
  );

  Cuando(
    "abro el evento {string}",
    async function (this: MundoCatalogo, nombre: string) {
      this.evento = await this.servicio.obtenerEvento(
        await idDeEvento(this, nombre),
      );
    },
  );

  Entonces(
    "veo estos grupos de mercados:",
    function (this: MundoCatalogo, tabla: DataTable) {
      expect(
        this.evento?.grupos.map((g) => [g.nombre, g.numeroMercados]),
      ).to.deep.equal(
        tabla.raw().map(([grupo, numero]) => [grupo, Number(numero)]),
      );
    },
  );

  Cuando(
    "abro el grupo {string} del evento {string}",
    async function (this: MundoCatalogo, grupo: string, nombre: string) {
      this.mercados = (
        await this.servicio.listarMercados(
          await idDeEvento(this, nombre),
          grupo,
        )
      ).mercados;
    },
  );

  Entonces(
    "veo el mercado {string} sin poder apostar en él",
    function (this: MundoCatalogo, descripcion: string) {
      const mercado = this.mercados?.find((m) => m.descripcion === descripcion);
      expect(mercado?.estado).to.equal("suspendido");
      expect(mercado?.seAdmitenApuestas).to.equal(false);
    },
  );

  Cuando("abro un evento que no existe", async function (this: MundoCatalogo) {
    try {
      await this.servicio.obtenerEvento("00000000-0000-4000-8000-000000000001");
    } catch (error) {
      this.error = error;
    }
  });

  Entonces(
    "me dice que el evento no se encuentra",
    function (this: MundoCatalogo) {
      expect(this.error).to.be.instanceOf(EventoNoEncontradoError);
    },
  );
}
