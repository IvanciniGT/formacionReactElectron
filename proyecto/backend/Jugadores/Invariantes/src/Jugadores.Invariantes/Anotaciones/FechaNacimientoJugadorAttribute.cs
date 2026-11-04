using System.ComponentModel.DataAnnotations;
using Jugadores.Invariantes.Constantes;
using Jugadores.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;

namespace Jugadores.Invariantes.Anotaciones;

// Quien apuesta tiene que ser mayor de edad: es una regla del jugador, no de cualquier
// fecha de nacimiento. La de un operador, por ejemplo, tendría otra.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class FechaNacimientoJugadorAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new EdadEntreAttribute(Limites.FechaNacimientoJugador.EdadMinima, Limites.FechaNacimientoJugador.EdadMaxima));
