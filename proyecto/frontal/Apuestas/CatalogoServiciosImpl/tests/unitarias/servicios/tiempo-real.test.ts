import {
  DemasiadasSuscripcionesError,
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  ServicioNoDisponibleError,
  SuscripcionDuplicadaError,
  type CambioEnEvento,
} from "@apuestas-deportivas/catalogo-servicios-api";
import sinon from "sinon";
import { ServicioEventosHttp } from "../../../src/index.js";
import {
  CONFIGURACION,
  ConexionFalsa,
  esperar,
  expect,
  ID_EVENTO,
} from "../ayudas.js";

const OTRO_EVENTO = "22222222-2222-4222-8222-222222222222";

const cambiosDe = (eventoId: string, marca: string) => ({
  eventoId,
  marca,
  cuotas: [
    { seleccionId: "s", mercadoId: "m", cuota: 1.95, tendencia: "baja" },
  ],
  mercados: [],
});

describe("ServicioEventosHttp · tiempo real", () => {
  let conexion: ConexionFalsa;
  let servicio: ServicioEventosHttp;
  let recibidos: CambioEnEvento[];
  let errores: unknown[];
  let completado: boolean;

  beforeEach(() => {
    conexion = new ConexionFalsa();
    servicio = new ServicioEventosHttp(CONFIGURACION, {
      fetch: sinon.stub(),
      conexion,
    });
    recibidos = [];
    errores = [];
    completado = false;
  });

  function suscribir(eventoId = ID_EVENTO, desde = "7", mercados?: string[]) {
    return servicio.cambios(eventoId, desde, mercados).subscribe({
      next: (c) => recibidos.push(c),
      error: (e: unknown) => errores.push(e),
      complete: () => {
        completado = true;
      },
    });
  }

  it("al suscribirse abre la conexión y se suscribe en el servidor desde la marca", async () => {
    suscribir(ID_EVENTO, "7");
    await esperar();

    expect(conexion.iniciar.callCount).to.equal(1);
    expect(conexion.invocaciones("Suscribir")).to.deep.equal([
      { eventoId: ID_EVENTO, desde: "7" },
    ]);
  });

  it("con mercados, solo pide esos", async () => {
    suscribir(ID_EVENTO, "7", ["m1", "m2"]);
    await esperar();

    expect(conexion.invocaciones("Suscribir")).to.deep.equal([
      { eventoId: ID_EVENTO, desde: "7", mercados: ["m1", "m2"] },
    ]);
  });

  it("varios eventos comparten una sola conexión", async () => {
    suscribir(ID_EVENTO);
    suscribir(OTRO_EVENTO);
    await esperar();

    expect(conexion.iniciar.callCount).to.equal(1);
    expect(conexion.invocaciones("Suscribir")).to.have.length(2);
  });

  it("entrega los cambios de su evento, como modelos del frontal, y no los de otros", async () => {
    suscribir();
    await esperar();

    conexion.emitir("Cambios", cambiosDe(OTRO_EVENTO, "8"));
    conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "9"));

    expect(recibidos).to.deep.equal([
      {
        tipo: "cuotas",
        marca: "9",
        cuotas: [
          { seleccionId: "s", mercadoId: "m", cuota: 1.95, tendencia: "baja" },
        ],
        mercados: [],
      },
    ]);
  });

  it("al reconectar se vuelve a suscribir desde la última marca recibida", async () => {
    suscribir(ID_EVENTO, "7");
    await esperar();
    conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "12"));

    conexion.reconectar();
    await esperar();

    expect(conexion.invocaciones("Suscribir")).to.deep.equal([
      { eventoId: ID_EVENTO, desde: "7" },
      { eventoId: ID_EVENTO, desde: "12" },
    ]);
  });

  it("si la conexión se pierde y no se recupera, todas las suscripciones terminan con ServicioNoDisponibleError", async () => {
    suscribir(ID_EVENTO);
    suscribir("22222222-2222-4222-8222-222222222222");
    await esperar();

    const causa = new Error("WebSocket closed with status code: 1006");
    conexion.cerrarse(causa);

    expect(errores).to.have.length(2);
    for (const error of errores) {
      expect(error).to.be.instanceOf(ServicioNoDisponibleError);
      expect((error as Error).cause).to.equal(causa);
    }
  });

  it("si al perder la conexión alguien se vuelve a suscribir en ese momento, la nueva no termina", async () => {
    const deLaNueva: unknown[] = [];
    servicio.cambios(ID_EVENTO, "7").subscribe({
      // Lo que haría un reintento: volver a suscribirse en cuanto llega el error.
      error: () => {
        servicio
          .cambios(ID_EVENTO, "7")
          .subscribe({ error: (e: unknown) => deLaNueva.push(e) });
      },
    });
    await esperar();

    conexion.cerrarse(new Error("sin red"));
    await esperar();

    expect(deLaNueva).to.deep.equal([]);
  });

  it("después de perder la conexión, la siguiente suscripción la vuelve a abrir", async () => {
    suscribir();
    await esperar();
    conexion.cerrarse(new Error("sin red"));

    suscribir();
    await esperar();

    expect(conexion.iniciar.callCount).to.equal(2);
    expect(errores).to.have.length(1);
  });

  it("al cerrar el servicio a propósito, nadie termina con error", async () => {
    suscribir();
    await esperar();

    await servicio.cerrar();
    conexion.cerrarse();

    expect(errores).to.deep.equal([]);
    expect(completado).to.equal(true);
  });

  it("si al reconectar el evento ya no existe, la suscripción termina con error", async () => {
    suscribir();
    await esperar();
    conexion.invocar.rejects(new Error("EventoNoEncontrado: ya no se ve"));

    conexion.reconectar();
    await esperar();

    expect(errores[0]).to.be.instanceOf(EventoNoEncontradoError);
  });

  it("un cambio de estado se entrega y su marca cuenta para reconectar", async () => {
    suscribir(ID_EVENTO, "7");
    await esperar();

    conexion.emitir("CambioDeEvento", {
      eventoId: ID_EVENTO,
      estado: "interrumpido",
      marca: "15",
    });
    conexion.reconectar();
    await esperar();

    expect(recibidos).to.deep.equal([
      { tipo: "estado", marca: "15", estado: "interrumpido" },
    ]);
    expect(completado).to.equal(false);
    expect(conexion.invocaciones("Suscribir").at(-1)).to.deep.equal({
      eventoId: ID_EVENTO,
      desde: "15",
    });
  });

  for (const estado of ["finalizado", "aplazado", "cancelado"]) {
    it(`si el evento pasa a ${estado}, se entrega y la suscripción termina sin cancelar`, async () => {
      const suscripcion = suscribir();
      await esperar();

      conexion.emitir("CambioDeEvento", {
        eventoId: ID_EVENTO,
        estado,
        marca: "20",
      });
      conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "21"));
      suscripcion.unsubscribe();

      expect(recibidos).to.deep.equal([
        { tipo: "estado", marca: "20", estado },
      ]);
      expect(completado).to.equal(true);
      // El servidor ya la canceló: no hay que pedírselo.
      expect(conexion.invocaciones("Cancelar")).to.deep.equal([]);
    });
  }

  it("Recargar se entrega y la suscripción termina", async () => {
    suscribir();
    await esperar();

    conexion.emitir("Recargar", { eventoId: ID_EVENTO });
    conexion.emitir("Recargar", { eventoId: ID_EVENTO });

    expect(recibidos).to.deep.equal([{ tipo: "recargar" }]);
    expect(completado).to.equal(true);
  });

  it("los mensajes de un evento al que no se está suscrito se ignoran", () => {
    conexion.emitir("CambioDeEvento", {
      eventoId: OTRO_EVENTO,
      estado: "finalizado",
      marca: "1",
    });
    conexion.emitir("Recargar", { eventoId: OTRO_EVENTO });

    expect(recibidos).to.deep.equal([]);
  });

  it("al cancelar se lo dice al servidor y deja de entregar", async () => {
    const suscripcion = suscribir();
    await esperar();

    suscripcion.unsubscribe();
    conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "9"));

    expect(conexion.invocaciones("Cancelar")).to.deep.equal([
      { eventoId: ID_EVENTO },
    ]);
    expect(recibidos).to.deep.equal([]);
  });

  it("si cancelar falla porque ya no hay conexión, no pasa nada", async () => {
    const suscripcion = suscribir();
    await esperar();
    conexion.invocar.rejects(new Error("desconectado"));

    expect(() => {
      suscripcion.unsubscribe();
    }).not.to.throw();
    await esperar();
  });

  it("si se cancela antes de que se abra la conexión, no llega a suscribirse", async () => {
    suscribir().unsubscribe();
    await esperar();

    expect(conexion.invocaciones("Suscribir")).to.deep.equal([]);
  });

  it("dos suscripciones al mismo evento a la vez no se admiten", async () => {
    suscribir();
    suscribir();
    await esperar();

    expect(errores).to.have.length(1);
    expect(errores[0]).to.be.instanceOf(SuscripcionDuplicadaError);
    expect((errores[0] as SuscripcionDuplicadaError).eventoId).to.equal(
      ID_EVENTO,
    );
    expect(conexion.invocaciones("Suscribir")).to.have.length(1);
  });

  it("un evento que no existe termina con EventoNoEncontradoError", async () => {
    conexion.invocar.rejects(
      new Error("EventoNoEncontrado: no hay ningún evento visible"),
    );

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(EventoNoEncontradoError);
    // Ya no cuenta como abierta: se puede volver a intentar.
    conexion.invocar.resolves();
    suscribir();
    await esperar();
    expect(errores).to.have.length(1);
  });

  it("si la conexión ya sigue demasiados eventos, termina con DemasiadasSuscripcionesError", async () => {
    // Como lo entrega el cliente de SignalR: con su texto delante del código del hub.
    conexion.invocar.rejects(
      new Error(
        "An unexpected error occurred invoking 'Suscribir' on the server. HubException: DemasiadasSuscripciones: esta conexión ya sigue 50 eventos",
      ),
    );

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(DemasiadasSuscripcionesError);
    expect((errores[0] as DemasiadasSuscripcionesError).eventoId).to.equal(
      ID_EVENTO,
    );
  });

  it("si la suscripción no cumple el contrato, termina con PeticionIncorrectaError", async () => {
    conexion.invocar.rejects(
      new Error("ParametroNoValido: mercados admite hasta 100 ids"),
    );

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(PeticionIncorrectaError);
  });

  it("si el servidor rechaza una suscripción que ya se canceló, no se avisa a nadie", async () => {
    // Solo el Suscribir queda pendiente; el Cancelar de después se resuelve normal.
    let rechazar: (error: Error) => void = () => undefined;
    conexion.invocar.onFirstCall().callsFake(
      () =>
        new Promise((_, r) => {
          rechazar = r;
        }),
    );
    const suscripcion = suscribir();
    await esperar();

    suscripcion.unsubscribe();
    rechazar(new Error("EventoNoEncontrado: ya no se ve"));
    await esperar();

    expect(errores).to.deep.equal([]);
  });

  it("un error del hub que ni siquiera es un Error también es ServicioNoDisponibleError", async () => {
    // Algunas librerías rechazan con un texto suelto: se simula eso a propósito.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    conexion.invocar.callsFake(() => Promise.reject("se cayó el hub"));

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(ServicioNoDisponibleError);
    expect((errores[0] as Error).message).to.include("se cayó el hub");
  });

  it("cualquier otro error del hub es ServicioNoDisponibleError", async () => {
    conexion.invocar.rejects("cadena");

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(ServicioNoDisponibleError);
  });

  it("si no se puede abrir la conexión, falla, y la siguiente lo vuelve a intentar", async () => {
    conexion.iniciar.onFirstCall().rejects(new Error("sin red"));

    suscribir();
    await esperar();

    expect(errores[0]).to.be.instanceOf(ServicioNoDisponibleError);
    expect((errores[0] as Error).message).to.include(
      "no se ha podido abrir la conexión en tiempo real",
    );

    suscribir();
    await esperar();
    expect(conexion.iniciar.callCount).to.equal(2);
    expect(conexion.invocaciones("Suscribir")).to.have.length(1);
  });

  it("cerrar termina todas las suscripciones y detiene la conexión", async () => {
    suscribir();
    await esperar();

    await servicio.cerrar();

    expect(completado).to.equal(true);
    expect(conexion.detener.callCount).to.equal(1);
    expect(conexion.invocaciones("Cancelar")).to.deep.equal([]);
  });

  describe("registro", () => {
    function conRegistro(nivel: "depuracion" | "ninguno") {
      const espia = () =>
        sinon.spy((_mensaje: string, _datos?: unknown) => undefined);
      const registrador = {
        depurar: espia(),
        informar: espia(),
        avisar: espia(),
      };
      const conRegistrador = new ServicioEventosHttp(
        { ...CONFIGURACION, nivelDeRegistro: nivel },
        { fetch: sinon.stub(), conexion, registrador },
      );
      return { registrador, servicio: conRegistrador };
    }

    it("en depuración registra cada mensaje, las reconexiones y los errores", async () => {
      const { registrador, servicio: s } = conRegistro("depuracion");
      s.cambios(ID_EVENTO, "7").subscribe({ error: () => undefined });
      await esperar();

      conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "8"));
      conexion.emitir("CambioDeEvento", {
        eventoId: ID_EVENTO,
        estado: "interrumpido",
        marca: "9",
      });
      conexion.invocar.rejects(new Error("EventoNoEncontrado: ya no"));
      conexion.reconectar();
      await esperar();

      expect(registrador.depurar.args.map((a) => a[0])).to.deep.equal([
        "Cambios recibidos",
        "Cambio de evento recibido",
      ]);
      expect(registrador.informar.firstCall.args).to.deep.equal([
        "Reconectado: se vuelven a pedir las suscripciones",
        { eventos: [ID_EVENTO] },
      ]);
      expect(registrador.avisar.firstCall.args[0]).to.equal(
        `La suscripción a ${ID_EVENTO} termina con error`,
      );
    });

    it("con el registro apagado, no registra nada", async () => {
      const { registrador, servicio: s } = conRegistro("ninguno");
      s.cambios(ID_EVENTO, "7").subscribe();
      await esperar();

      conexion.emitir("Cambios", cambiosDe(ID_EVENTO, "8"));
      conexion.reconectar();
      await esperar();

      expect(
        registrador.depurar.called ||
          registrador.informar.called ||
          registrador.avisar.called,
      ).to.equal(false);
    });
  });
});
