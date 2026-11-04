import type { Correspondencia } from "./comparar.js";

// Con qué modelo del servidor se corresponde cada modelo del frontal, y por qué difieren
// donde difieren. Lo que se declara aquí deja de avisar; lo que no, avisa.
//
// Que un campo tenga otro tipo (Date frente a string) no se declara: es lo normal, y para
// eso están los mappers. Se declara lo que cambia de nombre, lo que solo existe en un lado
// y los límites que el frontal no necesita.

const MARCA_OPACA =
  "La marca es opaca: el frontal la guarda y la devuelve tal cual.";
const DEL_EVENTO =
  "Cada Observable de cambios es de un solo evento: ya se sabe de cuál es.";
const DISCRIMINANTE = "El discriminante de la unión CambioEnEvento.";
const EN_DIRECTO = "Se calcula del estado: en juego o interrumpido.";

export const CORRESPONDENCIAS: readonly Correspondencia[] = [
  {
    frontal: "TipoEvento",
    servidor: "TipoEventoServidor",
    esquema: "TipoEvento",
  },
  { frontal: "Seleccion", servidor: "SeleccionServidor", esquema: "Seleccion" },
  {
    frontal: "Mercado",
    servidor: "MercadoServidor",
    esquema: "Mercado",
    soloFrontal: {
      seAdmitenApuestas: "Se calcula del estado: solo si está abierto.",
    },
  },
  {
    frontal: "GrupoMercados",
    servidor: "GrupoMercadosServidor",
    esquema: "GrupoMercados",
  },
  {
    frontal: "Evento",
    servidor: "EventoResumenServidor",
    esquema: "EventoResumen",
    renombrados: { comienzo: "fechaHora" },
    soloFrontal: { enDirecto: EN_DIRECTO },
  },
  {
    frontal: "EventoDetalle",
    servidor: "EventoDetalleServidor",
    // Sin esquema: sus límites son los que hereda de Evento, que ya se comparan arriba.
    renombrados: { comienzo: "fechaHora" },
    soloFrontal: { enDirecto: EN_DIRECTO },
  },
  {
    frontal: "PaginaEventos",
    servidor: "PaginaEventosServidor",
    esquema: "PaginaEventos",
    renombrados: { eventos: "elementos" },
    soloFrontal: { hayMas: "Se calcula de pagina, tamano y total." },
    sinLimites: { marca: MARCA_OPACA },
  },
  {
    frontal: "MercadosDeGrupo",
    servidor: "MercadosDeGrupoServidor",
    esquema: "MercadosDeGrupo",
    sinLimites: { marca: MARCA_OPACA },
  },
  {
    frontal: "CambioDeCuota",
    servidor: "CambioDeCuotaServidor",
    esquema: "CambioDeCuota",
  },
  { frontal: "CambioDeMercado", servidor: "CambioDeMercadoServidor" },
  {
    frontal: "CambioEnEvento",
    variante: "cuotas",
    servidor: "CambiosServidor",
    soloFrontal: { tipo: DISCRIMINANTE },
    ignorados: { eventoId: DEL_EVENTO },
  },
  {
    frontal: "CambioEnEvento",
    variante: "estado",
    servidor: "CambioDeEventoServidor",
    soloFrontal: { tipo: DISCRIMINANTE },
    ignorados: { eventoId: DEL_EVENTO },
  },
  {
    frontal: "CambioEnEvento",
    variante: "recargar",
    servidor: "RecargarServidor",
    soloFrontal: { tipo: DISCRIMINANTE },
    ignorados: { eventoId: DEL_EVENTO },
  },
  {
    frontal: "FiltroEventos",
    servidor: 'operations["listarEventos"]["parameters"]["query"]',
  },
];

// Modelos del frontal que no se corresponden con nada del servidor, con el porqué.
export const SIN_EQUIVALENTE: Readonly<Record<string, string>> = {};
