using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Constantes;
using Apuestas.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;

namespace Apuestas.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class MontoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new MayorQueAttribute(Limites.Monto.MayorQue),
    new MaximoDecimalesAttribute(Limites.Monto.Decimales));
