import { expect } from "chai";
import { Catalogo, CatalogoError } from "../../../src/catalogo/catalogo.js";
import type { DatosCatalogo } from "../../../src/catalogo/datos.js";

const FUTBOL = { id: "t-futbol", nombre: "Partido de fútbol" };
const TENIS = { id: "t-tenis", nombre: "Partido de tenis" };

function datos(): DatosCatalogo {
  return {
    grupos: { principales: "Principales", goles: "Goles" },
    tipos: [FUTBOL, TENIS],
    eventos: [
      {
        id: "e-tarde",
        nombre: "Tarde",
        tipoId: FUTBOL.id,
        comienzo: "2030-01-01T18:00:00Z",
        estado: "programado",
        mercados: [
          {
            id: "m-1x2",
            tipo: "1X2",
            grupo: "principales",
            descripcion: "Quién gana",
            estado: "abierto",
            principal: true,
            selecciones: [
              { id: "s-local", descripcion: "Local", cuota: 2.1 },
              { id: "s-empate", descripcion: "Empate", cuota: 3.4 },
            ],
          },
          {
            id: "m-goles",
            tipo: "MAS_MENOS",
            grupo: "goles",
            descripcion: "Más/menos",
            estado: "suspendido",
            selecciones: [{ id: "s-mas", descripcion: "Más", cuota: 1.8 }],
          },
          {
            id: "m-cerrado",
            tipo: "1X2_DESCANSO",
            grupo: "principales",
            descripcion: "Al descanso",
            estado: "cerrado",
            selecciones: [{ id: "s-desc", descripcion: "Local", cuota: 2.8 }],
          },
        ],
      },
      {
        id: "e-manana",
        nombre: "Mañana",
        tipoId: FUTBOL.id,
        comienzo: "2030-01-01T10:00:00Z",
        estado: "enJuego",
        mercados: [],
      },
      {
        id: "e-acabado",
        nombre: "Acabado",
        tipoId: TENIS.id,
        comienzo: "2029-12-31T10:00:00Z",
        estado: "finalizado",
        mercados: [],
      },
    ],
  };
}

describe("Catalogo", () => {
  let catalogo: Catalogo;
  beforeEach(() => {
    catalogo = new Catalogo(datos());
  });

  describe("consultas", () => {
    it("lista solo los eventos visibles, por orden de comienzo, con su mercado principal", () => {
      const pagina = catalogo.listarEventos({ pagina: 1, tamano: 20 });

      expect(pagina.elementos.map((e) => e.nombre)).to.deep.equal([
        "Mañana",
        "Tarde",
      ]);
      expect(pagina.total).to.equal(2);
      expect(pagina.marca).to.equal("0");
      expect(pagina.elementos[0]?.mercadoPrincipal).to.equal(null);
      expect(pagina.elementos[1]?.mercadoPrincipal?.id).to.equal("m-1x2");
    });

    it("filtra por tipo, estado y fechas, y pagina", () => {
      const filtrar = (f: object) =>
        catalogo
          .listarEventos({ pagina: 1, tamano: 20, ...f })
          .elementos.map((e) => e.nombre);

      expect(filtrar({ tipo: TENIS.id })).to.deep.equal([]);
      expect(filtrar({ estado: "enJuego" })).to.deep.equal(["Mañana"]);
      expect(
        filtrar({ desde: new Date("2030-01-01T12:00:00Z") }),
      ).to.deep.equal(["Tarde"]);
      expect(
        filtrar({ hasta: new Date("2030-01-01T12:00:00Z") }),
      ).to.deep.equal(["Mañana"]);
      const segunda = catalogo.listarEventos({ pagina: 2, tamano: 1 });
      expect(segunda.elementos.map((e) => e.nombre)).to.deep.equal(["Tarde"]);
      expect(segunda.total).to.equal(2);
    });

    it("solo ofrece tipos que tengan algún evento visible", () => {
      expect(catalogo.listarTipos()).to.deep.equal([FUTBOL]);
    });

    it("el detalle cuenta los mercados visibles de cada grupo, sin los cerrados", () => {
      const detalle = catalogo.obtenerEvento("e-tarde");

      expect(detalle.grupos).to.deep.equal([
        { clave: "principales", nombre: "Principales", numeroMercados: 1 },
        { clave: "goles", nombre: "Goles", numeroMercados: 1 },
      ]);
      expect(detalle.marca).to.equal("0");
    });

    it("un grupo sin nombre configurado usa su clave", () => {
      const d = datos();
      const sinNombre = new Catalogo({ ...d, grupos: {} });

      expect(sinNombre.obtenerEvento("e-tarde").grupos[0]?.nombre).to.equal(
        "principales",
      );
    });

    it("da los mercados de un grupo con sus selecciones y la cuota inicial", () => {
      const { mercados } = catalogo.listarMercados("e-tarde", "goles");

      expect(mercados).to.deep.equal([
        {
          id: "m-goles",
          tipo: "MAS_MENOS",
          grupo: "goles",
          descripcion: "Más/menos",
          estado: "suspendido",
          selecciones: [
            {
              id: "s-mas",
              descripcion: "Más",
              cuota: 1.8,
              cuotaInicial: 1.8,
              tendencia: "igual",
            },
          ],
        },
      ]);
    });

    it("un evento que no se ve no se encuentra", () => {
      expect(() => catalogo.obtenerEvento("e-acabado"))
        .to.throw(CatalogoError)
        .with.property("codigo", "EventoNoEncontrado");
      expect(() => catalogo.listarMercados("no-existe", "goles")).to.throw(
        "EventoNoEncontrado: no hay ningún evento visible con id no-existe",
      );
      expect(catalogo.esEventoVisible("e-tarde")).to.equal(true);
      expect(catalogo.esEventoVisible("e-acabado")).to.equal(false);
    });
  });

  describe("cambios", () => {
    it("cambiar una cuota calcula la tendencia, redondea a 2 decimales y avanza la marca", () => {
      catalogo.cambiarCuota("s-local", 1.954);
      expect(catalogo.marca).to.equal("1");
      expect(catalogo.cambiosDesde("e-tarde", 0)?.cuotas).to.deep.equal([
        {
          seleccionId: "s-local",
          mercadoId: "m-1x2",
          cuota: 1.95,
          tendencia: "baja",
        },
      ]);

      catalogo.cambiarCuota("s-local", 2.5);
      catalogo.cambiarCuota("s-empate", 3.4);
      const cuotas = catalogo.cambiosDesde("e-tarde", 0)?.cuotas ?? [];
      expect(
        cuotas.map((c) => [c.seleccionId, c.cuota, c.tendencia]),
      ).to.deep.equal([
        ["s-local", 2.5, "sube"],
        ["s-empate", 3.4, "igual"],
      ]);
    });

    it("la cuota inicial no cambia nunca", () => {
      catalogo.cambiarCuota("s-local", 1.5);

      const local = catalogo.listarMercados("e-tarde", "principales")
        .mercados[0]?.selecciones[0];
      expect(local).to.include({ cuota: 1.5, cuotaInicial: 2.1 });
    });

    it("no admite una cuota de 1 o menos", () => {
      expect(() => {
        catalogo.cambiarCuota("s-local", 1);
      }).to.throw(RangeError);
      expect(catalogo.marca).to.equal("0");
    });

    it("da solo lo que ha cambiado después de la marca, y solo de los mercados pedidos", () => {
      catalogo.cambiarCuota("s-local", 2.2);
      const marca = Number(catalogo.marca);
      catalogo.cambiarCuota("s-mas", 1.9);
      catalogo.cambiarEstadoMercado("m-1x2", "suspendido");

      const todo = catalogo.cambiosDesde("e-tarde", marca);
      expect(todo?.cuotas.map((c) => c.seleccionId)).to.deep.equal(["s-mas"]);
      expect(todo?.mercados).to.deep.equal([
        { mercadoId: "m-1x2", estado: "suspendido" },
      ]);
      expect(todo?.marca).to.equal("3");

      const soloGoles = catalogo.cambiosDesde(
        "e-tarde",
        marca,
        new Set(["m-goles"]),
      );
      expect(soloGoles?.cuotas.map((c) => c.seleccionId)).to.deep.equal([
        "s-mas",
      ]);
      expect(soloGoles?.mercados).to.deep.equal([]);
    });

    it("un mercado cerrado se notifica con estado null: hay que quitarlo de la pantalla", () => {
      catalogo.cambiarEstadoMercado("m-goles", "cerrado");

      expect(catalogo.cambiosDesde("e-tarde", 0)?.mercados).to.deep.equal([
        { mercadoId: "m-goles", estado: null },
      ]);
    });

    it("los cambios de estado del evento no van en los cambios de cuotas", () => {
      catalogo.cambiarEstadoEvento("e-tarde", "interrumpido");

      expect(catalogo.cambiosDesde("e-tarde", 0)).to.deep.include({
        cuotas: [],
        mercados: [],
      });
    });

    it("si todavía no ha cambiado nada, no hay cambios que dar", () => {
      expect(catalogo.cambiosDesde("e-tarde", 0)).to.deep.equal({
        marca: "0",
        cuotas: [],
        mercados: [],
      });
    });

    it("una marca más antigua que lo que se guarda no se puede responder", () => {
      const corto = new Catalogo(datos(), 2);
      corto.cambiarCuota("s-local", 2.2);
      corto.cambiarCuota("s-local", 2.3);
      corto.cambiarCuota("s-local", 2.4);

      expect(corto.cambiosDesde("e-tarde", 0)).to.equal(undefined);
      expect(corto.cambiosDesde("e-tarde", 1)?.cuotas).to.have.length(1);
    });

    it("el estado actual de todo, en formato de cambios", () => {
      const actual = catalogo.describirCambiosActuales("e-tarde");

      expect(actual.cuotas.map((c) => c.seleccionId)).to.deep.equal([
        "s-local",
        "s-empate",
        "s-mas",
      ]);
      expect(actual.mercados.map((m) => m.mercadoId)).to.deep.equal([
        "m-1x2",
        "m-goles",
      ]);
      expect(
        catalogo.describirCambiosActuales("e-tarde", new Set(["m-goles"]))
          .cuotas,
      ).to.have.length(1);
    });

    it("avisa a quien escucha, hasta que deja de escuchar", () => {
      const oidos: string[] = [];
      const dejar = catalogo.alCambiar((c) =>
        oidos.push(`${c.tipo}:${c.marca}`),
      );

      catalogo.cambiarCuota("s-local", 2.2);
      catalogo.cambiarEstadoEvento("e-tarde", "finalizado");
      dejar();
      catalogo.cambiarEstadoEvento("e-manana", "finalizado");

      expect(oidos).to.deep.equal(["cuota:1", "evento:2"]);
    });

    it("mueve una cuota al azar solo en mercados abiertos de eventos visibles", () => {
      catalogo.moverUnaCuotaAlAzar(() => 0);

      expect(
        catalogo.cambiosDesde("e-tarde", 0)?.cuotas.map((c) => c.seleccionId),
      ).to.deep.equal(["s-local"]);
    });

    it("sin ningún mercado abierto, mover al azar no hace nada", () => {
      catalogo.cambiarEstadoMercado("m-1x2", "suspendido");
      const marca = catalogo.marca;

      catalogo.moverUnaCuotaAlAzar(() => 0);

      expect(catalogo.marca).to.equal(marca);
    });

    it("lo que no existe no se puede cambiar", () => {
      expect(() => {
        catalogo.cambiarCuota("no", 2);
      }).to.throw("SeleccionNoEncontrada");
      expect(() => {
        catalogo.cambiarEstadoMercado("no", "abierto");
      }).to.throw("MercadoNoEncontrado");
      expect(() => {
        catalogo.cambiarEstadoEvento("no", "enJuego");
      }).to.throw("EventoNoEncontrado");
    });
  });

  describe("búsquedas para las pruebas", () => {
    it("encuentra un evento por su nombre y una selección por su descripción", () => {
      expect(catalogo.buscarEventoPorNombre("Tarde")).to.equal("e-tarde");
      expect(
        catalogo.buscarMercadoPorDescripcion("e-tarde", "Más/menos"),
      ).to.equal("m-goles");
      expect(() =>
        catalogo.buscarMercadoPorDescripcion("e-tarde", "Otro"),
      ).to.throw("MercadoNoEncontrado");
      expect(() =>
        catalogo.buscarMercadoPorDescripcion("no-existe", "Otro"),
      ).to.throw("MercadoNoEncontrado");
      expect(
        catalogo.buscarSeleccionPorDescripcion("e-tarde", "Empate"),
      ).to.deep.equal({
        seleccionId: "s-empate",
        mercadoId: "m-1x2",
      });
      expect(() => catalogo.buscarEventoPorNombre("Otro")).to.throw(
        "EventoNoEncontrado",
      );
      expect(() =>
        catalogo.buscarSeleccionPorDescripcion("e-tarde", "Otra"),
      ).to.throw("SeleccionNoEncontrada");
      expect(() =>
        catalogo.buscarSeleccionPorDescripcion("no-existe", "Otra"),
      ).to.throw("SeleccionNoEncontrada");
    });

    it("no se puede cargar un evento con un tipo que no existe", () => {
      const d = datos();
      const roto = { ...d, eventos: [{ ...d.eventos[0]!, tipoId: "no" }] };

      expect(() => new Catalogo(roto)).to.throw("tiene un tipo que no existe");
    });
  });
});
