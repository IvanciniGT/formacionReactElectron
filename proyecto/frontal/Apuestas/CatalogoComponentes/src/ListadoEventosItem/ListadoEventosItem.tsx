// Un evento dentro del listado: qué es, cuándo empieza y las cuotas de su mercado principal.
// Solo pinta; lo que pinta lo prepara useListadoEventosItem.
import type { Evento } from "@apuestas-deportivas/catalogo-servicios-api";
import estilos from "./ListadoEventosItem.module.css";
import { useListadoEventosItem } from "./useListadoEventosItem";

export interface PropsListadoEventosItem {
  evento: Evento;
  // Se avisa con el id del evento cuando el jugador lo abre.
  onAbrir?: ((id: string) => void) | undefined;
}

export function ListadoEventosItem({
  evento,
  onAbrir,
}: PropsListadoEventosItem) {
  const item = useListadoEventosItem(evento, onAbrir);

  return (
    <article className={estilos.item} aria-label={evento.nombre}>
      <button type="button" className={estilos.cabecera} onClick={item.abrir}>
        <span className={estilos.tipo}>{evento.tipo.nombre}</span>
        <span className={estilos.nombre}>{evento.nombre}</span>
        {item.enDirecto ? (
          <span className={estilos.directo}>En directo</span>
        ) : (
          <time className={estilos.comienzo} dateTime={item.comienzoIso}>
            {item.comienzo}
          </time>
        )}
        {item.interrumpido && (
          <span className={estilos.interrumpido}>Interrumpido</span>
        )}
      </button>

      {item.selecciones.length > 0 ? (
        <ul
          className={estilos.cuotas}
          aria-label="Cuotas"
          data-suspendido={item.suspendido}
        >
          {item.selecciones.map((s) => (
            <li
              key={s.id}
              className={estilos.seleccion}
              data-tendencia={s.tendencia}
            >
              <span className={estilos.descripcion}>{s.descripcion}</span>
              <span className={estilos.cuota}>{s.cuota}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={estilos.sinCuotas}>Sin cuotas todavía</p>
      )}
    </article>
  );
}
