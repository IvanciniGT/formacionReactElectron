using Comun.Validacion;
using static Jugadores.Dominio.Pruebas.Entorno;

namespace Jugadores.Dominio.Pruebas;

public class PruebasRegistro
{
    [Fact]
    public void Un_jugador_recien_registrado_esta_pendiente_sin_documentos_y_sin_saldo()
    {
        var jugador = UnJugador();

        Assert.Equal(EstadoJugador.PendienteVerificacion, jugador.Estado);
        Assert.NotEqual(Guid.Empty, jugador.Id);
        Assert.Empty(jugador.Documentos);
        Assert.Equal(0m, jugador.Cuenta.Saldo);
        Assert.Empty(jugador.Cuenta.Movimientos);
        Assert.Null(jugador.MotivoBloqueo);
        Assert.False(jugador.TieneIdentidadValidada);
    }

    [Fact]
    public void Cada_jugador_tiene_su_propio_id() => Assert.NotEqual(UnJugador().Id, UnJugador().Id);

    [Fact]
    public void Guarda_los_datos_con_los_que_se_registra()
    {
        var jugador = UnJugador();

        Assert.Equal("Ana", jugador.Nombre);
        Assert.Equal("Pérez Gómez", jugador.Apellidos);
        Assert.Equal("ana@ejemplo.es", jugador.Email);
        Assert.Equal("12345678Z", jugador.DocumentoIdentidad);
        Assert.Equal(new DateOnly(1990, 5, 1), jugador.FechaNacimiento);
    }

    // "Hoy" es el 15/03/2040: el reloj sale del validador, no del sistema.
    [Fact]
    public void Acepta_a_quien_cumple_18_hoy() =>
        Jugador.Registrar("Ana", "Pérez", "ana@ejemplo.es", "12345678Z", new DateOnly(2022, 3, 15), Validador);

    [Fact]
    public void No_se_puede_registrar_un_menor()
    {
        var error = Assert.Throws<ObjetoInvalidoException>(() =>
            Jugador.Registrar("Ana", "Pérez", "ana@ejemplo.es", "12345678Z", new DateOnly(2022, 3, 16), Validador));

        Assert.Equal("FechaNacimiento", Assert.Single(error.Errores).Campo);
    }

    [Fact]
    public void Informa_de_todos_los_datos_que_no_son_validos()
    {
        var error = Assert.Throws<ObjetoInvalidoException>(() =>
            Jugador.Registrar("A1", "", "no-es-email", "12345678A", new DateOnly(1990, 5, 1), Validador));

        Assert.Equal(["Nombre", "Apellidos", "Email", "DocumentoIdentidad"], error.Errores.Select(e => e.Campo));
    }
}
