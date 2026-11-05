using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Validadores;

// El dominio solo expone identificadores Guid. Los numéricos que use la base de datos
// son cosa de la capa de repositorio y no salen de ella: aquí un número es un error.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class IdentificadorValidoAttribute() : ValidationAttribute(MensajesValidacion.IdentificadorInvalido)
{
    public override bool IsValid(object? valor) => valor switch
    {
        null => true,
        Guid g => g != Guid.Empty,
        _ => false,
    };
}
