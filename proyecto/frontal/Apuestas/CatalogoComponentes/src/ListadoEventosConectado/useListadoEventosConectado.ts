// El listado, enganchado al slice «catalogo»: lee con sus selectores y avisa con sus
// acciones. Es la única pieza de esta librería que sabe que hay un store.
//
// No pide los eventos al montarse: eso lo decide quien lo use (la aplicación al arrancar,
// un filtro…), con solicitarListadoEventos. El listado solo enseña lo que haya.
import {
  seleccionarCargaCatalogo,
  seleccionarErrorCatalogo,
  seleccionarEventos,
  solicitarEvento,
} from "@apuestas-deportivas/catalogo-estado-bueno";
import { useDispatch, useSelector } from "react-redux";

export function useListadoEventosConectado() {
  const dispatch = useDispatch();
  return {
    eventos: useSelector(seleccionarEventos),
    carga: useSelector(seleccionarCargaCatalogo),
    error: useSelector(seleccionarErrorCatalogo),
    onAbrirEvento: (id: string) => {
      dispatch(solicitarEvento(id));
    },
  };
}
