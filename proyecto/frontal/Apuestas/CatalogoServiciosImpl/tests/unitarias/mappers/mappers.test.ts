import {
  aCambioDeCuotas,
  aCambioDeEstado,
  aEvento,
  aEventoDetalle,
  aMercado,
  aMercadosDeGrupo,
  aPaginaEventos,
  aParametros,
} from "../../../src/mappers/mappers.js";
import { assert } from "chai";
import { eventoDetalle, expect, mercado } from "../ayudas.js";

describe("mappers", () => {
  it("un mercado abierto admite apuestas; uno suspendido, no", () => {
    expect(aMercado(mercado("abierto")).seAdmitenApuestas).to.equal(true);
    expect(aMercado(mercado("suspendido")).seAdmitenApuestas).to.equal(false);
  });

  it("copia las selecciones con su cuota, su cuota inicial y su tendencia", () => {
    expect(aMercado(mercado()).selecciones).to.deep.equal([
      {
        id: "s-local",
        descripcion: "Gana el Madrid",
        cuota: 2.1,
        cuotaInicial: 2.4,
        tendencia: "baja",
      },
    ]);
  });

  it("el evento pasa la fecha a Date y dice si está en directo", () => {
    const evento = aEvento({ ...eventoDetalle(), estado: "enJuego" });

    expect(evento.comienzo).to.deep.equal(new Date("2030-05-11T19:00:00Z"));
    expect(evento.enDirecto).to.equal(true);
    expect(aEvento(eventoDetalle()).enDirecto).to.equal(false);
  });

  it("sin mercado principal, o si no viene, queda en null", () => {
    assert.isNull(
      aEvento({ ...eventoDetalle(), mercadoPrincipal: null }).mercadoPrincipal,
    );
    const { mercadoPrincipal: _, ...sinCampo } = eventoDetalle();
    assert.isNull(aEvento(sinCampo).mercadoPrincipal);
  });

  it("el detalle lleva sus grupos y su marca", () => {
    const detalle = aEventoDetalle(eventoDetalle());

    expect(detalle.grupos).to.deep.equal([
      { clave: "goles", nombre: "Goles", numeroMercados: 2 },
    ]);
    expect(detalle.marca).to.equal("7");
    expect(detalle.mercadoPrincipal?.id).to.equal("m-1x2");
  });

  it("la página dice si hay más eventos después", () => {
    const pagina = (p: number, total: number) =>
      aPaginaEventos({
        elementos: [],
        pagina: p,
        tamano: 20,
        total,
        marca: "1",
      });

    expect(pagina(1, 21).hayMas).to.equal(true);
    expect(pagina(2, 40).hayMas).to.equal(false);
    expect(pagina(1, 0).hayMas).to.equal(false);
    expect(
      aPaginaEventos({
        elementos: [eventoDetalle()],
        pagina: 1,
        tamano: 20,
        total: 1,
        marca: "1",
      }).eventos,
    ).to.have.length(1);
  });

  it("los mercados de un grupo llevan su marca", () => {
    expect(
      aMercadosDeGrupo({ marca: "9", mercados: [mercado()] }),
    ).to.deep.include({
      marca: "9",
    });
  });

  it("los cambios de cuotas: un mercado sin estado es uno que ya no se ve (null)", () => {
    expect(
      aCambioDeCuotas({
        eventoId: "e",
        marca: "5",
        cuotas: [
          { seleccionId: "s", mercadoId: "m", cuota: 1.95, tendencia: "baja" },
        ],
        mercados: [
          { mercadoId: "m", estado: "suspendido" },
          { mercadoId: "m2", estado: null },
        ],
      }),
    ).to.deep.equal({
      tipo: "cuotas",
      marca: "5",
      cuotas: [
        { seleccionId: "s", mercadoId: "m", cuota: 1.95, tendencia: "baja" },
      ],
      mercados: [
        { mercadoId: "m", estado: "suspendido" },
        { mercadoId: "m2", estado: null },
      ],
    });
  });

  it("el cambio de estado del evento", () => {
    expect(
      aCambioDeEstado({ eventoId: "e", estado: "finalizado", marca: "8" }),
    ).to.deep.equal({
      tipo: "estado",
      marca: "8",
      estado: "finalizado",
    });
  });

  it("el filtro solo manda lo que se indica, con las fechas en ISO", () => {
    expect(aParametros().toString()).to.equal("");
    expect(
      aParametros({
        tipo: "t-futbol",
        estado: "enJuego",
        desde: new Date("2030-01-01T00:00:00Z"),
        hasta: new Date("2030-01-02T00:00:00Z"),
        pagina: 2,
        tamano: 50,
      }).toString(),
    ).to.equal(
      "tipo=t-futbol&estado=enJuego&desde=2030-01-01T00%3A00%3A00.000Z&hasta=2030-01-02T00%3A00%3A00.000Z&pagina=2&tamano=50",
    );
  });
});
