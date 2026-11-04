using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;

namespace Comun.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class FechaHoraAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new NoPorDefectoAttribute());
