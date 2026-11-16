// Un ServicioEventos de mentira: lo que devuelve lo tiene en memoria, sin backend ni red. Es
// a los componentes lo que el backend fake es a la implementación HTTP: algo de lo que fiarse
// para que, si una prueba falla, sea por el componente.
//
// Cumple el contrato en lo que los componentes usan (el filtro, la paginación, los errores
// de «no existe» y de «petición incorrecta»), pero no tiene tiempo real: los cambios no
// llegan nunca.
import {
  EventoNoEncontradoError,
  PeticionIncorrectaError,
  type CambioEnEvento,
  type EventoDetalle,
  type FiltroEventos,
  type ServicioEventos,
  type TipoEvento,
} from "@apuestas-deportivas/catalogo-servicios-api";
import { NEVER, type Observable } from "rxjs";
import { EVENTOS } from "./datos";

export interface OpcionesServicioEnMemoria {
  eventos?: readonly EventoDetalle[];
  // Lo que tarda en responder, para ver en la app de pruebas el «cargando».
  retardoMs?: number;
}

// Los valores por defecto y los límites del contrato (openapi.yaml, parámetros pagina y
// tamano).
const TAMANO_POR_DEFECTO = 20;
const TAMANO_MAXIMO = 100;

export function crearServicioEnMemoria({
  eventos = EVENTOS,
  retardoMs = 0,
}: OpcionesServicioEnMemoria = {}): ServicioEventos {
  const responder = <T>(valor: () => T) =>
    new Promise<T>((resolver, rechazar) => {
      setTimeout(() => {
        try {
          resolver(valor());
        } catch (error) {
          rechazar(error instanceof Error ? error : new Error(String(error)));
        }
      }, retardoMs);
    });

  const buscar = (id: string) => {
    const evento = eventos.find((e) => e.id === id);
    if (!evento) throw new EventoNoEncontradoError(id);
    return evento;
  };

  // El detalle lleva más que un Evento (grupos, marca): en el listado solo va lo de Evento.
  const resumen = ({ grupos: _, marca: __, ...evento }: EventoDetalle) =>
    evento;

  return {
    listarTipos: () =>
      responder(() => {
        const tipos = new Map<string, TipoEvento>();
        for (const { tipo } of eventos) tipos.set(tipo.id, tipo);
        return [...tipos.values()];
      }),

    listarEventos: (filtro: FiltroEventos = {}) =>
      responder(() => {
        const { pagina = 1, tamano = TAMANO_POR_DEFECTO } = filtro;
        if (pagina < 1)
          throw new PeticionIncorrectaError("pagina empieza en 1", "pagina");
        if (tamano < 1 || tamano > TAMANO_MAXIMO)
          throw new PeticionIncorrectaError(
            `tamano va de 1 a ${TAMANO_MAXIMO}`,
            "tamano",
          );
        const encontrados = eventos.filter(
          (e) =>
            (filtro.tipo === undefined || e.tipo.id === filtro.tipo) &&
            (filtro.estado === undefined || e.estado === filtro.estado) &&
            (filtro.desde === undefined || e.comienzo >= filtro.desde) &&
            (filtro.hasta === undefined || e.comienzo <= filtro.hasta),
        );
        const inicio = (pagina - 1) * tamano;
        return {
          eventos: encontrados.slice(inicio, inicio + tamano).map(resumen),
          pagina,
          tamano,
          total: encontrados.length,
          hayMas: inicio + tamano < encontrados.length,
          marca: "1",
        };
      }),

    obtenerEvento: (id) => responder(() => buscar(id)),

    listarMercados: (id, grupo) =>
      responder(() => {
        const { mercadoPrincipal, marca } = buscar(id);
        const mercados =
          mercadoPrincipal?.grupo === grupo ? [mercadoPrincipal] : [];
        return { mercados, marca };
      }),

    cambios: (): Observable<CambioEnEvento> => NEVER,

    cerrar: () => Promise.resolve(),
  };
}
