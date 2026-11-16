import { Link } from "react-router";
import { RUTAS } from "../rutas";
import estilos from "./Pagina.module.css";

export function PaginaInicio() {
  return (
    <>
      <h2 className={estilos.titulo}>Componentes del catálogo</h2>
      <p className={estilos.explicacion}>
        Una página por componente. Los datos salen del servicio en memoria (4
        eventos), que tarda 800 ms en responder.
      </p>
      <ul>
        {RUTAS.slice(1).map((r) => (
          <li key={r.ruta}>
            <Link to={r.ruta}>{r.titulo}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
