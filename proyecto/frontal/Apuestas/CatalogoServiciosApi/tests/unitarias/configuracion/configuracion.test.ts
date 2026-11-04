import { expect } from "chai";
import {
  comprobarConfiguracion,
  ConfiguracionNoValidaError,
  type ConfiguracionServicioEventos,
} from "../../../src/index.js";

const CONFIGURACION: ConfiguracionServicioEventos = {
  urlBase: "https://api.ejemplo",
  tiempoMaximoPeticionMs: 1000,
  esperasReconexionMs: [0, 10],
  nivelDeRegistro: "ninguno",
};

describe("comprobarConfiguracion", () => {
  it("una configuración correcta se acepta", () => {
    expect(() => {
      comprobarConfiguracion(CONFIGURACION);
    }).not.to.throw();
    expect(() => {
      comprobarConfiguracion({ ...CONFIGURACION, esperasReconexionMs: [] });
    }).not.to.throw();
  });

  for (const [descripcion, cambio, mensaje] of [
    [
      "una URL mal formada",
      { urlBase: "no es una url" },
      "urlBase no es una URL",
    ],
    [
      "una URL que no es http",
      { urlBase: "ftp://api.ejemplo" },
      "tiene que ser http o https",
    ],
    ["un tiempo de 0", { tiempoMaximoPeticionMs: 0 }, "mayor que 0"],
    [
      "un tiempo que no es un número",
      { tiempoMaximoPeticionMs: Number.NaN },
      "mayor que 0",
    ],
    [
      "una espera negativa",
      { esperasReconexionMs: [0, -1] },
      "esperas negativas",
    ],
    [
      "una espera infinita",
      { esperasReconexionMs: [Infinity] },
      "esperas negativas",
    ],
  ] as const) {
    it(`rechaza ${descripcion}`, () => {
      expect(() => {
        comprobarConfiguracion({ ...CONFIGURACION, ...cambio });
      }).to.throw(ConfiguracionNoValidaError, mensaje);
    });
  }
});
