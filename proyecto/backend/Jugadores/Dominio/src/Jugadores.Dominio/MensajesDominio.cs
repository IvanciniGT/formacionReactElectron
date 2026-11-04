namespace Jugadores.Dominio;

internal static class MensajesDominio
{
    // {0} = la acción, {1} = el estado en el que está.
    public const string TransicionJugador = "No se puede {0} un jugador en estado {1}.";
    public const string TransicionDocumento = "No se puede {0} un documento en estado {1}.";

    // {0} = el id del documento.
    public const string DocumentoNoEncontrado = "El jugador no tiene ningún documento {0}.";

    // {0} = saldo, {1} = importe que se intenta retirar.
    public const string SaldoInsuficiente = "Saldo insuficiente: hay {0} y se intenta retirar {1}.";

    public const string MotivoRechazo = "Un documento rechazado tiene que llevar motivo, y uno que no lo está no puede llevarlo.";
    public const string MotivoBloqueo = "Un jugador bloqueado tiene que llevar motivo, y uno que no lo está no puede llevarlo.";
}
