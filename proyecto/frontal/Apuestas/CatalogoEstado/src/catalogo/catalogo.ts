import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Evento,
  FiltroEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import type { EstadoCatalogo } from "../estado.js";

const inicial: EstadoCatalogo = { filtro: {}, eventos: [], carga: "inactivo" };

export const catalogo = createSlice({
  name: "catalogo",
  initialState: inicial,
  reducers: {
    filtroCambiado(estado, { payload }: PayloadAction<FiltroEventos>) {
      estado.filtro = payload;
    },
    eventosPedidos(estado) {
      estado.carga = "cargando";
      delete estado.error;
    },
    // Lo que viene de la API (readonly hasta el fondo) no se mete en el borrador de Immer,
    // que es mutable: se devuelve el estado nuevo.
    eventosCargados(estado, { payload }: PayloadAction<readonly Evento[]>) {
      return { ...estado, carga: "listo", eventos: [...payload] };
    },
    eventosFallidos(estado, { payload: motivo }: PayloadAction<string>) {
      // Los eventos que hubiera se quedan: mejor una lista vieja que una pantalla vacía.
      estado.carga = "error";
      estado.error = motivo;
    },
  },
});

export const {
  filtroCambiado,
  eventosPedidos,
  eventosCargados,
  eventosFallidos,
} = catalogo.actions;
