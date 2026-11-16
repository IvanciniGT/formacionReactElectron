// Arranca la app de pruebas: un store de prueba con el servicio en memoria (que tarda un
// poco en responder, para que se vea el «cargando») y el router.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { crearServicioEnMemoria } from "../dobles/servicio-en-memoria";
import { crearStoreDePrueba } from "../dobles/store-de-prueba";
import { App } from "./App";
import "./estilos.css";

const store = crearStoreDePrueba(crearServicioEnMemoria({ retardoMs: 800 }));

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Falta el <div id='raiz'> en index.html");

createRoot(raiz).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
