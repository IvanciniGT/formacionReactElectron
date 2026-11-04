namespace Comun.Invariantes.Constantes;

// La especificación de cada campo, en un solo sitio. Las anotaciones y sus mensajes
// leen de aquí: cambiar un número basta para que cambien la validación y el texto.
// Las pruebas NO deben leer de aquí: llevan los valores escritos a mano, porque son
// la especificación vista desde fuera y tienen que cazar un cambio hecho por error.
public static class Limites
{
    public static class Nombre
    {
        public const int LongitudMinima = 2;
        public const int LongitudMaxima = 50;
    }

    public static class Apellidos
    {
        public const int LongitudMinima = 2;
        public const int LongitudMaxima = 100;
    }

    public static class Email
    {
        // El máximo que admite SMTP para una dirección completa (RFC 5321).
        public const int LongitudMaxima = 254;
    }

    public static class DocumentoIdentidad
    {
        public const int DigitosDni = 8;
        public const int DigitosNie = 7;

        // En el NIE, la posición de la letra inicial es el dígito al que sustituye: X = 0, Y = 1, Z = 2.
        public const string LetrasNie = "XYZ";
    }
}
