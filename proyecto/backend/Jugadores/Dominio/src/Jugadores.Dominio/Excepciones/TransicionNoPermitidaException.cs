namespace Jugadores.Dominio.Excepciones;

// La acción no vale en el estado en el que está el jugador o el documento.
public sealed class TransicionNoPermitidaException(string mensaje) : InvalidOperationException(mensaje);
