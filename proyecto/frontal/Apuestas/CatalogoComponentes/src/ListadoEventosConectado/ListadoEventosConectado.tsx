// El listado de eventos del store: el mismo ListadoEventos, con las props sacadas del slice
// «catalogo». Necesita un <Provider> de react-redux con ese slice inyectado.
import { ListadoEventos } from "../ListadoEventos/ListadoEventos";
import { useListadoEventosConectado } from "./useListadoEventosConectado";

export function ListadoEventosConectado() {
  return <ListadoEventos {...useListadoEventosConectado()} />;
}
