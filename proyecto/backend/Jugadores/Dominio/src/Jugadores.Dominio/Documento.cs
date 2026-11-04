using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Anotaciones;
using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using Jugadores.Invariantes.Anotaciones;

namespace Jugadores.Dominio;

// Parte del agregado Jugador: se sube, se valida y se rechaza solo a través de él.
public sealed class Documento : IValidatableObject
{
    [Identificador] public Guid Id { get; }
    [Estado<TipoDocumento>] public TipoDocumento Tipo { get; }
    [ReferenciaDocumento] public string Referencia { get; }
    [FechaHora] public DateTimeOffset SubidoEn { get; }
    [Estado<EstadoDocumento>] public EstadoDocumento Estado { get; private set; }
    [Motivo] public string? MotivoRechazo { get; private set; }

    private Documento(TipoDocumento tipo, string referencia, DateTimeOffset subidoEn)
    {
        Id = Guid.NewGuid();
        Tipo = tipo;
        Referencia = referencia;
        SubidoEn = subidoEn;
        Estado = EstadoDocumento.Pendiente;
    }

    internal static Documento Subir(TipoDocumento tipo, string referencia, TimeProvider reloj, IValidador validador)
    {
        var documento = new Documento(tipo, referencia, reloj.GetUtcNow());
        validador.ExigirValido(documento);
        return documento;
    }

    // Validado y Rechazado son finales: un documento revisado no vuelve a revisarse.
    // Si hace falta otro, el jugador sube uno nuevo.
    internal void Validar()
    {
        ExigirPendiente("validar");
        Estado = EstadoDocumento.Validado;
    }

    internal void Rechazar(string motivo, IValidador validador)
    {
        ExigirPendiente("rechazar");
        Estado = EstadoDocumento.Rechazado;
        MotivoRechazo = motivo;
        try
        {
            validador.ExigirValido(this);
        }
        catch
        {
            Estado = EstadoDocumento.Pendiente;
            MotivoRechazo = null;
            throw;
        }
    }

    private void ExigirPendiente(string accion)
    {
        if (Estado != EstadoDocumento.Pendiente)
            throw new TransicionNoPermitidaException(string.Format(MensajesDominio.TransicionDocumento, accion, Estado));
    }

    // Rechazado y motivo van siempre juntos: un rechazo sin motivo no se le puede explicar al jugador.
    public IEnumerable<ValidationResult> Validate(ValidationContext contexto)
    {
        if ((Estado == EstadoDocumento.Rechazado) != (MotivoRechazo is not null))
            yield return new ValidationResult(MensajesDominio.MotivoRechazo, [nameof(MotivoRechazo)]);
    }
}
