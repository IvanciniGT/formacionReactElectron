// La lógica y el estado del contador. Cada console.log marca una fase de su ciclo de vida,
// con los nombres de las notas: INICIO, RENDERIZAR, EN EL DOM, CAMBIO y DESTRUCCIÓN.
import { useEffect, useState } from "react";

export function useContador(
  cantidadInicial: number,
  intervaloMs: number,
  onReiniciar: ((cantidadQueHabia: number) => void) | undefined,
) {
  // INICIO: el componente lógico nace en memoria y se inicializa su estado. Todavía no hay
  // HTML. La función solo se ejecuta aquí, así que cantidadInicial es el valor INICIAL del
  // estado, como el atributo «checked» de un checkbox: si después cambia, el estado no se
  // entera.
  const [cantidad, setCantidad] = useState(
    () => {     // Esto es una función que devuelve el valor inicial del estado
      console.log("[Contador] INICIO: estado inicial", cantidadInicial);
      return cantidadInicial;
    }
  );
  // cantidad tiene el valor inicial del ESTADO 
  // setCantidad? Una función que puedo usar para cambiar el ESTADO
  //             Me la regala REACT.
  // Yo no voy a editar directamente la variable «cantidad», 
  // sino que usaré setCantidad para cambiar el estado (el valor de «cantidad»).
  // Al hacerlo, REACT inyernamente actualiza el estado y vuelve a renderizar el
  // componente con el nuevo valor de «cantidad».
  // Básicamente es como si la función setCantidad por dentro ejecutase:
  // function setCantidad(nuevoValor) {
  //   cantidad = nuevoValor; 
  //   componente.renderizar();
  // }
  // En react useState es lo que llamamos un hook: nos permite tener estado en un componente funcional.
  // REACT ABUSA DE LA PROGRAMACION FUNCIONAL
  // Antiguamente REACT permitía definir componentes mediante clases... haciendo uso de PROGRAMACION ORIENTADA A OBJETOS
  // Se puede seguir haciendo... pero no es la tendencia ni de lejos.

  // RENDERIZAR: React vuelve a llamar a la función del componente cada vez que cambia su
  // estado o un atributo, para calcular el HTML que tiene que haber.
  console.log("[Contador] RENDERIZAR: cantidad", cantidad);

  // Con [] se ejecuta una sola vez, cuando el HTML ya está incrustado en el DOM; y su
  // limpieza, una sola vez también, cuando sale de él.
  useEffect(() => {
    console.log("[Contador] EN EL DOM: ya se ve en pantalla");
    return () => {
      console.log("[Contador] DESTRUCCIÓN: sale del DOM");
    };
  }, []);
  //Cuántas funciones estamos definiendo ahi? 2 funciones
  // Una:
  //() => {
  //  console.log("[Contador] EN EL DOM: ya se ve en pantalla");
  //  return () => {
  //    console.log("[Contador] DESTRUCCIÓN: sale del DOM");
  //  };
  //}

  // La otra: () => {    UN CLOSURE: Una funcióin que estamos definiendo dentro de otra función, y que tiene acceso a las variables de la función exterior.
  //    console.log("[Contador] DESTRUCCIÓN: sale del DOM");
  //  };

  // Cuando se ejecutan?
  // La primera se ejecuta después de que el componente se ha renderizado y se ha insertado en el DOM.
  //    Es decir, es lo que en programacion OO sería componentDidMount.
  // Al ejecutarse, hace:
  //      console.log("[Contador] EN EL DOM: ya se ve en pantalla");
  // Y devuelve otra función
  // La segunda se ejecuta cuando el componente se va a desmontar, antes de que se retire del DOM.
  //    Es lo que en programacion OO sería componentWillUnmount.

  // Lógica propia ante el cambio de un atributo: si cambia intervaloMs, no basta con volver
  // a pintar, hay que parar el temporizador y arrancar otro. Por eso intervaloMs es su
  // dependencia: el efecto se repite (con su limpieza antes) cuando cambia.
  useEffect(() => {
    console.log("[Contador] TEMPORIZADOR: arranca cada", intervaloMs, "ms");
    const id = window.setInterval(() => {
      console.log("[Contador] CAMBIO de estado: por el temporizador");
      // Con una función y no con setCantidad(cantidad + 1): este intervalo se creó en un
      // render concreto, y la «cantidad» de ese render se queda vieja en los siguientes.
      setCantidad((anterior) => anterior + 1);
    }, intervaloMs);
    // Si hay un cambio en el valor de intervaloMs, se ejecuta el código de arriba
    // El código de abajo se ejecuta como limpieza antes de que se repita el efecto, es decir, para parar el temporizador anterior.

    return () => {
      console.log("[Contador] TEMPORIZADOR: se para", id);
      window.clearInterval(id);
    };
  }, [intervaloMs]);

  return {
    cantidad,
    // CAMBIO de estado por el usuario. Vuelve a la cantidadInicial de ahora, no a la del
    // INICIO. Después se avisa al padre con el evento onReiniciar: el componente cuenta lo
    // que ha pasado, y qué hacer con eso lo decide el padre.
    reiniciar: () => {
      console.log("[Contador] CAMBIO de estado: por el usuario (reiniciar)");
      setCantidad(cantidadInicial);
      onReiniciar?.(cantidad);
    },
  };
}

// Ejemplo de este mismo componente definido mediante una clase (Programación Orientada a Objetos)
/*
class Contador extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cantidad: props.cantidadInicial
    };
  }
  componentDidMount() { // Cuando se pincha en el DOM
    console.log("[Contador] EN EL DOM: ya se ve en pantalla");
  }
  componentWillUnmount() { // Cuando se va a quitar del DOM
    console.log("[Contador] DESTRUCCIÓN: sale del DOM");
  }
  componentDidUpdate(prevProps, prevState) { // Cuando se actualiza el componente
    if (prevProps.cantidadInicial !== this.props.cantidadInicial) {
      console.log("[Contador] ACTUALIZACIÓN: cambió cantidadInicial");
      this.setState({ cantidad: this.props.cantidadInicial });
    }
  }



}
  */