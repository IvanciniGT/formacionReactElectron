using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Validadores;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class MaximoDecimalesAttribute(int maximo) : ValidationAttribute(MensajesValidacion.MaximoDecimales)
{
    public override string FormatErrorMessage(string name) =>
        string.Format(CultureInfo.CurrentCulture, ErrorMessageString, name, maximo);

    public override bool IsValid(object? valor) => valor switch
    {
        null => true,
        decimal d => decimal.Round(d, maximo) == d,
        _ => false,
    };
}
