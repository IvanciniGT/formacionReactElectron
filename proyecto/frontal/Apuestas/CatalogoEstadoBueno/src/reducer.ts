// Cómo cambia el estado del catálogo con cada acción. Un reducer por propiedad, y el del
// slice los junta.
import { combineReducers, createReducer, type Draft } from "@reduxjs/toolkit";
import type { Mercado } from "@apuestas-deportivas/catalogo-servicios-api";
import {
  cambioRecibido,
  enVivoIniciado,
  enVivoTerminado,
  eventoCargado,
  eventoCerrado,
  eventoFallido,
  eventoPedido,
  eventosCargados,
  eventosFallidos,
  eventosPedidos,
  filtroCambiado,
  grupoAbierto,
  mercadosCargados,
  mercadosFallidos,
  type CambioAplicable,
} from "./acciones.js";
import { inicialEvento, inicialListado, type EstadoEvento } from "./estado.js";

// La propiedad «listado»
export const reducerListado = createReducer(inicialListado, (cuando) =>
  cuando
    .addCase(filtroCambiado, (estado, { payload }) => {
      estado.filtro = payload;
    })
    .addCase(eventosPedidos, (estado) => {
      estado.carga = "cargando";
      delete estado.error;
    })
    // Lo que viene de la API (readonly hasta el fondo) no se mete en el borrador de Immer,
    // que es mutable: se devuelve el estado nuevo.
    .addCase(eventosCargados, (estado, { payload }) => ({
      ...estado,
      carga: "listo" as const,
      eventos: [...payload],
    }))
    .addCase(eventosFallidos, (estado, { payload: motivo }) => {
      // Los eventos que hubiera se quedan: mejor una lista vieja que una pantalla vacía.
      estado.carga = "error";
      estado.error = motivo;
    }),
);

// La propiedad «evento»

// Los mercados que hay en pantalla: el principal del evento y los del grupo abierto. Un
// mismo mercado puede estar en los dos, y hay que cambiarlo en los dos.
function mercadosEnPantalla(estado: Draft<EstadoEvento>): Draft<Mercado>[] {
  const principal = estado.detalle?.mercadoPrincipal;
  return principal ? [principal, ...estado.mercados] : estado.mercados;
}

function aplicarCuotas(
  estado: Draft<EstadoEvento>,
  cambio: Extract<CambioAplicable, { tipo: "cuotas" }>,
): void {
  const mercados = mercadosEnPantalla(estado);
  for (const { mercadoId, seleccionId, cuota, tendencia } of cambio.cuotas)
    for (const mercado of mercados.filter((m) => m.id === mercadoId))
      for (const seleccion of mercado.selecciones.filter(
        (s) => s.id === seleccionId,
      )) {
        seleccion.cuota = cuota;
        seleccion.tendencia = tendencia;
      }

  for (const { mercadoId, estado: estadoMercado } of cambio.mercados) {
    if (estadoMercado === null) {
      // Ya no se ve (cerrado o anulado): se quita de la pantalla.
      estado.mercados = estado.mercados.filter((m) => m.id !== mercadoId);
      if (estado.detalle?.mercadoPrincipal?.id === mercadoId)
        estado.detalle.mercadoPrincipal = null;
      continue;
    }
    for (const mercado of mercados.filter((m) => m.id === mercadoId)) {
      mercado.estado = estadoMercado;
      // La misma regla que la implementación al traducir lo del servidor.
      mercado.seAdmitenApuestas = estadoMercado === "abierto";
    }
  }
}

export const reducerEvento = createReducer(inicialEvento, (cuando) =>
  cuando
    // El evento abierto
    .addCase(eventoPedido, (estado, { payload: id }) => ({
      // Si es el mismo (una recarga), se conserva el grupo abierto: se volverá a cargar.
      ...inicialEvento,
      id,
      carga: "cargando" as const,
      ...(estado.id === id && estado.grupo ? { grupo: estado.grupo } : {}),
    }))
    .addCase(eventoCargado, (estado, { payload }) => {
      const { error: _, ...resto } = estado;
      return { ...resto, detalle: payload, carga: "listo" as const };
    })
    .addCase(eventoFallido, (estado, { payload: motivo }) => {
      estado.carga = "error";
      estado.error = motivo;
    })
    .addCase(eventoCerrado, () => inicialEvento)

    // Su grupo de mercados
    .addCase(grupoAbierto, (estado, { payload: clave }) => {
      estado.grupo = clave;
      estado.mercados = [];
      estado.cargaMercados = "cargando";
      delete estado.errorMercados;
    })
    .addCase(mercadosCargados, (estado, { payload }) => {
      const { errorMercados: _, ...resto } = estado;
      return {
        ...resto,
        mercados: [...payload],
        cargaMercados: "listo" as const,
      };
    })
    .addCase(mercadosFallidos, (estado, { payload: motivo }) => {
      estado.cargaMercados = "error";
      estado.errorMercados = motivo;
    })

    // El tiempo real
    .addCase(enVivoIniciado, (estado) => {
      estado.enVivo = true;
      delete estado.errorEnVivo;
    })
    .addCase(enVivoTerminado, (estado, { payload: motivo }) => {
      estado.enVivo = false;
      if (motivo !== undefined) estado.errorEnVivo = motivo;
    })
    .addCase(cambioRecibido, (estado, { payload: cambio }) => {
      if (!estado.detalle) return;
      estado.detalle.marca = cambio.marca;
      switch (cambio.tipo) {
        case "cuotas":
          aplicarCuotas(estado, cambio);
          break;
        case "estado":
          if (
            cambio.estado === "finalizado" ||
            cambio.estado === "aplazado" ||
            cambio.estado === "cancelado"
          ) {
            estado.final = cambio.estado;
          } else {
            estado.detalle.estado = cambio.estado;
            estado.detalle.enDirecto = cambio.estado === "enJuego";
          }
          break;
      }
    }),
);

// El del slice: cada propiedad, con su reducer.
export const reducerCatalogo = combineReducers({
  listado: reducerListado,
  evento: reducerEvento,
});
