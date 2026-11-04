using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using Jugadores.Invariantes.Constantes;
using Jugadores.Invariantes.Mensajes;

namespace Jugadores.Invariantes.Anotaciones;

// El motivo de un rechazo o de un bloqueo. No es obligatorio: que haga falta depende del
// estado (un documento rechazado, un jugador bloqueado), y eso lo exige el dominio.
// Si lo hay, tiene que decir algo.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class MotivoAttribute() : AnotacionCompuestaAttribute(
    new StringLengthAttribute(Limites.Motivo.LongitudMaxima) { MinimumLength = Limites.Motivo.LongitudMinima, ErrorMessage = MensajesValidacion.Longitud },
    // Tres espacios cumplen la longitud y no dicen nada.
    new RegularExpressionAttribute(@"^[\s\S]*\S[\s\S]*$") { ErrorMessage = MensajesValidacion.SinContenido });
