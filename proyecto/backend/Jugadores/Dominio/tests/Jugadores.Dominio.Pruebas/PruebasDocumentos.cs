using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using static Jugadores.Dominio.Pruebas.Entorno;

namespace Jugadores.Dominio.Pruebas;

public class PruebasDocumentos
{
    [Fact]
    public void Un_documento_subido_queda_pendiente_con_la_fecha_del_reloj()
    {
        var jugador = UnJugador();

        var documento = jugador.SubirDocumento(TipoDocumento.Domicilio, "documentos/recibo.pdf", Reloj, Validador);

        Assert.Same(documento, Assert.Single(jugador.Documentos));
        Assert.Equal(EstadoDocumento.Pendiente, documento.Estado);
        Assert.Equal(TipoDocumento.Domicilio, documento.Tipo);
        Assert.Equal("documentos/recibo.pdf", documento.Referencia);
        Assert.Equal(Ahora, documento.SubidoEn);
        Assert.Null(documento.MotivoRechazo);
        Assert.NotEqual(Guid.Empty, documento.Id);
    }

    [Fact]
    public void Un_activo_puede_subir_mas_documentos()
    {
        var jugador = UnJugadorActivo();

        jugador.SubirDocumento(TipoDocumento.Domicilio, "documentos/recibo.pdf", Reloj, Validador);

        Assert.Equal(2, jugador.Documentos.Count);
    }

    [Fact]
    public void Sin_referencia_no_se_sube_nada()
    {
        var jugador = UnJugador();

        Assert.Throws<ObjetoInvalidoException>(() => jugador.SubirDocumento(TipoDocumento.Identidad, "", Reloj, Validador));
        Assert.Empty(jugador.Documentos);
    }

    [Fact]
    public void Un_bloqueado_no_puede_subir_documentos()
    {
        var jugador = UnJugadorBloqueado();

        Assert.Throws<TransicionNoPermitidaException>(() =>
            jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador));
        Assert.Empty(jugador.Documentos);
    }

    [Fact]
    public void Validar_la_identidad_activa_al_jugador()
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);

        jugador.ValidarDocumento(dni.Id);

        Assert.Equal(EstadoDocumento.Validado, dni.Estado);
        Assert.Equal(EstadoJugador.Activo, jugador.Estado);
        Assert.True(jugador.TieneIdentidadValidada);
    }

    [Fact]
    public void Validar_el_domicilio_no_activa_al_jugador()
    {
        var jugador = UnJugador();
        var recibo = jugador.SubirDocumento(TipoDocumento.Domicilio, "documentos/recibo.pdf", Reloj, Validador);

        jugador.ValidarDocumento(recibo.Id);

        Assert.Equal(EstadoDocumento.Validado, recibo.Estado);
        Assert.Equal(EstadoJugador.PendienteVerificacion, jugador.Estado);
        Assert.False(jugador.TieneIdentidadValidada);
    }

    [Fact]
    public void Una_identidad_rechazada_no_cuenta_como_validada()
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);

        jugador.RechazarDocumento(dni.Id, "Ilegible", Validador);

        Assert.False(jugador.TieneIdentidadValidada);
        Assert.Equal(EstadoJugador.PendienteVerificacion, jugador.Estado);
    }

    [Fact]
    public void Validar_la_identidad_de_un_bloqueado_no_lo_desbloquea()
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);
        jugador.Bloquear("Actividad sospechosa", Validador);

        jugador.ValidarDocumento(dni.Id);

        Assert.Equal(EstadoJugador.Bloqueado, jugador.Estado);
        Assert.True(jugador.TieneIdentidadValidada);
    }

    [Fact]
    public void Rechazar_guarda_el_motivo()
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);

        jugador.RechazarDocumento(dni.Id, "Ilegible", Validador);

        Assert.Equal(EstadoDocumento.Rechazado, dni.Estado);
        Assert.Equal("Ilegible", dni.MotivoRechazo);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Sin_motivo_no_se_rechaza_y_el_documento_sigue_pendiente(string? motivo)
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);

        Assert.Throws<ObjetoInvalidoException>(() => jugador.RechazarDocumento(dni.Id, motivo!, Validador));

        Assert.Equal(EstadoDocumento.Pendiente, dni.Estado);
        Assert.Null(dni.MotivoRechazo);
    }

    [Fact]
    public void Un_documento_revisado_no_se_vuelve_a_revisar()
    {
        var jugador = UnJugador();
        var validado = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);
        var rechazado = jugador.SubirDocumento(TipoDocumento.Domicilio, "documentos/recibo.pdf", Reloj, Validador);
        jugador.ValidarDocumento(validado.Id);
        jugador.RechazarDocumento(rechazado.Id, "Caducado", Validador);

        Assert.Throws<TransicionNoPermitidaException>(() => jugador.ValidarDocumento(validado.Id));
        Assert.Throws<TransicionNoPermitidaException>(() => jugador.RechazarDocumento(validado.Id, "Otro motivo", Validador));
        Assert.Throws<TransicionNoPermitidaException>(() => jugador.ValidarDocumento(rechazado.Id));
        Assert.Equal(EstadoDocumento.Validado, validado.Estado);
        Assert.Equal(EstadoDocumento.Rechazado, rechazado.Estado);
        Assert.Equal("Caducado", rechazado.MotivoRechazo);
    }

    [Fact]
    public void Un_documento_que_no_es_suyo_no_se_encuentra()
    {
        var jugador = UnJugador();
        var otro = UnJugador().SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);

        var error = Assert.Throws<DocumentoNoEncontradoException>(() => jugador.ValidarDocumento(otro.Id));
        Assert.Equal(otro.Id, error.DocumentoId);
        Assert.Throws<DocumentoNoEncontradoException>(() => jugador.RechazarDocumento(otro.Id, "Ilegible", Validador));
    }
}
