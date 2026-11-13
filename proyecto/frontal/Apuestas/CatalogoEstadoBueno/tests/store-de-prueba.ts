// Un store anfitrión, solo para probar: hace lo que hará quien use esta librería (la
// aplicación, el día que exista). Es al store lo que el backend fake es al servidor.
import {
  combineSlices,
  configureStore,
  createDynamicMiddleware,
  isPlain,
} from "@reduxjs/toolkit";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import type { EstadoConCatalogo } from "../src/estado.js";
import { crearModuloCatalogo } from "../src/modulo.js";

// Otro slice cualquiera, de otra librería, para ver que conviven.
export const otroModulo = {
  reducerPath: "usuarios" as const,
  reducer: (estado: { nombre: string } = { nombre: "anónimo" }) => estado,
};

export function crearStoreAnfitrion() {
  // Los slices que están desde el principio, y los que se inyectarán después: estos el
  // estado los tiene opcionales hasta que llegan.
  const raiz =
    combineSlices(otroModulo).withLazyLoadedSlices<EstadoConCatalogo>();
  const dinamicos = createDynamicMiddleware();
  const store = configureStore({
    reducer: raiz,
    middleware: (porDefecto) =>
      porDefecto({
        // Las fechas de los modelos (Date) se admiten en el estado: no cambian una vez
        // creadas, que es lo que la comprobación quiere asegurar.
        serializableCheck: {
          isSerializable: (valor: unknown) =>
            isPlain(valor) || valor instanceof Date,
        },
      }).prepend(dinamicos.middleware),
  });

  return {
    store,
    inyectarCatalogo: (servicio: ServicioEventos) => {
      const modulo = crearModuloCatalogo(servicio);
      raiz.inject(modulo);
      dinamicos.addMiddleware(modulo.middleware);
    },
  };
}

// Lo habitual en las pruebas: el anfitrión con el catálogo ya inyectado.
export function crearStore(servicio: ServicioEventos) {
  const anfitrion = crearStoreAnfitrion();
  anfitrion.inyectarCatalogo(servicio);
  return anfitrion.store;
}
