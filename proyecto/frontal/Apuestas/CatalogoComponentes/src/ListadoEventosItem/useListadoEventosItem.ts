// La lógica del item: deja los datos del evento listos para pintar, de modo que la plantilla
// solo tenga que colocarlos.
import type {
  Evento,
  Tendencia,
} from "@apuestas-deportivas/catalogo-servicios-api";

export interface SeleccionEnPantalla {
  id: string;
  descripcion: string;
  // Siempre con dos decimales: 2 se ve «2.00», como en cualquier casa de apuestas.
  cuota: string;
  tendencia: Tendencia;
}

const formatoComienzo = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

export function useListadoEventosItem(
  evento: Evento,
  onAbrir: ((id: string) => void) | undefined,
) {
  const mercado = evento.mercadoPrincipal;
  const selecciones: SeleccionEnPantalla[] = (mercado?.selecciones ?? []).map(
    (s) => ({
      id: s.id,
      descripcion: s.descripcion,
      cuota: s.cuota.toFixed(2),
      tendencia: s.tendencia,
    }),
  );

  return {
    comienzo: formatoComienzo.format(evento.comienzo),
    comienzoIso: evento.comienzo.toISOString(),
    // Un evento en directo enseña «En directo» en vez de la hora: ya ha empezado.
    enDirecto: evento.enDirecto,
    interrumpido: evento.estado === "interrumpido",
    selecciones,
    // Suspendido: las cuotas se ven, pero no se puede apostar.
    suspendido: mercado !== null && !mercado.seAdmitenApuestas,
    abrir: () => onAbrir?.(evento.id),
  };
}
