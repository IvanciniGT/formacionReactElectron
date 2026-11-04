import { EntornoFake } from "@apuestas-deportivas/catalogo-backend-fake/pruebas";
import {
  EntornoRemoto,
  registrarPruebas,
  type EntornoDePruebas,
} from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import * as cucumber from "@cucumber/cucumber";
import { crearServicioEventos } from "../../../src/index.js";

// Los mismos escenarios son una prueba u otra según contra qué se ejecuten
// (PERFIL_PRUEBAS):
//   fake     De sistema: contra el backend fake, que se arranca y se controla. Todos.
//   remoto   De integración: contra el backend de verdad, en URL_BACKEND. Solo los que no
//            necesitan controlarlo; los demás salen saltados.
function urlBackend(): string {
  const url = process.env["URL_BACKEND"];
  if (!url)
    throw new Error(
      "El perfil remoto necesita la URL del backend: URL_BACKEND=https://… npm run integracion",
    );
  return url;
}

const ENTORNOS: Readonly<Record<string, () => EntornoDePruebas>> = {
  fake: () => new EntornoFake(),
  remoto: () => new EntornoRemoto(urlBackend()),
};

const perfil = process.env["PERFIL_PRUEBAS"] ?? "fake";
const crearEntorno = ENTORNOS[perfil];
if (!crearEntorno)
  throw new Error(
    `Perfil de pruebas desconocido: «${perfil}». Hay: ${Object.keys(ENTORNOS).join(", ")}.`,
  );
// Si falta algo (la URL del remoto), mejor saberlo ya que en el primer escenario.
crearEntorno();

// El TCK (caja negra) registra sus pasos en nuestro Cucumber, y crea el servicio con
// nuestra fábrica: lo que se prueba es exactamente lo que usará la aplicación.
registrarPruebas({
  cucumber,
  crearEntorno,
  crearServicio: crearServicioEventos,
});
