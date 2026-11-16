// Un store anfitrión, solo para probar: hace lo que hará la aplicación el día que exista,
// inyectar el slice «catalogo» con el servicio que le toque.
import {
  combineSlices,
  configureStore,
  createDynamicMiddleware,
  isPlain,
} from "@reduxjs/toolkit";
import {
  crearModuloCatalogo,
  type EstadoConCatalogo,
} from "@apuestas-deportivas/catalogo-estado-bueno";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";

// Otro slice cualquiera, para que el store no sea solo del catálogo.
const otroModulo = {
  reducerPath: "usuarios" as const,
  reducer: (estado: { nombre: string } = { nombre: "anónimo" }) => estado,
};

export function crearStoreDePrueba(servicio: ServicioEventos) {
  const raiz =
    combineSlices(otroModulo).withLazyLoadedSlices<EstadoConCatalogo>();
  const dinamicos = createDynamicMiddleware();
  const store = configureStore({
    reducer: raiz,
    middleware: (porDefecto) =>
      porDefecto({
        // Las fechas de los modelos (Date) se admiten: no cambian una vez creadas, que es lo
        // que la comprobación quiere asegurar.
        serializableCheck: {
          isSerializable: (valor: unknown) =>
            isPlain(valor) || valor instanceof Date,
        },
      }).prepend(dinamicos.middleware),
  });

  const modulo = crearModuloCatalogo(servicio);
  raiz.inject(modulo);
  dinamicos.addMiddleware(modulo.middleware);
  return store;
}

export type StoreDePrueba = ReturnType<typeof crearStoreDePrueba>;
