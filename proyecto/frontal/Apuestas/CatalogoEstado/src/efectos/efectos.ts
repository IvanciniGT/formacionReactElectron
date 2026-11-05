// Los efectos: escuchan eventos, llaman al servicio y emiten otros eventos con lo que pase.
// Los reducers no saben que existen: solo ven eventos, vengan de donde vengan.
import { createListenerMiddleware, TaskAbortError } from "@reduxjs/toolkit";
import type { ServicioEventos } from "@apuestas-deportivas/catalogo-servicios-api";
import {
  eventosCargados,
  eventosFallidos,
  eventosPedidos,
  filtroCambiado,
} from "../catalogo/catalogo.js";
import type { Estado } from "../estado.js";
import {
  cambioRecibido,
  enVivoIniciado,
  enVivoTerminado,
  eventoCargado,
  eventoCerrado,
  eventoFallido,
  eventoPedido,
  grupoAbierto,
  mercadosCargados,
  mercadosFallidos,
} from "../evento/evento.js";

const motivo = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export function crearEfectos(servicio: ServicioEventos) {
  const efectos = createListenerMiddleware();
  const estadoDe = (efecto: { getState(): unknown }) =>
    efecto.getState() as Estado;

  // Pide algo al servicio y emite un evento con la respuesta o con el error. Si se vuelve a
  // pedir antes de que llegue la respuesta, esta ya no cuenta: la última petición gana.
  efectos.startListening({
    actionCreator: filtroCambiado,
    effect: (_accion, efecto) => {
      efecto.dispatch(eventosPedidos());
    },
  });

  efectos.startListening({
    actionCreator: eventosPedidos,
    effect: async (_accion, efecto) => {
      efecto.cancelActiveListeners();
      try {
        const { filtro } = estadoDe(efecto).catalogo;
        const pagina = await efecto.pause(servicio.listarEventos(filtro));
        efecto.dispatch(eventosCargados(pagina.eventos));
      } catch (error) {
        if (error instanceof TaskAbortError) return;
        efecto.dispatch(eventosFallidos(motivo(error)));
      }
    },
  });

  efectos.startListening({
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

  efectos.startListening({
    actionCreator: grupoAbierto,
    effect: async ({ payload: clave }, efecto) => {
      efecto.cancelActiveListeners();
      const { id } = estadoDe(efecto).evento;
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
  efectos.startListening({
    actionCreator: eventoCargado,
    effect: async ({ payload: detalle }, efecto) => {
      efecto.cancelActiveListeners();
      const { grupo } = estadoDe(efecto).evento;
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
            (accion) =>
              eventoCerrado.match(accion) ||
              eventoPedido.match(accion) ||
              enVivoTerminado.match(accion),
          );
      } finally {
        suscripcion.unsubscribe();
      }
    },
  });

  return efectos;
}
