using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Validadores;

// Range estándar con mínimo excluido y sin máximo. Range exige un máximo,
// así que se le da el mayor decimal posible.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class MayorQueAttribute : RangeAttribute
{
    public MayorQueAttribute(decimal minimo)
        : base(typeof(decimal), Numeros.Texto(minimo), Numeros.Texto(decimal.MaxValue))
    {
        MinimumIsExclusive = true;
        ParseLimitsInInvariantCulture = true;
        ConvertValueInInvariantCulture = true;
        ErrorMessage = MensajesValidacion.MayorQue;
    }
}
