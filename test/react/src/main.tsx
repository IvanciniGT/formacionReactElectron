// El punto de entrada: monta App dentro del <div id="raiz"> de index.html.
//
// StrictMode, solo en desarrollo, pinta cada componente dos veces y monta, desmonta y
// vuelve a montar sus efectos. Lo hace a propósito, para que se note un efecto sin
// limpieza. Por eso en la consola salen los mensajes repetidos.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./estilos.css";

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Falta el <div id='raiz'> en index.html");

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
