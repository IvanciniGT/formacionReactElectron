import { createSlice, type Draft, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CambioEnEvento,
  EventoDetalle,
  Mercado,
} from "@apuestas-deportivas/catalogo-servicios-api";
import type { EstadoEvento } from "../estado.js";

// Lo que llega en tiempo real y cambia el estado. «recargar» no está: no cambia nada, sino
// que obliga a volver a pedir el evento, y eso lo hace el efecto.
export type CambioAplicable = Exclude<CambioEnEvento, { tipo: "recargar" }>;

const inicial: EstadoEvento = {
  carga: "inactivo",
  mercados: [],
  cargaMercados: "inactivo",
  enVivo: false,
};

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

export const evento = createSlice({
  name: "evento",
  initialState: inicial,
  reducers: {
    eventoPedido(estado, { payload: id }: PayloadAction<string>) {
      // Si es el mismo (una recarga), se conserva el grupo abierto: se volverá a cargar.
      return {
        ...inicial,
        id,
        carga: "cargando",
        ...(estado.id === id && estado.grupo ? { grupo: estado.grupo } : {}),
      };
    },
    eventoCargado(estado, { payload }: PayloadAction<EventoDetalle>) {
      const { error: _, ...resto } = estado;
      return { ...resto, detalle: payload, carga: "listo" };
    },
    eventoFallido(estado, { payload: motivo }: PayloadAction<string>) {
      estado.carga = "error";
      estado.error = motivo;
    },
    eventoCerrado() {
      return inicial;
    },

    grupoAbierto(estado, { payload: clave }: PayloadAction<string>) {
      estado.grupo = clave;
      estado.mercados = [];
      estado.cargaMercados = "cargando";
      delete estado.errorMercados;
    },
    mercadosCargados(estado, { payload }: PayloadAction<readonly Mercado[]>) {
      const { errorMercados: _, ...resto } = estado;
      return { ...resto, mercados: [...payload], cargaMercados: "listo" };
    },
    mercadosFallidos(estado, { payload: motivo }: PayloadAction<string>) {
      estado.cargaMercados = "error";
      estado.errorMercados = motivo;
    },

    enVivoIniciado(estado) {
      estado.enVivo = true;
      delete estado.errorEnVivo;
    },
    // Sin motivo: terminó porque tocaba (el evento dejó de verse, o se recarga).
    enVivoTerminado(
      estado,
      { payload: motivo }: PayloadAction<string | undefined>,
    ) {
      estado.enVivo = false;
      if (motivo !== undefined) estado.errorEnVivo = motivo;
    },
    cambioRecibido(
      estado,
      { payload: cambio }: PayloadAction<CambioAplicable>,
    ) {
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
    },
  },
});

export const {
  eventoPedido,
  eventoCargado,
  eventoFallido,
  eventoCerrado,
  grupoAbierto,
  mercadosCargados,
  mercadosFallidos,
  enVivoIniciado,
  enVivoTerminado,
  cambioRecibido,
} = evento.actions;
