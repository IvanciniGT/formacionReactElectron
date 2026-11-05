using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Constantes;
using Apuestas.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Apuestas.Invariantes.Anotaciones;

// Sin restricción de caracteres: "Madrid x Barça", "Final 2026 (vuelta)".
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NombreEventoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.NombreEvento.LongitudMaxima) { MinimumLength = Limites.NombreEvento.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud });
