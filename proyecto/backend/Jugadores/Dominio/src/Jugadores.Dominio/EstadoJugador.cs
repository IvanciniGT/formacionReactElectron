namespace Jugadores.Dominio;

public enum EstadoJugador
{
    // Recién registrado: hasta que se valide un documento de identidad no puede mover dinero.
    PendienteVerificacion,
    Activo,
    Bloqueado,
}
