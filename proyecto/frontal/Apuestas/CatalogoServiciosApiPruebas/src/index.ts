export {
  CONFIGURACION_DE_PRUEBA,
  DATOS_DE_PRUEBA,
  registrarPruebas,
  type ApiCucumber,
  type OpcionesTck,
} from "./registrar.js";
export type {
  DatosDePrueba,
  EntornoDePruebas,
  EstadoEventoDePrueba,
} from "./soporte/entorno.js";
export { esperarA, type MundoCatalogo } from "./soporte/mundo.js";
export { EntornoRemoto } from "./soporte/entorno-remoto.js";
