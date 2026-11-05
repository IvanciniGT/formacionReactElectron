import {
  registrarPruebas,
  type EntornoDePruebas,
} from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import * as cucumber from "@cucumber/cucumber";
import { crearServicioEventos } from "../../../src/index.js";

// Los mismos escenarios son una prueba u otra según contra qué se ejecuten. El entorno lo
// elige el perfil de cucumber, importando uno de tests/sistema/perfiles/: así no hace falta
// ninguna variable en la línea de comandos, que se escribe distinto en bash, cmd y PowerShell.
export function registrar(crearEntorno: () => EntornoDePruebas): void {
  // Si falta algo (la URL del remoto), mejor saberlo ya que en el primer escenario.
  crearEntorno();

  // El TCK (caja negra) registra sus pasos en nuestro Cucumber, y crea el servicio con
  // nuestra fábrica: lo que se prueba es exactamente lo que usará la aplicación.
  registrarPruebas({
    cucumber,
    crearEntorno,
    crearServicio: crearServicioEventos,
  });
}
