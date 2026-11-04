using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Constantes;
using Comun.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Comun.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class EmailAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.Email.LongitudMaxima) { ErrorMessage = MensajesValidacion.LongitudMaxima },
    new EmailAddressAttribute { ErrorMessage = MensajesValidacion.EmailInvalido });
