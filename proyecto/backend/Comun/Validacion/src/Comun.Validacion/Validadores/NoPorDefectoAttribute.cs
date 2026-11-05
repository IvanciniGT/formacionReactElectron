using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Validadores;

// [Required] no detecta un DateTime sin asignar: no es nulo, es 01/01/0001.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NoPorDefectoAttribute() : ValidationAttribute(MensajesValidacion.SinValor)
{
    public override bool IsValid(object? valor) =>
        valor is null || !valor.GetType().IsValueType || !valor.Equals(Activator.CreateInstance(valor.GetType()));
}
