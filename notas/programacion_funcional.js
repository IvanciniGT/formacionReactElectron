

function generar_saludo_informal(nombre) {
    return `Hola, ${nombre}! ¿Qué tal?`;
}

function generar_saludo_formal(nombre) {
    return `Buenos días, ${nombre}. Es un placer saludarle.`;
}


function saluda(nombre) {                // Programación procedural
    console.log(`Hola, ${nombre}`);
}

saluda('Menchu');

miVariable = saluda;                    // Programación funcional
miVariable('Federico'); 

function multiplicar(numero, multiplicador) {
    return numero * multiplicador;
}

function operar(operando1, operando2, operacion) {
    return operacion(operando1, operando2);
}

function multiplicar(a,b) {
    return a * b;
}

function elevar(base, exponente) {
    return Math.pow(base, exponente);
}

console.log(
    multiplicar(5, 3)
);

console.log(
    operar(5, 3, multiplicar)
);

console.log(
    operar(2, 3, elevar)
);


function imprimir_saludo(nombre, function_generadora_de_saludos) {
    console.log(function_generadora_de_saludos(nombre));
}

imprimir_saludo('Menchu', generar_saludo_informal);
imprimir_saludo('Federico', generar_saludo_formal);

// Una expresion lambda es una expresión, por ende un trozo de código que produce un valor, en concreto una referencia a una función ANONIMA creada / DEFINIDA dentro de la propia expresión.

// Expresión? Un trozo de código que produce un valor.

// FORMA TRADICIONAL DE DEFINIR UNA FUNCION
function generar_saludo_informal(nombre) {
    return `Hola, ${nombre}! ¿Qué tal?`;
}

// FORMA MODERNA DE DEFINIR UNA FUNCION (EXPRESION LAMBDA / FUNCION FLECHA)
(nombre) => {
   return  `Hola, ${nombre}! ¿Qué tal?`;
}

nombre => {
    return `Hola, ${nombre}! ¿Qué tal?`;
}

nombre => `Hola, ${nombre}! ¿Qué tal?`;


imprimir_saludo('Federico', generar_saludo_formal);
imprimir_saludo('Felipe', nombre => `Hola, ${nombre}! Qué pasa!` );
