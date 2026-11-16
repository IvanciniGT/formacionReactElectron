// Hace de aplicación: es quien pide el listado (el componente no lo pide solo) y enseña
// qué evento ha quedado abierto en el store.
import {
  seleccionarCatalogo,
  solicitarListadoEventos,
  type EstadoConCatalogo,
} from "@apuestas-deportivas/catalogo-estado-bueno";
import { useDispatch, useSelector } from "react-redux";

export function usePaginaListadoEventosConectado() {
  const dispatch = useDispatch();
  const evento = useSelector(
    (estado: EstadoConCatalogo) => seleccionarCatalogo(estado).evento,
  );

  return {
    solicitar: () => {
      dispatch(solicitarListadoEventos());
    },
    abierto: evento.id,
    cargaEvento: evento.carga,
  };
}
