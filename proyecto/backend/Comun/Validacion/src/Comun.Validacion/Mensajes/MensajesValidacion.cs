namespace Comun.Validacion.Mensajes;

// Los mensajes por defecto de DataAnnotations salen en inglés.
// Ninguno lleva cifras escritas: {0} es el campo y {1}, {2}… los rellena cada
// validador con los valores que recibe.
internal static class MensajesValidacion
{
    // Range pasa {1} = mínimo y {2} = máximo.
    public const string MayorQue = "El campo {0} debe ser mayor que {1}.";

    // {1} = edad mínima, {2} = edad máxima.
    public const string EdadEntre = "El campo {0} debe corresponder a una edad entre {1} y {2} años.";

    // {1} = número de decimales.
    public const string MaximoDecimales = "El campo {0} admite como máximo {1} decimales.";

    public const string IdentificadorInvalido = "El campo {0} no es un identificador válido.";
    public const string SinValor = "El campo {0} no tiene valor asignado.";

    // {0} = tipo del objeto, {1} = los mensajes de cada error.
    public const string ObjetoInvalido = "{0} no es válido. {1}";

    // Nombre que se usa cuando se valida sin contexto y no se sabe qué campo es.
    public const string CampoDesconocido = "valor";
}
