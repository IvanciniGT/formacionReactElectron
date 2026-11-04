using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;
using Jugadores.Invariantes.Constantes;
using Jugadores.Invariantes.Mensajes;

namespace Jugadores.Invariantes.Anotaciones;

// El cero sí vale: a diferencia de un importe, una cuenta puede estar vacía.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class SaldoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new RangeAttribute(
        typeof(decimal),
        Limites.Saldo.Minimo.ToString(CultureInfo.InvariantCulture),
        decimal.MaxValue.ToString(CultureInfo.InvariantCulture))
    {
        ParseLimitsInInvariantCulture = true,
        ConvertValueInInvariantCulture = true,
        ErrorMessage = MensajesValidacion.NoMenorQue,
    },
    new MaximoDecimalesAttribute(Limites.Saldo.Decimales));
