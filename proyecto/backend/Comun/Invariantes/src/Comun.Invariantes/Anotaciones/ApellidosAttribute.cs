using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Constantes;
using Comun.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Comun.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class ApellidosAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.Apellidos.LongitudMaxima) { MinimumLength = Limites.Apellidos.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud },
    new RegularExpressionAttribute(Formatos.NombrePropio) { ErrorMessage = MensajesValidacion.SoloLetras });
