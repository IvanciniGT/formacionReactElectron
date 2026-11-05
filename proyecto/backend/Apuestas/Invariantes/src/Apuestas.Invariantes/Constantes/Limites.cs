using System.Diagnostics.CodeAnalysis;

namespace Apuestas.Invariantes.Constantes;

// La especificación de cada campo, en un solo sitio. Las anotaciones y sus mensajes
// leen de aquí: cambiar un número basta para que cambien la validación y el texto.
// Las pruebas NO deben leer de aquí: llevan los valores escritos a mano, porque son
// la especificación vista desde fuera y tienen que cazar un cambio hecho por error.
//
// Fuera de la cobertura: un const decimal se compila como un campo que inicializa un
// constructor estático, y ese constructor no llega a ejecutarse nunca porque quien usa
// la constante recibe el valor ya copiado. Aquí no hay lógica que probar.
[ExcludeFromCodeCoverage]
public static class Limites
{
    public static class Cuota
    {
        // Una cuota de 1,00 o menos no paga nada. Sin máximo: lo decide el operador en el servicio.
        public const decimal MayorQue = 1m;
        public const int Decimales = 2;
    }

    public static class Monto
    {
        // Sin máximo: el tope de apuesta lo fija el operador y se comprueba en el servicio.
        public const decimal MayorQue = 0m;
        public const int Decimales = 2;
    }

    public static class NombreEvento
    {
        public const int LongitudMinima = 3;
        public const int LongitudMaxima = 100;
    }

    public static class NombreTipo
    {
        public const int LongitudMinima = 2;
        public const int LongitudMaxima = 50;
    }

    public static class Descripcion
    {
        public const int LongitudMinima = 3;
        public const int LongitudMaxima = 500;
    }
}
