using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using static Jugadores.Dominio.Pruebas.Entorno;

namespace Jugadores.Dominio.Pruebas;

public class PruebasBloqueo
{
    [Fact]
    public void Bloquear_guarda_el_motivo()
    {
        var jugador = UnJugadorActivo();

        jugador.Bloquear("Actividad sospechosa", Validador);

        Assert.Equal(EstadoJugador.Bloqueado, jugador.Estado);
        Assert.Equal("Actividad sospechosa", jugador.MotivoBloqueo);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Sin_motivo_no_se_bloquea_y_sigue_como_estaba(string? motivo)
    {
        var jugador = UnJugadorActivo();

        Assert.Throws<ObjetoInvalidoException>(() => jugador.Bloquear(motivo!, Validador));

        Assert.Equal(EstadoJugador.Activo, jugador.Estado);
        Assert.Null(jugador.MotivoBloqueo);
    }

    [Fact]
    public void No_se_bloquea_dos_veces()
    {
        var jugador = UnJugadorBloqueado();

        Assert.Throws<TransicionNoPermitidaException>(() => jugador.Bloquear("Otro motivo", Validador));
        Assert.Equal("Actividad sospechosa", jugador.MotivoBloqueo);
    }

    [Fact]
    public void Desbloquear_con_la_identidad_validada_lo_deja_activo()
    {
        var jugador = UnJugadorActivo();
        jugador.Bloquear("Actividad sospechosa", Validador);

        jugador.Desbloquear();

        Assert.Equal(EstadoJugador.Activo, jugador.Estado);
        Assert.Null(jugador.MotivoBloqueo);
    }

    [Fact]
    public void Desbloquear_sin_la_identidad_validada_lo_deja_pendiente()
    {
        var jugador = UnJugadorBloqueado();

        jugador.Desbloquear();

        Assert.Equal(EstadoJugador.PendienteVerificacion, jugador.Estado);
        Assert.Null(jugador.MotivoBloqueo);
    }

    [Fact]
    public void Solo_se_desbloquea_a_un_bloqueado()
    {
        Assert.Throws<TransicionNoPermitidaException>(() => UnJugador().Desbloquear());
        Assert.Throws<TransicionNoPermitidaException>(() => UnJugadorActivo().Desbloquear());
    }

    [Fact]
    public void El_mensaje_dice_la_accion_y_el_estado()
    {
        var error = Assert.Throws<TransicionNoPermitidaException>(() => UnJugador().Desbloquear());

        Assert.Equal("No se puede desbloquear a un jugador en estado PendienteVerificacion.", error.Message);
    }
}
