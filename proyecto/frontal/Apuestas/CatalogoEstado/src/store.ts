import { configureStore, isPlain } from "@reduxjs/toolkit";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import { catalogo } from "./catalogo/catalogo.js";
import { crearEfectos } from "./efectos/efectos.js";
import { evento } from "./evento/evento.js";

// El servicio llega por parámetro: cada aplicación pasa su implementación, y las pruebas, un
// doble o la de verdad contra el backend fake.
export function crearStore(servicio: ServicioEventos) {
  return configureStore({
    reducer: { catalogo: catalogo.reducer, evento: evento.reducer },
    middleware: (porDefecto) =>
      porDefecto({
        // Las fechas de los modelos (Date) se admiten en el estado: no cambian una vez
        // creadas, que es lo que la comprobación quiere asegurar.
        serializableCheck: {
          isSerializable: (valor: unknown) =>
            isPlain(valor) || valor instanceof Date,
        },
      }).prepend(crearEfectos(servicio).middleware),
  });
}

export type Store = ReturnType<typeof crearStore>;
