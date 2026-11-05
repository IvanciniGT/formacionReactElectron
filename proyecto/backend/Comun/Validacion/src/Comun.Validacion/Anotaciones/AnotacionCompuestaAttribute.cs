using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Anotaciones;

// El sufijo Attribute es la convención de .NET para toda clase de atributo, también las
// abstractas: quien la herede ve por el nombre qué es.
//
// En C# no se puede anotar una anotación con otras (como en Java) y varias estándar
// están selladas (EmailAddress), así que no se pueden heredar. Cada anotación propia
// agrupa las estándar que necesita y las aplica en orden: el primer fallo es el que se informa.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public abstract class AnotacionCompuestaAttribute(params ValidationAttribute[] reglas) : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? valor, ValidationContext contexto)
    {
        // IsValid(object) llama aquí con contexto nulo, y GetValidationResult lo exige.
        if (contexto is null)
        {
            var fallida = reglas.FirstOrDefault(regla => !regla.IsValid(valor));
            return fallida is null
                ? ValidationResult.Success
                : new ValidationResult(fallida.FormatErrorMessage(MensajesValidacion.CampoDesconocido));
        }

        foreach (var regla in reglas)
        {
            var resultado = regla.GetValidationResult(valor, contexto);
            if (resultado != ValidationResult.Success)
                return resultado;
        }
        return ValidationResult.Success;
    }
}
