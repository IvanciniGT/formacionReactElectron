// El listado de eventos. No sabe de dónde salen: se los dan por props, y avisa de lo que
// abre el jugador por callback. Así sirve en cualquier aplicación, con Redux o sin él.
import type { EstadoCarga } from "@apuestas-deportivas/catalogo-estado-bueno";
import type { Evento } from "@apuestas-deportivas/catalogo-servicios-api";
import { ListadoEventosItem } from "../ListadoEventosItem/ListadoEventosItem";
import estilos from "./ListadoEventos.module.css";
import { useListadoEventos } from "./useListadoEventos";

export interface PropsListadoEventos {
  eventos: readonly Evento[];
  carga: EstadoCarga;
  error?: string | undefined;
  onAbrirEvento?: ((id: string) => void) | undefined;
}

export function ListadoEventos({
  eventos,
  carga,
  error,
  onAbrirEvento,
}: PropsListadoEventos) {
  const listado = useListadoEventos(eventos, carga);

  return (
    <section
      className={estilos.listado}
      aria-label="Eventos"
      aria-busy={listado.ocupado}
    >
      {listado.cargando && (
        <p className={estilos.aviso} role="status">
          Cargando eventos…
        </p>
      )}
      {listado.fallo && (
        <p className={estilos.error} role="alert">
          No se han podido cargar los eventos: {error}
        </p>
      )}
      {listado.vacio && (
        <p className={estilos.aviso}>No hay eventos que mostrar</p>
      )}
      {listado.hayEventos && (
        <ul className={estilos.lista}>
          {eventos.map((evento) => (
            <li key={evento.id}>
              <ListadoEventosItem evento={evento} onAbrir={onAbrirEvento} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
