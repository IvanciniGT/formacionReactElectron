// La lógica de la página: los atributos que se le pasan al contador, los mandos que los
// cambian y lo que se hace con su evento. Cada mando provoca una fase distinta del ciclo de
// vida del contador.
import { useState } from "react";

const TITULOS = ["Pedidos procesados", "Usuarios conectados"] as const;

export function useApp() {
  const [titulo, setTitulo] = useState<string>(TITULOS[0]);
  const [cantidadInicial, setCantidadInicial] = useState(10);
  const [intervaloMs, setIntervaloMs] = useState(1000);
  const [visible, setVisible] = useState(true);
  // Lo que se le pone al contador como key: si cambia, para React es otro componente.
  const [identidad, setIdentidad] = useState(0);
  const [ultimoReinicio, setUltimoReinicio] = useState<number>();

  return {
    titulo,
    cantidadInicial,
    intervaloMs,
    visible,
    identidad,
    ultimoReinicio,

    // El evento del contador: qué hacer cuando avisa lo decide la página, no el contador.
    alReiniciar: (cantidadQueHabia: number) => {
      setUltimoReinicio(cantidadQueHabia);
    },

    // Cambia un atributo que solo se pinta: se vuelve a renderizar y nada más.
    cambiarTitulo: () => {
      setTitulo((t) => (t === TITULOS[0] ? TITULOS[1] : TITULOS[0]));
    },
    // Cambia un atributo que es el valor inicial del estado: no se nota hasta el siguiente
    // INICIO (o hasta que se reinicie).
    cambiarCantidadInicial: () => {
      setCantidadInicial((c) => (c === 10 ? 100 : 10));
    },
    // Cambia un atributo al que el contador reacciona con lógica propia: se para el
    // temporizador y se arranca otro.
    cambiarIntervalo: () => {
      setIntervaloMs((ms) => (ms === 1000 ? 500 : 1000));
    },
    // Quitarlo y ponerlo: DESTRUCCIÓN y, al volver, otro INICIO desde cero.
    alternarVisible: () => {
      setVisible((v) => !v);
    },
    // Otra key: React destruye el que había y crea uno nuevo, aunque los atributos sean
    // los mismos.
    forzarMontaje: () => {
      setIdentidad((n) => n + 1);
      setVisible(true);
    },
  };
}
