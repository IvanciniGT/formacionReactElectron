import type {
  CambioEnEvento,
  ConfiguracionServicioEventos,
  CrearServicioEventos,
  EventoDetalle,
  Mercado,
  PaginaEventos,
  ServicioEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import type { Subscription } from "rxjs";
import type { EntornoDePruebas } from "./entorno.js";

// Lo que comparten los pasos de un escenario. Es una interfaz: la clase la crea
// registrarPruebas sobre el World del Cucumber de quien ejecuta el TCK. Los pasos de caja
// blanca de una implementación también lo reciben, y pueden mirar dentro de su entorno.
export interface MundoCatalogo {
  readonly entorno: EntornoDePruebas;
  // La fábrica de la implementación y la configuración con la que se creó el servicio.
  readonly crearServicio: CrearServicioEventos;
  configuracion: ConfiguracionServicioEventos;
  servicio: ServicioEventos;
  pagina: PaginaEventos | undefined;
  evento: EventoDetalle | undefined;
  mercados: readonly Mercado[] | undefined;
  error: unknown;
  recibidos: CambioEnEvento[];
  terminada: boolean;
  suscripcion: Subscription | undefined;
}

// Todo por el servicio: es caja negra. Los ids se averiguan como lo haría una pantalla.
export async function idDeEvento(
  mundo: MundoCatalogo,
  nombre: string,
): Promise<string> {
  const { eventos } = await mundo.servicio.listarEventos({ tamano: 100 });
  const evento = eventos.find((e) => e.nombre === nombre);
  if (!evento) throw new Error(`No se ve ningún evento «${nombre}».`);
  return evento.id;
}

// Todos los mercados visibles del evento, grupo a grupo.
export async function mercadosDeEvento(
  mundo: MundoCatalogo,
  eventoId: string,
): Promise<readonly Mercado[]> {
  const detalle = await mundo.servicio.obtenerEvento(eventoId);
  const grupos = await Promise.all(
    detalle.grupos.map((g) => mundo.servicio.listarMercados(eventoId, g.clave)),
  );
  return grupos.flatMap((g) => g.mercados);
}

export function suscribirse(
  mundo: MundoCatalogo,
  eventoId: string,
  desde: string,
  mercados?: readonly string[],
): void {
  mundo.suscripcion = mundo.servicio
    .cambios(eventoId, desde, mercados)
    .subscribe({
      next: (cambio) => mundo.recibidos.push(cambio),
      error: (error: unknown) => {
        mundo.error = error;
      },
      complete: () => {
        mundo.terminada = true;
      },
    });
}

// Lo que llega en tiempo real llega cuando llega: se espera hasta que se cumpla.
export async function esperarA(
  condicion: () => boolean,
  descripcion: string,
): Promise<void> {
  const limite = Date.now() + 5_000;
  while (!condicion()) {
    if (Date.now() > limite)
      throw new Error(`No ha llegado a pasar: ${descripcion}`);
    await new Promise((resolver) => setTimeout(resolver, 20));
  }
}
