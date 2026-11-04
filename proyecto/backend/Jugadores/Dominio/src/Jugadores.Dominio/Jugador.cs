using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Anotaciones;
using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using Jugadores.Invariantes.Anotaciones;

namespace Jugadores.Dominio;

// Raíz del agregado: los documentos y la cuenta solo cambian a través del jugador.
//
// No tiene constructor público: se crea con Registrar, que valida antes de devolverlo,
// así que no puede existir un Jugador inválido. Cada cambio valida el estado nuevo y,
// si no es válido, lo deshace antes de lanzar. El IValidador llega como parámetro porque
// la entidad la crea el código con new, no el contenedor: quien lo tiene inyectado es el
// servicio que la usa.
public sealed class Jugador : IValidatableObject
{
    private readonly List<Documento> documentos = [];

    [Identificador] public Guid Id { get; }
    [Nombre] public string Nombre { get; }
    [Apellidos] public string Apellidos { get; }
    [Email] public string Email { get; private set; }
    [DocumentoIdentidad] public string DocumentoIdentidad { get; }
    [FechaNacimientoJugador] public DateOnly FechaNacimiento { get; }
    [Estado<EstadoJugador>] public EstadoJugador Estado { get; private set; }
    [Motivo] public string? MotivoBloqueo { get; private set; }

    public IReadOnlyList<Documento> Documentos => documentos.AsReadOnly();
    public Cuenta Cuenta { get; } = new();

    public bool TieneIdentidadValidada =>
        documentos.Any(d => d.Tipo == TipoDocumento.Identidad && d.Estado == EstadoDocumento.Validado);

    private Jugador(string nombre, string apellidos, string email, string documentoIdentidad, DateOnly fechaNacimiento)
    {
        Id = Guid.NewGuid();
        Nombre = nombre;
        Apellidos = apellidos;
        Email = email;
        DocumentoIdentidad = documentoIdentidad;
        FechaNacimiento = fechaNacimiento;
        Estado = EstadoJugador.PendienteVerificacion;
    }

    /// <exception cref="ObjetoInvalidoException">Si algún dato no es válido.</exception>
    public static Jugador Registrar(
        string nombre, string apellidos, string email, string documentoIdentidad, DateOnly fechaNacimiento, IValidador validador)
    {
        var jugador = new Jugador(nombre, apellidos, email, documentoIdentidad, fechaNacimiento);
        validador.ExigirValido(jugador);
        return jugador;
    }

    public void CambiarEmail(string email, IValidador validador)
    {
        ExigirEstado("cambiar el email de", EstadoJugador.PendienteVerificacion, EstadoJugador.Activo);
        var anterior = Email;
        Email = email;
        ValidarODeshacer(validador, () => Email = anterior);
    }

    public Documento SubirDocumento(TipoDocumento tipo, string referencia, TimeProvider reloj, IValidador validador)
    {
        ExigirEstado("subir documentos de", EstadoJugador.PendienteVerificacion, EstadoJugador.Activo);
        var documento = Documento.Subir(tipo, referencia, reloj, validador);
        documentos.Add(documento);
        return documento;
    }

    // Lo valida un operador. Si es de identidad y el jugador estaba pendiente, queda activo.
    // Un jugador bloqueado sigue bloqueado: el bloqueo solo lo levanta Desbloquear.
    public void ValidarDocumento(Guid documentoId)
    {
        var documento = BuscarDocumento(documentoId);
        documento.Validar();
        if (documento.Tipo == TipoDocumento.Identidad && Estado == EstadoJugador.PendienteVerificacion)
            Estado = EstadoJugador.Activo;
    }

    public void RechazarDocumento(Guid documentoId, string motivo, IValidador validador) =>
        BuscarDocumento(documentoId).Rechazar(motivo, validador);

    public void Bloquear(string motivo, IValidador validador)
    {
        ExigirEstado("bloquear a", EstadoJugador.PendienteVerificacion, EstadoJugador.Activo);
        var anterior = Estado;
        Estado = EstadoJugador.Bloqueado;
        MotivoBloqueo = motivo;
        ValidarODeshacer(validador, () =>
        {
            Estado = anterior;
            MotivoBloqueo = null;
        });
    }

    // Vuelve al estado que le corresponde por su documentación, no necesariamente al de antes.
    public void Desbloquear()
    {
        ExigirEstado("desbloquear a", EstadoJugador.Bloqueado);
        Estado = TieneIdentidadValidada ? EstadoJugador.Activo : EstadoJugador.PendienteVerificacion;
        MotivoBloqueo = null;
    }

    public void Depositar(decimal importe, TimeProvider reloj, IValidador validador)
    {
        ExigirEstado("depositar en la cuenta de", EstadoJugador.Activo);
        Cuenta.Depositar(importe, reloj, validador);
    }

    /// <exception cref="SaldoInsuficienteException">Si el importe supera el saldo.</exception>
    public void Retirar(decimal importe, TimeProvider reloj, IValidador validador)
    {
        ExigirEstado("retirar de la cuenta de", EstadoJugador.Activo);
        Cuenta.Retirar(importe, reloj, validador);
    }

    private Documento BuscarDocumento(Guid documentoId) =>
        documentos.Find(d => d.Id == documentoId) ?? throw new DocumentoNoEncontradoException(documentoId);

    private void ExigirEstado(string accion, params EstadoJugador[] permitidos)
    {
        if (!permitidos.Contains(Estado))
            throw new TransicionNoPermitidaException(string.Format(MensajesDominio.TransicionJugador, accion, Estado));
    }

    private void ValidarODeshacer(IValidador validador, Action deshacer)
    {
        try
        {
            validador.ExigirValido(this);
        }
        catch
        {
            deshacer();
            throw;
        }
    }

    // Bloqueado y motivo van siempre juntos.
    public IEnumerable<ValidationResult> Validate(ValidationContext contexto)
    {
        if ((Estado == EstadoJugador.Bloqueado) != (MotivoBloqueo is not null))
            yield return new ValidationResult(MensajesDominio.MotivoBloqueo, [nameof(MotivoBloqueo)]);
    }
}
