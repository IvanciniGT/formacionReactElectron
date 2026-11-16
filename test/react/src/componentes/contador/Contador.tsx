// La estructura HTML del contador. Solo coloca lo que le da useContador.
//
// Como cualquier etiqueta HTML, <Contador> tiene un nombre, atributos (las props) y eventos
// (las props on…). Lo de dentro (estado, lógica, estilos) no se ve desde fuera.
import estilos from "./Contador.module.css";
import { useContador } from "./useContador";

// Este interfaz son los Atributos y Eventos que acepta el componente <Contador>
// En React se usa un modelo de callback para los eventos, es decir, se pasa una función como prop que se ejecutará cuando ocurra el evento.
export interface PropsContador {
  // Atributos
  titulo: string;
  cantidadInicial?: number;
  intervaloMs?: number;
  // Eventos: avisa al padre, con la cantidad por la que iba, cuando el usuario lo reinicia.
  onReiniciar?: (cantidadQueHabia: number) => void;
}

                ////////      Nombre de la marca html que estoy creando: <Contador>    
export function Contador({
  titulo,
  cantidadInicial = 0,
  intervaloMs = 1000,
  onReiniciar,
}: PropsContador) {
  const contador = useContador(cantidadInicial, intervaloMs, onReiniciar);

  return (
    // Este lenguaje de abajo se llama JSX, que es una extensión de JavaScript que permite escribir HTML dentro de JS.
    <article className={estilos.contador}>
      <h2 className={estilos.titulo}>{titulo}</h2>
      <output className={estilos.cantidad}>{contador.cantidad}</output>
      <p className={estilos.nota}>Sube cada {intervaloMs / 1000} s</p>
      <button type="button" onClick={contador.reiniciar}>
        Reiniciar
      </button>
    </article>
  );
}
