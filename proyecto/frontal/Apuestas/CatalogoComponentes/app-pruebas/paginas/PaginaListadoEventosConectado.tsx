// El listado conectado, contra el store de prueba de main.tsx.
import { ListadoEventosConectado } from "../../src/ListadoEventosConectado/ListadoEventosConectado";
import estilos from "./Pagina.module.css";
import { usePaginaListadoEventosConectado } from "./usePaginaListadoEventosConectado";

export function PaginaListadoEventosConectado() {
  const pagina = usePaginaListadoEventosConectado();

  return (
    <>
      <h2 className={estilos.titulo}>ListadoEventosConectado</h2>
      <p className={estilos.explicacion}>
        Lee el slice «catalogo» del store. No pide los eventos al montarse: los
        pide la aplicación, aquí con el botón.
      </p>
      <div className={estilos.mandos}>
        <button type="button" onClick={pagina.solicitar}>
          solicitarListadoEventos
        </button>
      </div>
      <ListadoEventosConectado />
      <p className={estilos.ultimo}>
        En el store, evento abierto: {pagina.abierto ?? "(ninguno)"} (
        {pagina.cargaEvento})
      </p>
    </>
  );
}
