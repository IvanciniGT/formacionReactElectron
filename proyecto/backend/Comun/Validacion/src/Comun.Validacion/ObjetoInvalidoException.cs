using Comun.Validacion.Mensajes;

namespace Comun.Validacion;

public sealed class ObjetoInvalidoException(Type tipo, IReadOnlyList<ErrorValidacion> errores)
    : Exception(string.Format(MensajesValidacion.ObjetoInvalido, tipo.Name, string.Join(" ", errores.Select(e => e.Mensaje))))
{
    public Type Tipo { get; } = tipo;
    public IReadOnlyList<ErrorValidacion> Errores { get; } = errores;
}
