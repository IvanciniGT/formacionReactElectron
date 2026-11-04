import { ConfiguracionNoValidaError } from "@apuestas-deportivas/catalogo-servicios-api";
import { ServicioEventosHttp } from "../../../src/index.js";
import { CONFIGURACION, ConexionFalsa, expect } from "../ayudas.js";

describe("configuración", () => {
  // Las reglas las prueba la API (comprobarConfiguracion); aquí, que se aplican.
  it("el servicio falla al construirse con una configuración no válida", () => {
    expect(
      () =>
        new ServicioEventosHttp(
          { ...CONFIGURACION, urlBase: "" },
          { conexion: new ConexionFalsa() },
        ),
    ).to.throw(ConfiguracionNoValidaError);
  });
});
