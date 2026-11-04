namespace Jugadores.Invariantes.Mensajes;

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
    public const string SinContenido = "El campo {0} no puede estar formado solo por espacios.";

    // Range pasa {1} = mínimo y {2} = máximo.
    public const string NoMenorQue = "El campo {0} no puede ser menor que {1}.";
}
