# Ciclo de vida de un componente React

Ejemplo introductorio, solo con React y Vite: un contador que sube solo y se puede reiniciar,
y unos mandos para provocar cada fase de su ciclo de vida. Lo que pasa se sigue en la
consola del navegador.

## Ejecutarlo

```bash
npm install
npm run dev        # abre http://localhost:5173
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo, con recarga en caliente |
| `npm run tipos` | Comprueba los tipos con TypeScript |
| `npm run build` | Comprueba los tipos y construye en `dist/` |
| `npm run preview` | Sirve lo construido en `dist/` |

## Las piezas del componente, y dónde está cada una

Un componente es una etiqueta HTML propia. Como cualquier etiqueta tiene **nombre, atributos
y eventos**, que es lo que se ve desde fuera. Por dentro tiene **estado, lógica, estructura
HTML y estilos**.

| Pieza | En `<Contador>` | Dónde |
|---|---|---|
| Nombre | `Contador` | `Contador.tsx` |
| Atributos (props) | `titulo`, `cantidadInicial`, `intervaloMs` | `PropsContador`, en `Contador.tsx` |
| Eventos | `onReiniciar(cantidadQueHabia)` | `PropsContador`; se dispara en `useContador.ts` |
| Estado | `cantidad` | `useContador.ts` |
| Lógica | el temporizador; reiniciar | `useContador.ts` |
| Estructura HTML | `<article>`, `<h2>`, `<output>`, `<button>` | `Contador.tsx` (solo JSX) |
| Estilos | | `Contador.module.css` |

Es lo mismo que en un `<input type="checkbox" checked onChange="…">`:

- el atributo `checked` es el valor **inicial** del estado, como `cantidadInicial`;
- marcarlo es el cambio de estado por el usuario, como «Reiniciar»;
- `onChange` es el evento, como `onReiniciar`.

En los atributos y eventos, el padre manda los datos **hacia abajo** con los atributos, y el
hijo avisa **hacia arriba** con los eventos. El contador no decide qué pasa cuando se
reinicia: lo cuenta, y la página (`useApp.ts`) lo apunta.

## El ciclo de vida

| Fase | Qué es | En la consola |
|---|---|---|
| Inicio | Nace el componente lógico, en memoria: se inicializa su estado. Todavía no hay HTML | `INICIO` |
| Renderizar | React llama a la función del componente para calcular el HTML que tiene que haber | `RENDERIZAR` |
| En el DOM | Ese HTML ya está incrustado en el DOM y se ve en pantalla. Aquí arranca lo que necesita la pantalla (el temporizador) | `EN EL DOM`, `TEMPORIZADOR: arranca` |
| Cambios | Cambia el estado (lo cambia el propio componente o el usuario) o cambia un atributo: se vuelve a renderizar | `CAMBIO…`, `RENDERIZAR` |
| Destrucción | Sale del DOM: se para lo que se arrancó | `DESTRUCCIÓN`, `TEMPORIZADOR: se para` |

## Qué probar

| Mando | Qué provoca | En la consola |
|---|---|---|
| (al abrir la página) | Inicio, renderizar y en el DOM | `INICIO`, `RENDERIZAR`, `EN EL DOM`, `TEMPORIZADOR: arranca` |
| (esperar) | Cambio de estado **por el propio componente** (el temporizador) | `CAMBIO de estado: por el temporizador`, `RENDERIZAR` |
| Reiniciar | Cambio de estado **por el usuario**, y el evento `onReiniciar` hacia la página | `CAMBIO de estado: por el usuario`, `RENDERIZAR` |
| Cambiar el título | Cambia un atributo que solo se pinta: se vuelve a renderizar, y ya | `RENDERIZAR` |
| Cantidad inicial | Cambia un atributo que es el valor inicial del estado: el contador **no** cambia. Se nota al reiniciar, o en el siguiente inicio | `RENDERIZAR` |
| Intervalo | Cambia un atributo al que el contador reacciona **con lógica propia**: no basta con volver a pintar, hay que cambiar el temporizador | `RENDERIZAR`, `TEMPORIZADOR: se para`, `TEMPORIZADOR: arranca` |
| Desmontar | Destrucción | `DESTRUCCIÓN`, `TEMPORIZADOR: se para` |
| Montar | Otro inicio desde cero, con la cantidad inicial que haya **ahora** | `INICIO`, `RENDERIZAR`, `EN EL DOM`, `TEMPORIZADOR: arranca` |
| Montar otro (nueva key) | Otra `key` es otro componente para React: se crea el nuevo y se destruye el viejo | `INICIO`, `RENDERIZAR` (el nuevo); `DESTRUCCIÓN`, `TEMPORIZADOR: se para` (el viejo); `EN EL DOM`, `TEMPORIZADOR: arranca` (el nuevo) |

## Cómo se escribe cada fase en React

```ts
const [cantidad, setCantidad] = useState(() => cantidadInicial); // INICIO: solo la primera vez

console.log("RENDERIZAR"); // el cuerpo de la función: en cada render

useEffect(() => {
  // EN EL DOM
  return () => { /* DESTRUCCIÓN */ };
}, []); // [] = una sola vez

useEffect(() => {
  // arranca el temporizador…
  return () => { /* …y lo para */ };
}, [intervaloMs]); // se repite cuando cambia este atributo
```

## Por qué salen mensajes repetidos

`StrictMode` (en `main.tsx`), solo en desarrollo:

- renderiza cada componente dos veces;
- al crearlo, lo pone en el DOM, lo destruye y lo vuelve a poner.

Por eso, al abrir la página, salen `EN EL DOM`, `DESTRUCCIÓN` y `EN EL DOM`. Lo hace a
propósito: si al destruirse no se parara el temporizador, quedarían dos, y el contador subiría
de dos en dos. Que suba de uno en uno demuestra que la destrucción está bien hecha. Con
`npm run build` no pasa.

## Dos detalles del código

- `setCantidad((anterior) => anterior + 1)`, con una función. Si se escribiera
  `setCantidad(cantidad + 1)`, el temporizador usaría la `cantidad` del render en que se
  creó, que se queda vieja, y el contador se quedaría clavado.
- React no vigila las variables: se entera de que el estado ha cambiado porque se llama a
  `setCantidad`. Si se cambiara una variable a mano, no volvería a renderizar.
