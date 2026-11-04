import { LogLevel } from "@microsoft/signalr";
import sinon from "sinon";
import {
  filtrarPorNivel,
  nivelSignalR,
  registradorDeConsola,
} from "../../../src/registro/registro.js";
import { expect } from "../ayudas.js";

describe("registro", () => {
  it("cada nivel deja pasar lo suyo y lo que está por encima", () => {
    const pasaPor = (nivel: Parameters<typeof filtrarPorNivel>[1]) => {
      const destino = {
        depurar: sinon.spy(),
        informar: sinon.spy(),
        avisar: sinon.spy(),
      };
      const filtrado = filtrarPorNivel(destino, nivel);
      filtrado.depurar("d");
      filtrado.informar("i");
      filtrado.avisar("a");
      return [
        destino.depurar.called,
        destino.informar.called,
        destino.avisar.called,
      ];
    };

    expect(pasaPor("depuracion")).to.deep.equal([true, true, true]);
    expect(pasaPor("informacion")).to.deep.equal([false, true, true]);
    expect(pasaPor("aviso")).to.deep.equal([false, false, true]);
    expect(pasaPor("ninguno")).to.deep.equal([false, false, false]);
  });

  it("el nivel equivalente de SignalR", () => {
    expect(nivelSignalR("depuracion")).to.equal(LogLevel.Debug);
    expect(nivelSignalR("informacion")).to.equal(LogLevel.Information);
    expect(nivelSignalR("aviso")).to.equal(LogLevel.Warning);
    expect(nivelSignalR("ninguno")).to.equal(LogLevel.None);
  });

  describe("el registrador de consola", () => {
    afterEach(() => {
      sinon.restore();
    });

    it("escribe en debug, info y warn, con los datos y sin ellos", () => {
      const debug = sinon.stub(console, "debug");
      const info = sinon.stub(console, "info");
      const warn = sinon.stub(console, "warn");

      registradorDeConsola.depurar("d", { x: 1 });
      registradorDeConsola.depurar("d");
      registradorDeConsola.informar("i", 1);
      registradorDeConsola.informar("i");
      registradorDeConsola.avisar("a", 2);
      registradorDeConsola.avisar("a");

      expect(debug.args).to.deep.equal([
        ["d", { x: 1 }],
        ["d", ""],
      ]);
      expect(info.args).to.deep.equal([
        ["i", 1],
        ["i", ""],
      ]);
      expect(warn.args).to.deep.equal([
        ["a", 2],
        ["a", ""],
      ]);
    });
  });
});
