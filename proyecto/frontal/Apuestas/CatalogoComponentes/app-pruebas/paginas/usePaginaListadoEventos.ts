// Mandos para poner el listado en cada estado a mano, sin store: es el presentacional.
import type { EstadoCarga } from "@apuestas-deportivas/catalogo-estado-bueno";
import { useState } from "react";
import { EVENTOS } from "../../dobles/datos";

export const FASES: readonly EstadoCarga[] = [
  "inactivo",
  "cargando",
  "listo",
  "error",
];

export function usePaginaListadoEventos() {
  const [carga, setCarga] = useState<EstadoCarga>("listo");
  const [conEventos, setConEventos] = useState(true);
  const [abierto, setAbierto] = useState<string>();

  return {
    carga,
    setCarga,
    conEventos,
    alternarEventos: () => {
      setConEventos((antes) => !antes);
    },
    eventos: conEventos ? EVENTOS : [],
    abierto,
    onAbrirEvento: setAbierto,
  };
}
