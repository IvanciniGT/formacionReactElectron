namespace Comun.Invariantes.Mensajes;

// Los mensajes por defecto de DataAnnotations salen en inglés.
// Ninguno lleva cifras escritas: {0} es el campo y {1}, {2}… los rellena cada
// atributo con sus propios valores, que salen de Constantes.Limites.
// Los de los validadores genéricos (edad, decimales, mayor que…) están en Comun.Validacion.
internal static class MensajesValidacion
{
    public const string Obligatorio = "El campo {0} es obligatorio.";

    // StringLength pasa {1} = máximo y {2} = mínimo.
    public const string Longitud = "El campo {0} debe tener entre {2} y {1} caracteres.";
    public const string LongitudMaxima = "El campo {0} admite como máximo {1} caracteres.";

    public const string SoloLetras = "El campo {0} solo admite letras, espacios, guiones y apóstrofos.";
    public const string EmailInvalido = "El campo {0} no es un email válido.";
    public const string EstadoInvalido = "El campo {0} no es un estado válido.";

    // {1} = dígitos del DNI, {2} = letras iniciales del NIE, {3} = dígitos del NIE.
    public const string FormatoDocumento = "El campo {0} debe ser un DNI ({1} dígitos y letra) o un NIE ({2}, {3} dígitos y letra), en mayúsculas.";
    public const string LetraControl = "La letra del {0} no corresponde a su número.";
}
