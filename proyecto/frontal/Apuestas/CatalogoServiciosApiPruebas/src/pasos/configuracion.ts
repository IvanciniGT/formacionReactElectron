import { ConfiguracionNoValidaError } from "@apuestas-deportivas/catalogo-servicios-api";
import { expect } from "chai";
import type { ApiCucumber } from "../registrar.js";
import type { MundoCatalogo } from "../soporte/mundo.js";

export function registrarPasosConfiguracion({
  When: Cuando,
  Then: Entonces,
}: ApiCucumber): void {
  // El valor va en JSON en el .feature: así caben textos, números y listas.
  Cuando(
    "creo el servicio con {word} = {}",
    async function (this: MundoCatalogo, campo: string, valor: string) {
      try {
        const creado = this.crearServicio({
          ...this.configuracion,
          [campo]: JSON.parse(valor) as unknown,
        });
        // No debería haberse creado; si se crea, que no se quede nada abierto.
        await creado.cerrar();
      } catch (error) {
        this.error = error;
      }
    },
  );

  Entonces(
    "se rechaza porque la configuración no es válida",
    function (this: MundoCatalogo) {
      expect(this.error).to.be.instanceOf(ConfiguracionNoValidaError);
    },
  );
}
