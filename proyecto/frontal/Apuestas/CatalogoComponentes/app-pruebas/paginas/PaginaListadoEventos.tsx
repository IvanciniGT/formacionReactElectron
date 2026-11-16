// El listado presentacional: se le dan los eventos y la fase de carga con los mandos.
import { ListadoEventos } from "../../src/ListadoEventos/ListadoEventos";
import estilos from "./Pagina.module.css";
import { FASES, usePaginaListadoEventos } from "./usePaginaListadoEventos";

export function PaginaListadoEventos() {
  const pagina = usePaginaListadoEventos();

  return (
    <>
      <h2 className={estilos.titulo}>ListadoEventos</h2>
      <p className={estilos.explicacion}>
        Sin store: los eventos y la carga llegan por props. Cambia la fase para
        ver qué enseña en cada una.
      </p>
      <div className={estilos.mandos}>
        {FASES.map((fase) => (
          <button
            key={fase}
            type="button"
            aria-pressed={pagina.carga === fase}
            onClick={() => {
              pagina.setCarga(fase);
            }}
          >
            {fase}
          </button>
        ))}
        <button type="button" onClick={pagina.alternarEventos}>
          {pagina.conEventos ? "Quitar los eventos" : "Poner los eventos"}
        </button>
      </div>
      <ListadoEventos
        eventos={pagina.eventos}
        carga={pagina.carga}
        error="el servicio no responde"
        onAbrirEvento={pagina.onAbrirEvento}
      />
      <p className={estilos.ultimo}>
        onAbrirEvento: {pagina.abierto ?? "(todavía nada)"}
      </p>
    </>
  );
}
