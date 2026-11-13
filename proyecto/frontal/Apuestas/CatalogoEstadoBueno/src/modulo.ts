// Esta librería no crea ningún store: entrega el slice «catalogo» para que quien la use (una
// aplicación, otra librería, las pruebas) lo inyecte en el suyo.
//
//   Store anfitrión
//   ├── catalogo        ← este slice
//   │   ├── listado     propiedad
//   │   └── evento      propiedad
//   ├── usuarios        ← otro slice, en su librería
//   └── …
//
// Con el mecanismo de RTK:
//   raiz.inject(modulo);                         // raiz = combineSlices(...)
//   dinamicos.addMiddleware(modulo.middleware);  // dinamicos = createDynamicMiddleware()
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import { crearEfectosCatalogo } from "./efectos.js";
import { reducerCatalogo } from "./reducer.js";

export function crearModuloCatalogo(servicio: ServicioEventos) {
  return {
    reducerPath: "catalogo" as const,
    reducer: reducerCatalogo,
    middleware: crearEfectosCatalogo(servicio),
  };
}

export type ModuloCatalogo = ReturnType<typeof crearModuloCatalogo>;
