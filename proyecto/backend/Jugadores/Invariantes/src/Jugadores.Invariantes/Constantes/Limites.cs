using System.Diagnostics.CodeAnalysis;

namespace Jugadores.Invariantes.Constantes;

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
    public static class FechaNacimientoJugador
    {
        // En España no se puede apostar siendo menor de edad.
        public const int EdadMinima = 18;
        public const int EdadMaxima = 120;
    }

    public static class Importe
    {
        // Sin máximo: los límites de depósito y retirada los fija el operador en el servicio.
        public const decimal MayorQue = 0m;
        public const int Decimales = 2;
    }

    public static class Saldo
    {
        public const decimal Minimo = 0m;
        public const int Decimales = 2;
    }

    public static class Motivo
    {
        public const int LongitudMinima = 3;
        public const int LongitudMaxima = 500;
    }

    public static class ReferenciaDocumento
    {
        public const int LongitudMaxima = 500;
    }
}
