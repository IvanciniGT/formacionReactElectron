using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Constantes;
using Apuestas.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Apuestas.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class DescripcionAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.Descripcion.LongitudMaxima) { MinimumLength = Limites.Descripcion.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud });
