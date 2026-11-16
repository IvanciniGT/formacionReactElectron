// La página: el contador y los mandos para provocar cada momento de su ciclo de vida.
import estilos from "./App.module.css";
import { Contador } from "./componentes/contador/Contador";
import { useApp } from "./useApp";

export function App() {
  const app = useApp();

  return (
    <main className={estilos.pagina}>
      <header>
        <span className={estilos.etiqueta}>Ejemplo · React + TypeScript</span>
        <h1>Ciclo de vida de un contador</h1>
        <p className={estilos.ayuda}>
          Abre la consola del navegador: cada momento del ciclo de vida deja un
          mensaje.
        </p>
      </header>

      <section className={estilos.demo} aria-label="El contador">
        {app.visible ? (
          <Contador
            key={app.identidad}
            titulo={app.titulo}
            cantidadInicial={app.cantidadInicial}
            intervaloMs={app.intervaloMs}
            onReiniciar={app.alReiniciar}
          />
        ) : (
          <div className={estilos.desmontado}>
            Destruido: ha salido del DOM y su temporizador está parado.
          </div>
        )}
        <p className={estilos.evento}>
          Evento onReiniciar:{" "}
          {app.ultimoReinicio === undefined
            ? "todavía no ha llegado"
            : `se reinició cuando iba por ${app.ultimoReinicio}`}
        </p>
      </section>

      <section className={estilos.panel} aria-label="Mandos">
        <h2>Probar el ciclo de vida</h2>
        <div className={estilos.mandos}>
          <button type="button" onClick={app.cambiarTitulo}>
            Cambiar el título
          </button>
          <button type="button" onClick={app.cambiarCantidadInicial}>
            Cantidad inicial: {app.cantidadInicial}
          </button>
          <button type="button" onClick={app.cambiarIntervalo}>
            Intervalo: {app.intervaloMs} ms
          </button>
          <button type="button" onClick={app.alternarVisible}>
            {app.visible ? "Desmontar" : "Montar"}
          </button>
          <button type="button" onClick={app.forzarMontaje}>
            Montar otro (nueva key)
          </button>
        </div>
        <p className={estilos.ayuda}>
          La cantidad inicial es el valor <strong>inicial</strong> del estado,
          como el <code>checked</code> de un checkbox: no cambia un contador que
          ya existe. Se nota al reiniciarlo, al desmontarlo y montarlo, o al pedir
          otro con una key nueva.
        </p>
      </section>
    </main>
  );
}
