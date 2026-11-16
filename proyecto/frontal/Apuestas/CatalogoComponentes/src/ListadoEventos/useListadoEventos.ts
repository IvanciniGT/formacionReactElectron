// La lógica del listado: a partir de cómo va la carga, qué se enseña. La plantilla solo
// mira estas banderas.
import type { EstadoCarga } from "@apuestas-deportivas/catalogo-estado-bueno";
import type { Evento } from "@apuestas-deportivas/catalogo-servicios-api";

export function useListadoEventos(
  eventos: readonly Evento[],
  carga: EstadoCarga,
) {
  const hayEventos = eventos.length > 0;
  return {
    hayEventos,
    // Si ya había eventos, se siguen viendo mientras llegan los nuevos, y también si falla
    // la carga: mejor una lista vieja que una pantalla vacía (lo mismo hace el reducer).
    cargando: carga === "cargando" && !hayEventos,
    fallo: carga === "error",
    vacio: carga === "listo" && !hayEventos,
    ocupado: carga === "cargando",
  };
}
