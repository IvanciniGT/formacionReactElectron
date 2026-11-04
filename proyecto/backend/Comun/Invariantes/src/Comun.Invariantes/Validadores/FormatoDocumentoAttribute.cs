using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Comun.Invariantes.Constantes;
using Comun.Invariantes.Mensajes;

namespace Comun.Invariantes.Validadores;

// La validación es la de RegularExpression tal cual. Solo cambia el mensaje:
// el estándar únicamente rellena {1} con el patrón, y aquí hacen falta los dígitos y las letras.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class FormatoDocumentoAttribute : RegularExpressionAttribute
{
    public FormatoDocumentoAttribute() : base(Formatos.DocumentoIdentidad) =>
        ErrorMessage = MensajesValidacion.FormatoDocumento;

    public override string FormatErrorMessage(string name) => string.Format(
        CultureInfo.CurrentCulture,
        ErrorMessageString,
        name,
        Limites.DocumentoIdentidad.DigitosDni,
        LetrasLegibles(Limites.DocumentoIdentidad.LetrasNie),
        Limites.DocumentoIdentidad.DigitosNie);

    // "XYZ" → "X, Y o Z"
    private static string LetrasLegibles(string letras) =>
        string.Join(", ", letras[..^1].ToCharArray()) + " o " + letras[^1];
}
