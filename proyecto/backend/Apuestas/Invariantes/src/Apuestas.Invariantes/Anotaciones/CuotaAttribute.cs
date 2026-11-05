using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Constantes;
using Apuestas.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;

namespace Apuestas.Invariantes.Anotaciones;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class CuotaAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new MayorQueAttribute(Limites.Cuota.MayorQue),
    new MaximoDecimalesAttribute(Limites.Cuota.Decimales));
