import {
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  ServicioNoDisponibleError,
} from "@apuestas-deportivas/catalogo-servicios-api";
import sinon from "sinon";
import { ServicioEventosHttp } from "../../../src/index.js";
import {
  CONFIGURACION,
  ConexionFalsa,
  eventoDetalle,
  expect,
  ID_EVENTO,
  mercado,
  respuesta,
} from "../ayudas.js";

describe("ServicioEventosHttp · REST", () => {
  let fetch: sinon.SinonStub<
    Parameters<typeof globalThis.fetch>,
    ReturnType<typeof globalThis.fetch>
  >;
  let servicio: ServicioEventosHttp;

  beforeEach(() => {
    fetch = sinon.stub();
    servicio = new ServicioEventosHttp(
      { ...CONFIGURACION, urlBase: "https://api.ejemplo/" },
      { fetch, conexion: new ConexionFalsa() },
    );
  });

  const urlPedida = () => fetch.firstCall.args[0] as string;

  it("lista los tipos", async () => {
    fetch.resolves(respuesta([{ id: "t", nombre: "Partido de fútbol" }]));

    expect(await servicio.listarTipos()).to.deep.equal([
      { id: "t", nombre: "Partido de fútbol" },
    ]);
    expect(urlPedida()).to.equal("https://api.ejemplo/v1/tipos");
    expect(fetch.firstCall.args[1]?.headers).to.deep.equal({
      Accept: "application/json",
    });
    expect(fetch.firstCall.args[1]?.signal).to.be.instanceOf(AbortSignal);
  });

  it("lista los eventos, con el filtro en la URL, como modelos del frontal", async () => {
    fetch.resolves(
      respuesta({
        elementos: [eventoDetalle()],
        pagina: 1,
        tamano: 1,
        total: 3,
        marca: "4",
      }),
    );

    const pagina = await servicio.listarEventos({
      estado: "programado",
      tamano: 1,
    });

    expect(urlPedida()).to.equal(
      "https://api.ejemplo/v1/eventos?estado=programado&tamano=1",
    );
    expect(pagina.hayMas).to.equal(true);
    expect(pagina.eventos[0]?.comienzo).to.be.instanceOf(Date);
  });

  it("sin filtro, la URL va sin parámetros", async () => {
    fetch.resolves(
      respuesta({ elementos: [], pagina: 1, tamano: 20, total: 0, marca: "0" }),
    );

    await servicio.listarEventos();

    expect(urlPedida()).to.equal("https://api.ejemplo/v1/eventos");
  });

  it("obtiene un evento, con el id codificado en la URL", async () => {
    fetch.resolves(respuesta(eventoDetalle()));

    const evento = await servicio.obtenerEvento("a b");

    expect(urlPedida()).to.equal("https://api.ejemplo/v1/eventos/a%20b");
    expect(evento.grupos).to.have.length(1);
  });

  it("lista los mercados de un grupo", async () => {
    fetch.resolves(
      respuesta({ marca: "3", mercados: [mercado("suspendido")] }),
    );

    const { mercados, marca } = await servicio.listarMercados(
      ID_EVENTO,
      "goles y más",
    );

    expect(urlPedida()).to.equal(
      `https://api.ejemplo/v1/eventos/${ID_EVENTO}/mercados?grupo=goles+y+m%C3%A1s`,
    );
    expect(marca).to.equal("3");
    expect(mercados[0]?.seAdmitenApuestas).to.equal(false);
  });

  // Un error del catálogo, como lo manda el backend (Problema del contrato).
  function problema(status: number, datos: Record<string, unknown>): Response {
    return respuesta(
      {
        type: `urn:apuestas-deportivas:problema:${String(datos["codigo"])}`,
        status,
        ...datos,
      },
      status,
    );
  }

  it("EventoNoEncontrado es EventoNoEncontradoError, con el evento", async () => {
    fetch.resolves(
      problema(404, {
        codigo: "EventoNoEncontrado",
        title: "No",
        eventoId: "otro",
      }),
    );

    await expect(servicio.obtenerEvento(ID_EVENTO))
      .to.be.rejectedWith(EventoNoEncontradoError)
      .and.eventually.have.property("eventoId", "otro");
  });

  it("si EventoNoEncontrado no dice el evento, es el pedido", async () => {
    fetch.resolves(
      problema(404, { codigo: "EventoNoEncontrado", title: "No" }),
    );

    await expect(servicio.obtenerEvento(ID_EVENTO))
      .to.be.rejectedWith(EventoNoEncontradoError)
      .and.eventually.have.property("eventoId", ID_EVENTO);
    fetch.resolves(
      problema(404, { codigo: "EventoNoEncontrado", title: "No" }),
    );
    await expect(servicio.listarTipos())
      .to.be.rejectedWith(EventoNoEncontradoError)
      .and.eventually.have.property("eventoId", "");
  });

  it("un 404 sin código no es un evento que no existe: es que eso no es el backend", async () => {
    fetch.resolves(respuesta({ title: "Not Found", status: 404 }, 404));

    await expect(servicio.obtenerEvento(ID_EVENTO)).to.be.rejectedWith(
      ServicioNoDisponibleError,
      "respondió 404 sin ser un error del catálogo",
    );
  });

  it("ParametroNoValido es PeticionIncorrectaError, con el detalle y el parámetro", async () => {
    fetch.resolves(
      problema(400, {
        codigo: "ParametroNoValido",
        title: "Petición incorrecta",
        detail: "tamano > 100",
        parametro: "tamano",
      }),
    );

    const error = await servicio
      .listarEventos({ tamano: 500 })
      .catch((e: unknown) => e);
    expect(error).to.be.instanceOf(PeticionIncorrectaError);
    expect(error).to.include({ detalle: "tamano > 100", parametro: "tamano" });
  });

  it("ParametroNoValido sin detalle usa el título", async () => {
    fetch.resolves(
      problema(400, { codigo: "ParametroNoValido", title: "Mal" }),
    );

    await expect(
      servicio.listarTipos(),
    ).to.eventually.be.rejected.and.have.property("detalle", "Mal");
  });

  it("un 400 sin código, o sin cuerpo, no es del catálogo", async () => {
    fetch.onFirstCall().resolves(respuesta({ title: "Mal", status: 400 }, 400));
    fetch.onSecondCall().resolves(new Response("no es json", { status: 400 }));

    await expect(servicio.listarTipos()).to.be.rejectedWith(
      ServicioNoDisponibleError,
    );
    await expect(servicio.listarTipos()).to.be.rejectedWith(
      ServicioNoDisponibleError,
    );
  });

  it("un código que esta versión no conoce es un fallo del servicio", async () => {
    fetch.resolves(
      problema(409, { codigo: "UnoQueTodaviaNoExiste", title: "?" }),
    );

    await expect(servicio.listarTipos()).to.be.rejectedWith(
      ServicioNoDisponibleError,
      "respondió 409 con el error UnoQueTodaviaNoExiste",
    );
  });

  it("un 5xx es ServicioNoDisponibleError", async () => {
    fetch.resolves(new Response("", { status: 503 }));

    await expect(servicio.listarTipos()).to.be.rejectedWith(
      ServicioNoDisponibleError,
      "respondió 503",
    );
  });

  it("si no responde a tiempo, ServicioNoDisponibleError diciendo cuánto se esperó", async () => {
    const lento = new ServicioEventosHttp(
      { ...CONFIGURACION, tiempoMaximoPeticionMs: 20 },
      { fetch, conexion: new ConexionFalsa() },
    );
    // Un fetch que no contesta nunca: solo termina si se cancela su señal.
    fetch.callsFake(
      (_url, init) =>
        new Promise((_resolver, rechazar) => {
          init?.signal?.addEventListener("abort", () => {
            rechazar(init.signal?.reason as Error);
          });
        }),
    );

    await expect(lento.listarTipos()).to.be.rejectedWith(
      ServicioNoDisponibleError,
      "no ha respondido en 20 ms",
    );
  });

  it("si no hay red, ServicioNoDisponibleError con la causa original", async () => {
    const causa = new TypeError("fetch failed");
    fetch.rejects(causa);

    await expect(servicio.listarTipos())
      .to.be.rejectedWith(ServicioNoDisponibleError, "no se ha podido conectar")
      .and.eventually.have.property("cause", causa);
  });

  describe("sin dependencias inyectadas", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("usa el fetch global", async () => {
      const global = sinon.stub(globalThis, "fetch").resolves(respuesta([]));
      const porDefecto = new ServicioEventosHttp(CONFIGURACION, {
        conexion: new ConexionFalsa(),
      });

      await porDefecto.listarTipos();

      expect(global.firstCall.args[0]).to.equal("https://api.ejemplo/v1/tipos");
    });

    it("crea su propia conexión SignalR, sin abrirla hasta la primera suscripción", () => {
      expect(
        () => new ServicioEventosHttp(CONFIGURACION, { fetch }),
      ).not.to.throw();
    });
  });
});
