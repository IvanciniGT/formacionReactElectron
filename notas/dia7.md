# Componentes Web (sigue un estándar del W3C)

Etiqueta HTML Custom... Y como toda marca HTML tiene:
- Nombre
- Atributos
- Eventos

Cuando definimos un componente necesitamos explicitar su:

- Lógica
- Estilos
- Estructura HTML
- Estado

Es algo que vemos también en componentes ESTANDAR: <input type="checkbox" value="algo" checked onChange="" onMouseOver=""/>

> Estado? Si está chequeado o no lo está.
  El checked que me pasan como atributo qué es? El valor inicial del estado del checkbox.
  Y lógica dentro? Al hacer click en el HTML del componente, se actualiza el estado del checkbox, a qué valor? Al contrario: Toggle
  Estructura HTML:

```html
<div>
    <span class="checked" onClick="toggleCheckbox()"> <!-- si el checkbox está chequeado --> </span>
    <!-- Si no estás chequeado, <span> -->
    <label> Mayor de 18 años </label>
</div>
```
  Lógica:

```js
    function toggleCheckbox() {
        this.estado = !this.estado;
    }
```

  Estilos:

```css
span {
    display: inline-block;
    border: 1px solid #000;
    background-color: #fff;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.25rem;
    font-size: 1rem;
    font-family: Arial, sans-serif;
    margin-right: 0.5rem;
}
span.checked::after {
    content: "✔";
    display: inline-block;
    color: #000;
    font-size: 1rem;
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0.25rem;
}
```

> rem? Es el tmaño de fuente (del contenedor padre que defina el tamaño de fuente).
> em?  Es el tamaño de fuente relativo al propio elemento.
> px? Es un valor absoluto en píxeles.
> %? Es un valor relativo al tamaño de la raíz (generalmente el tamaño de fuente del <html>).
> vh? Es un valor relativo a la altura de la ventana.
> vw? Es un valor relativo al ancho de la ventana.

Hoy en día: trabajamos con HTML semántico y CSS3 (box model)
Lo que pasa es que las cajas son de distinta naturaleza (display: block, inline, inline-block, flex, grid, etc.)
Y hay elementos con un comportaiento por defecto, aceptado y conocido.Puedo convertir sin problema un <p> en un <div> y aplicar los estilos que quiera. Pero es un sin sentido.
<div> Esto es un ejemplo de un contenedor de bloque </div>
<span> Esto es un ejemplo de un contenedor en línea (dentro de un bloque)</span>

En paralelo con esto, un componente tiene un ciclo de vida.
Qué tiene sentido como ciclo de vida de un componente? OPERACIONES / ESTADOS

- Inicio
  - Cuando se crea el componente LOGICO... en RAM, se inicializan sus estados.
  - Esto implica que se genere el HTML? NO....
    El componente es un concepto LOGICO
    Otra cosa es la representación que vaya a tener ese componente -> HTML + CSS
    Generemos una estructura HTML + CSS para representar el componente visualmente.
    Pero tampoco es solo generar un HTML + CSS.. también es necesario para ver el componente en pantalla INCRUSTAR el HTML +CSS en el DOM.

    DOM? Document Object Model. Es la estructura de objetos / componentes que usa el navegador para representar la página web.
    De esa estructura es de la que el navegador se sirve para renderizar la página web en pantalla.
- Cambios
   Cuando hay un cambio en el estado local del componente -> Implicará? re-renderizar el componente para reflejar los cambios en la interfaz.
   A qué se puede deber un cambio en el estado?
   - Código JS dentro del componente que cambie el estado, como consecuencia de una interacción del usuario.
   - Que cambie un atributo.
- Renderizar
- Destrucción


## Componentes react

React nos da una forma de crear componentes reutilizables con estado y lógica encapsulada. De hecho varias formas, aunque se ha impuesto principalmente el uso de componentes funcionales con hooks.

- Funciones
- Clases


En react, los atributos de un componente se llaman "props" y se utilizan para pasar datos desde un componente padre a un componente hijo.
Otra cosa es el estado del componente, que es interno y puede cambiar a lo largo del ciclo de vida del componente.
Podemos inicialziar un estado desde una prop o desde un valor por defecto dentro del propio componente.
Pero reaccionaremos a los cambios en el estado para actualizar la interfaz de usuario en consecuencia. ESTA ES LA FORMA EN LA QUE OPERA REACT.
React monitoriza el estado de los componentes (sus variuables internas) y, cuando detecta un cambio, vuelve a renderizar el componente para reflejar los cambios en la interfaz de usuario.
Pero a veces, si cambia una prop que se pasa al componente, necesitaré no solo re-renderizar el componente, sino también reaccionar de alguna manera específica (con lógica propia) a ese cambio.

> Componente muy simple: AUTO-CONTADOR

Lo definimos a nivel HTML:
- Marca: <auto-contador></auto-contador>
- Atributos: 
    - valorInicial: 0
    - ValorMaximo: 10
    - incremento: 1
    - intervalo: 1000
    - separador: "/"
- Eventos:
  - onInicio:                 Se dispara cuando el contador se inicia.
  - onIncremento:             Se dispara cada vez que el contador se incrementa.
  - onMaximoAlcanzado:        Se dispara cuando el contador alcanza el valor máximo.
- Estado:
  - valor_actual: Que empieza con el valor inicial (valorInicial).

- Lógica interna del compomnemte (que va a sociada en gran media al ciclo de vida del componente)

    Crear un Interval (setInterval) que se debe ejecutar cada (intervalo) y debe:
        incrementar el valor_actual en (incremento)
        emitir un evento de incremento (onIncremento)
        comprobarSiSeAlcanzoElMaximo()
    Cuando creo ese interval?    Cuando se esté mostrando ya en pantalla una (vez añadido al DOM)
                                 Y en ese momento, lanzar el evento de inicio (onInicio)

    comprobarSiSeAlcanzoElMaximo() Qué tiene que hacer esto? Qué significa? Si valor_actual >= valor_maximo, entonces:
        emitir un evento de máximo alcanzado (onMaximoAlcanzado)
        terminar el interval (clearInterval)

    Al destruir el componente:
        terminar el interval (clearInterval) si no lo está ya...
        Una cosa es el DOM y otra cosa el el componente lógico.
        Quizás lo hemos dejado de mostrar en la pantalla.. pero eso no implica que su código JS siga estando en ejecución... y por ende sus intervalos o cualquier otra lógica interna seguirán activos si no los detenemos explícitamente.

- HTML (lo representamos con marcas que ya debe conocer el navegador)

```html
<div class="auto-contador terminado"> <!-- Cuando pongo añado el estilo: terminado? Cuando valor_actual >= valor_maximo -->
    <span class="valor-actual"> {{valor_actual}} </span>
    <span class="separador">    {{separador}}    </span>
    <span class="valor-maximo"> {{valor_maximo}} </span>
</div>
```

    +----------+
    |   3/10   |
    +----------+

- ESTILOS
```css
.auto-contador {

}

.auto-contador.terminado{

}

.auto-contador>span {

}

.auto-contador>span.valor-actual {

}

.auto-contador>span.separador {

}

.auto-contador>span.valor-maximo {

}
```


Lo que acabamos de hacer es DESCRIBIR EL COMPORTAMIENTO NUEVO DE UNA MARCA HTML que nos estamo diseñando nosotros: <auto-contador>
Y estas instrucciones, acerca de esa marca, su comportamiento, sus atributos, eventos y estilos, su lógica, a quién se la estamos explicando? NAVEGADOR!

En navegador es el que debe aprender a reconocer la marca <auto-contador> y a comportarse según las instrucciones que le hemos dado.

Nosotros se lo explicamos al NAVEGADOR!
En nuestro caso, usamos de intermediario a React. React solo nos ayuda a explicarle al navegador cómo debe comportarse el componente <auto-contador> según nuestras instrucciones.

Podríamos explicarlo usando otra libreria/framework: Angular, Lit o cualquier otro que nos permita describir componentes y su comportamiento para el navegador.

El estandar de Web Components se crea para que los navegadores tengan / ofrezcan una forma NATIVA de reconocer y manejar nuevas marcas html, más allá de las definidas en el propio HTML estándar.

Y Estas librerías / frameworks nos ayudan a explicarle eso al navegador, para que sepa cómo debe comportarse el componente <auto-contador> según nuestras instrucciones.


OTRA COSA cuándo y donde vamos a hacer uso de <auto-contador>? NPI . No es mi problema ahora mismo.

Qué nos queda por ver? LA SINTAXIS CONCRETA que REACT ofrece para crear y manejar el componente <auto-contador>.


---

Hoy en día junto con React, tendemos a usar VITE.

VITE es una herramienta que nos permite crear proyectos de React (y otros frameworks) de manera rápida y eficiente, con un entorno de desarrollo optimizado y soporte para módulos modernos de JavaScript, ejecución de pruebas y recarga en caliente del navegador durante el desarrollo.

Este componente que vamos a desarrollar, dónde se ejecutará? NAVEGADOR.

Entonces la pregunta es: NECESITAMOS NODEJS?

NODEJS? Intérprete de JS que nos permite ejecutar JS dónde? FUERA DE UN NAVEGADOR.
Los navegadores ya traen su propio intérprete de JS, por lo que no necesitamos NodeJS para ejecutar código que se ejecutará en el navegador.

Entonces.. repito la pregunta? Necesitamos NODEJS para ejecutar este componente? NO
Pero si lo necesito para otra cosa: Desarrollarlo, probarlo, empaquetarlo....

Esto lo probaré en un navegador... pero a que URL va a estar apuntando el navegador? a una en localhost... pero quien hay detrás ? Un servidor WEB.. Quién lo monta? Donde corre?
En este caso, VITE monta un servidor web de desarrollo en mi máquina local, que sirve los archivos de mi proyecto y permite que el navegador los cargue desde localhost. Por eso necesitamos NodeJS: para ejecutar VITE y levantar ese servidor de desarrollo.
En nuestro caso, además usaremos JS? NO... usaremos TS.. pero hay que Transpilarlo a JS... eso lo haec el TRANSPILADOR de TypeScript (tsc), que convierte nuestro código TS en código JS que el navegador puede entender.
Quién lo llama? VITE, cuando levanta el servidor de desarrollo y sirve los archivos, se encarga de invocar al transpilador de TypeScript para convertir nuestro código TS en JS que el navegador pueda ejecutar. EN CALIENTE... Cada vez que cambie en local (en mi HDD) el código TS, VITE vuelve a solicitar su transpilado y el navegador recibe la versión actualizada sin necesidad de recargar manualmente la página.

Vite nos ayuda con muchas cosas... Y muchas de esas cosas son progrmas JS que se ejecutan en NodeJS para facilitar el desarrollo en el navegador.

El intérprete JS del navegador procesa (interpreta) el JS igual que Node? SI... de hecho para eso hay un estándar llamado ECMAScript, que define cómo debe comportarse el lenguaje JavaScript. Tanto NodeJS como los navegadores implementan este estándar, lo que garantiza que el código JS se ejecute de manera consistente en ambos entornos.

Otra cosa es que a nivel de NodeJS, se incluyan librerías específicas del entorno de Node, como `fs` para el sistema de archivos o `http` para crear servidores web. Estas librerías no están disponibles en el navegador, ya que son específicas de NodeJS y no forman parte del estándar ECMAScript.

---

En TS/JS, las llaves `{}` tienen varios usos...

- Uno es escribir bloques de código:
    ```ts
    if (true) { // BLOQUE DE CÓDIGO DENTRO DE UN IF
    console.log("Esto es un bloque de código");
    }

    export function miFuncion() { // BLOQUE DE CÓDIGO DENTRO DE UNA FUNCIÓN
    console.log("Esto es otro bloque de código dentro de una función");
    }
    ```
- Otro uso es para definir OBJETOS JS.
  Qué es un objeto JS? Un tipoi de dato disponible en JS... equilente en otros lenguajes a: Mapa / Diccionario / Array asociativo.
  Un conjunto de valores identificados por claves, donde cada valor está asociado a una clave específica.

  ```ts
  const persona = {
    nombre: "Juan",
    edad: 30,
  };
  persona.edad = 31;
  console.log(persona.nombre); // "Juan"
  console.log(persona.edad);   // 31
  ```
Hay muchas peculiaridades con la sintaxis de objetos js:
 
```ts

const nombre = "Juan";
const edad = 30;

const persona = {
  nombre,  // Esto es una coñada de JS, que permite definir a la vez la clave y el valor. Toma el valor de la variable, como valor, y el nombre de la variable como clave.
  edad,
};

console.log(persona); // { nombre: "Juan", edad: 30 }
```

Sería el equivalente a haber escrito:

```ts
const persona = {
  "nombre": nombre,
  "edad": edad,
};
```

Otra sintaxis que usamos mucho es la de desestructuración de objetos, que permite extraer valores de un objeto y asignarlos a variables de manera más concisa.

```ts
const persona = {
  nombre: "Juan",
  edad: 30,
};

const { nombre, edad } = persona;
// Aqui lo que hacemos es DEFINIR VARIABLES cuyo valor se toma de ciertas claves del objeto persona... las claves cuyo nombre coincide con el del nombre de la variable.
console.log(nombre); // "Juan"
console.log(edad);   // 30
```

Eso sería equivalente a :

```ts
const nombre = persona.nombre;
const edad = persona.edad;
```

---

La desestructuración no la podemos aplicar solamente a objetos. Tambien se puede aplicar a arrays (lista).

```ts
const numeros = [1, 2, 3];
const [primero, segundo] = numeros;
console.log(primero); // 1
console.log(segundo); // 2
```

Una función en JS puede devolver varios valores? NO... pero podemos hacer que devuelva un array con varos valores del tipo que sea cada uno.

```ts
function obtenerCoordenadas() {
  const x = 10;
  const y = 20;
  return [x, y];
}

const [x, y] = obtenerCoordenadas();
console.log(x); // 10
console.log(y); // 20
```

# Nuestro componente de Listado de eventos

## Primero Framework / Librería FUERA!
(Me centro en lo que es el WEB COMPONENT)

MARCA:
ATRIBUTOS:
EVENTOS:
STATE:            (Estado de componentes) / MAQUINA DE ESTADOS
LOGICA:

ESTRUCTURA HTML:
ESTILOS:


Hay componentes muy simples, cuyos estados son del tipo: 
- valorInicial XDDDDDD (en un tutorial de YOTUBE tenemos huevón de estos componentes)

Hay componentes (la mayoría/o muchos en proyectos reales) cuyo estado es más complejo y depende de múltiples factores, no solo de un valor inicial. Pero no solo depende de muchosfactores... Los CAMBIOS en el estado deben estar muy controlados... Y tienen EFECTOS colaterales que debemos gestionar cuidadosamente.

Por ejemplo:
Componente Listado de Eventos:
- Estado: Esperando datos
          Datos cargados correctamente
          Error al cargar los datos
          Actualizando datos

De datos cargados correctamente puedo ir a Error al cargar los datos? NO

Esperando Datos -> Datos cargados correctamente <> Actualizando datos
                            v??? EIN!                   |
                -> Error al cargar los datos    <-------+

Restricciones en cuanto a COMO PUEDEN IR EVOLUCIONANDO LOS VALORES DEL ESTADO
Pero esto ya lo hemos visto además... Nos pasó en REDUX... que también gestiona ESTADOS.
    SOLICITUD_DE_DATOS :
        Estado: Esperando datos      EFECTOS EN EL ESTADO (El estado no es una variable... son 17 cada una con sus valores) Y restricciones en cuanto a cómo pueden evolucionar los valores de cada variable
        Total: ~
        Pagina: ~
        Datos: ~

AQUI TIRAMOS MUCHO DE MAQUINAS DE ESTADO.
De alguna forma es lo que nos dan los REDUCERS en Redux.
Un reducer es una base de lo que es trabajar con máquinas de estados.

    HTML
    CSS
    TS              
    STATE.TS

Si no trabajo con Máquinas de estado, en componentes grandes, acabo con ficheros TS de cientos de lineas llenos de variables booleanas con 500 ifs repartidos por el código.
## Luego lo escribo en la librería de marras!



ESTADO

- status: 'esperando_datos' | 'datos_cargados' | 'error'
- datos: any[]
- error: string | null

TRANSICIONES (status)

- 'esperando_datos' -> 'datos_cargados' | 'error'
- 'error' -> 'esperando_datos'

esperando_datos -> 'datos_cargados' : TransiciónDatosRecibidos 
GUARDA: dato != null
EFECTO: error = null

esperando_datos -> 'error' : TransiciónError
GUARDA: error != null
EFECTO: datos = null

reintentar:
error -> 'esperando_datos' : TransiciónReintentar
EFECTO: error = null
        datos = null

Montaremos una función SWITCH que gestione las transiciones de estado según el valor de `status` <- ENUM    

Esa es la forma de plantearlo
