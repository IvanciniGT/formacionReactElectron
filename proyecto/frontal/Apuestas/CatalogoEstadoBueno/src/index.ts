// Lo que se inyecta
export { crearModuloCatalogo, type ModuloCatalogo } from "./modulo.js";

// Las piezas del slice
export type * from "./estado.js";
export { reducerCatalogo } from "./reducer.js";
export * from "./acciones.js";
export * from "./selectores.js";
