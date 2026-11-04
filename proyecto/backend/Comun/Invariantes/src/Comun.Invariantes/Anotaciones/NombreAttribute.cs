using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Constantes;
using Comun.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Comun.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NombreAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.Nombre.LongitudMaxima) { MinimumLength = Limites.Nombre.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud },
    new RegularExpressionAttribute(Formatos.NombrePropio) { ErrorMessage = MensajesValidacion.SoloLetras });
