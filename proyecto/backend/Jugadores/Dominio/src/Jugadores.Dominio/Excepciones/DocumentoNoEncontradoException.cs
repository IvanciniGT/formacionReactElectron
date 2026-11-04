namespace Jugadores.Dominio.Excepciones;

public sealed class DocumentoNoEncontradoException(Guid documentoId)
    : InvalidOperationException(string.Format(MensajesDominio.DocumentoNoEncontrado, documentoId))
{
    public Guid DocumentoId { get; } = documentoId;
}
