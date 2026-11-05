import { HubConnection } from "@microsoft/signalr";
import sinon from "sinon";
import { adaptarHubConnection } from "../../../src/index.js";
import { assert } from "chai";
import { expect } from "../ayudas.js";

// No se prueba SignalR: se prueba que el adaptador llama a lo que toca de HubConnection.
describe("adaptarHubConnection", () => {
  let hub: sinon.SinonStubbedInstance<HubConnection>;

  beforeEach(() => {
    hub = sinon.createStubInstance(HubConnection);
    hub.start.resolves();
    hub.stop.resolves();
    hub.invoke.resolves("lo que devuelva el servidor");
  });

  it("iniciar y detener son start y stop", async () => {
    const conexion = adaptarHubConnection(hub);

    await conexion.iniciar();
    await conexion.detener();

    expect(hub.start.callCount).to.equal(1);
    expect(hub.stop.callCount).to.equal(1);
  });

  it("invocar es invoke con un único argumento, y no devuelve nada", async () => {
    const conexion = adaptarHubConnection(hub);

    // invoke devuelve lo que conteste el servidor; el adaptador lo descarta. El tipo ya dice
    // void: lo que se prueba es que, en ejecución, no se cuele nada.
    const invocado: Promise<unknown> = conexion.invocar("Suscribir", {
      eventoId: "e",
    });
    assert.isUndefined(await invocado);
    expect(hub.invoke.firstCall.args).to.deep.equal([
      "Suscribir",
      { eventoId: "e" },
    ]);
  });

  it("alRecibir registra el manejador con on", () => {
    const manejador = sinon.spy();

    adaptarHubConnection(hub).alRecibir("Cambios", manejador);

    expect(hub.on.firstCall.args).to.deep.equal(["Cambios", manejador]);
  });

  it("alReconectar avisa cuando SignalR reconecta", () => {
    const manejador = sinon.spy();
    adaptarHubConnection(hub).alReconectar(manejador);

    const alReconectarDeSignalR = hub.onreconnected.firstCall.args[0];
    alReconectarDeSignalR("nueva-conexion");

    expect(manejador.callCount).to.equal(1);
  });

  it("alCerrar avisa cuando SignalR se cierra, con el error", () => {
    const manejador = sinon.spy();
    adaptarHubConnection(hub).alCerrar(manejador);

    const error = new Error("sin red");
    const alCerrarDeSignalR = hub.onclose.firstCall.args[0];
    alCerrarDeSignalR(error);

    expect(manejador.calledOnceWithExactly(error)).to.equal(true);
  });
});
