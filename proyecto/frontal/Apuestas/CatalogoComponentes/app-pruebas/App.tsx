// El esqueleto: un menú con un enlace por componente, y su página al lado.
import { NavLink, Route, Routes } from "react-router";
import estilos from "./App.module.css";
import { PaginaInicio } from "./paginas/PaginaInicio";
import { PaginaListadoEventos } from "./paginas/PaginaListadoEventos";
import { PaginaListadoEventosConectado } from "./paginas/PaginaListadoEventosConectado";
import { PaginaListadoEventosItem } from "./paginas/PaginaListadoEventosItem";
import { RUTAS } from "./rutas";

export function App() {
  return (
    <div className={estilos.app}>
      <nav className={estilos.menu}>
        <h1 className={estilos.titulo}>Componentes</h1>
        {RUTAS.map((r) => (
          <NavLink
            key={r.ruta}
            to={r.ruta}
            end
            className={({ isActive }) =>
              isActive ? `${estilos.enlace} ${estilos.activo}` : estilos.enlace
            }
          >
            {r.titulo}
          </NavLink>
        ))}
      </nav>
      <main className={estilos.pagina}>
        <Routes>
          <Route index element={<PaginaInicio />} />
          <Route
            path="listado-eventos-item"
            element={<PaginaListadoEventosItem />}
          />
          <Route path="listado-eventos" element={<PaginaListadoEventos />} />
          <Route
            path="listado-eventos-conectado"
            element={<PaginaListadoEventosConectado />}
          />
        </Routes>
      </main>
    </div>
  );
}
