// Lo que el frontal espera en cada campo de texto o de cuota de sus modelos: los hechos con
// los que se diseñan los componentes. Qué hace cada frontal con ellos (truncar, en cuántos
// caracteres…) es decisión suya.
//
// Se escriben a mano, a propósito: son una decisión del frontal, no una copia del
// contrato. Pueden diferir de los del servidor (LIMITES_SERVIDOR) y el detector de
// divergencias (npm run divergencias) avisa de en qué; si no difieren, no avisa.
//
// invariante: la anotación del dominio de la que sale, si sale de una.
export const LIMITES = {
  TipoEvento: {
    nombre: {
      longitudMinima: 2,
      longitudMaxima: 50,
      invariante: "NombreTipo (Apuestas.Invariantes)",
    },
  },
  Evento: {
    nombre: {
      longitudMinima: 3,
      longitudMaxima: 100,
      invariante: "NombreEvento (Apuestas.Invariantes)",
    },
  },
  Mercado: {
    tipo: {
      longitudMinima: 1,
      longitudMaxima: 50,
    },
    grupo: {
      longitudMaxima: 50,
      patron: "^[a-z][a-z0-9-]*$",
    },
    descripcion: {
      longitudMinima: 3,
      longitudMaxima: 500,
      invariante: "Descripcion (Apuestas.Invariantes)",
    },
  },
  Seleccion: {
    descripcion: {
      longitudMinima: 3,
      longitudMaxima: 500,
      invariante: "Descripcion (Apuestas.Invariantes)",
    },
    cuota: {
      mayorQue: 1,
      decimales: 2,
      invariante: "Cuota (Apuestas.Invariantes)",
    },
    cuotaInicial: {
      mayorQue: 1,
      decimales: 2,
      invariante: "Cuota (Apuestas.Invariantes)",
    },
  },
  CambioDeCuota: {
    cuota: {
      mayorQue: 1,
      decimales: 2,
      invariante: "Cuota (Apuestas.Invariantes)",
    },
  },
  GrupoMercados: {
    clave: {
      longitudMaxima: 50,
      patron: "^[a-z][a-z0-9-]*$",
    },
    nombre: {
      longitudMinima: 1,
      longitudMaxima: 50,
    },
  },
} as const;
