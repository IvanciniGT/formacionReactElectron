using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Constantes;
using Apuestas.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Apuestas.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NombreTipoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.NombreTipo.LongitudMaxima) { MinimumLength = Limites.NombreTipo.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud });
