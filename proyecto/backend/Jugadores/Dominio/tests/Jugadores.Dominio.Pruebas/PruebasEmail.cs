using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using static Jugadores.Dominio.Pruebas.Entorno;

namespace Jugadores.Dominio.Pruebas;

public class PruebasEmail
{
    [Fact]
    public void Cambia_el_email()
    {
        var jugador = UnJugador();

        jugador.CambiarEmail("nueva@ejemplo.es", Validador);

        Assert.Equal("nueva@ejemplo.es", jugador.Email);
    }

    [Fact]
    public void Un_activo_tambien_puede_cambiarlo()
    {
        var jugador = UnJugadorActivo();

        jugador.CambiarEmail("nueva@ejemplo.es", Validador);

        Assert.Equal("nueva@ejemplo.es", jugador.Email);
    }

    [Fact]
    public void Si_no_es_valido_lanza_y_deja_el_anterior()
    {
        var jugador = UnJugador();

        Assert.Throws<ObjetoInvalidoException>(() => jugador.CambiarEmail("no-es-email", Validador));

        Assert.Equal("ana@ejemplo.es", jugador.Email);
    }

    [Fact]
    public void Un_bloqueado_no_puede_cambiarlo()
    {
        var jugador = UnJugadorBloqueado();

        Assert.Throws<TransicionNoPermitidaException>(() => jugador.CambiarEmail("nueva@ejemplo.es", Validador));
        Assert.Equal("ana@ejemplo.es", jugador.Email);
    }
}
