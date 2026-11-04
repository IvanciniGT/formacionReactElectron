using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;
using Jugadores.Invariantes.Constantes;
using Jugadores.Invariantes.Mensajes;

namespace Jugadores.Invariantes.Anotaciones;

// El importe de un depósito o de una retirada.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class ImporteAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new MayorQueAttribute(Limites.Importe.MayorQue),
    new MaximoDecimalesAttribute(Limites.Importe.Decimales));
