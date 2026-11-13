// Los efectos del catálogo: escuchan acciones, llaman al servicio y emiten otras acciones con
// lo que pase. El reducer no sabe que existen.
//
// Los tres que piden algo al servicio (eventosPedidos, eventoPedido y grupoAbierto) hacen
// que gane la última petición: si se vuelve a pedir antes de que llegue la respuesta, la
// anterior se cancela (cancelActiveListeners) y su respuesta se descarta (pause).
import {
  createListenerMiddleware,
  isAnyOf,
  TaskAbortError,
} from "@reduxjs/toolkit";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
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
} from "./acciones.js";
import type { EstadoConCatalogo } from "./estado.js";
import { seleccionarCatalogo } from "./selectores.js";

// Lo que se guarda en el estado cuando el servicio falla: un texto, que es serializable.
const motivo = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export function crearEfectosCatalogo(servicio: ServicioEventos) {
  const efectos = createListenerMiddleware<EstadoConCatalogo>();
  const escuchar = efectos.startListening;

  // Del listado
  escuchar({
    actionCreator: filtroCambiado,
    effect: (_accion, efecto) => {
      efecto.dispatch(eventosPedidos());
    },
  });

  escuchar({
    actionCreator: eventosPedidos,
    effect: async (_accion, efecto) => {
      efecto.cancelActiveListeners();
      try {
        const { filtro } = seleccionarCatalogo(efecto.getState()).listado;
        const pagina = await efecto.pause(servicio.listarEventos(filtro));
        efecto.dispatch(eventosCargados(pagina.eventos));
      } catch (error) {
        if (error instanceof TaskAbortError) return;
        efecto.dispatch(eventosFallidos(motivo(error)));
      }
    },
  });

  // Del evento abierto
  escuchar({
    actionCreator: eventoPedido,
    effect: async ({ payload: id }, efecto) => {
      efecto.cancelActiveListeners();
      try {
        const detalle = await efecto.pause(servicio.obtenerEvento(id));
        efecto.dispatch(eventoCargado(detalle));
      } catch (error) {
        if (error instanceof TaskAbortError) return;
        efecto.dispatch(eventoFallido(motivo(error)));
      }
    },
  });

  escuchar({
    actionCreator: grupoAbierto,
    effect: async ({ payload: clave }, efecto) => {
      efecto.cancelActiveListeners();
      const { id } = seleccionarCatalogo(efecto.getState()).evento;
      if (id === undefined) return;
      try {
        const { mercados } = await efecto.pause(
          servicio.listarMercados(id, clave),
        );
        efecto.dispatch(mercadosCargados(mercados));
      } catch (error) {
        if (error instanceof TaskAbortError) return;
        efecto.dispatch(mercadosFallidos(motivo(error)));
      }
    },
  });

  // Con el evento cargado: si había un grupo abierto (una recarga), se vuelve a pedir; y se
  // siguen sus cambios desde la marca con la que se cargó, hasta que se cierre, se pida otro
  // o el servicio deje de mandarlos.
  escuchar({
    actionCreator: eventoCargado,
    effect: async ({ payload: detalle }, efecto) => {
      efecto.cancelActiveListeners();
      const { grupo } = seleccionarCatalogo(efecto.getState()).evento;
      if (grupo !== undefined) efecto.dispatch(grupoAbierto(grupo));

      // En un objeto y no en un let: TypeScript no ve que cambia dentro de los callbacks, y
      // daría la comprobación de abajo por siempre cierta. Si el servicio termina enseguida
      // (dentro del propio subscribe), no hay que esperar a nada.
      const seguimiento = { terminado: false };
      const terminar = (por?: string) => {
        seguimiento.terminado = true;
        efecto.dispatch(enVivoTerminado(por));
      };
      efecto.dispatch(enVivoIniciado());
      const suscripcion = servicio
        .cambios(detalle.id, detalle.marca)
        .subscribe({
          next: (cambio) => {
            // La marca era demasiado antigua: se vuelve a cargar el evento, y al cargarse se
            // vuelve a seguir. Después de esto, el servicio termina la suscripción.
            if (cambio.tipo === "recargar")
              efecto.dispatch(eventoPedido(detalle.id));
            else efecto.dispatch(cambioRecibido(cambio));
          },
          error: (error: unknown) => {
            terminar(motivo(error));
          },
          complete: () => {
            terminar();
          },
        });
      try {
        if (!seguimiento.terminado)
          await efecto.condition(
            isAnyOf(eventoCerrado, eventoPedido, enVivoTerminado),
          );
      } finally {
        suscripcion.unsubscribe();
      }
    },
  });

  return efectos.middleware;
}
