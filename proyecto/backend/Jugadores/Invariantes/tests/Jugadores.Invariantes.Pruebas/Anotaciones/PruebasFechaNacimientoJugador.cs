using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

// "Hoy" es el 15/03/2040 (ver Comprobar.Hoy).
public class PruebasFechaNacimientoJugador
{
    private readonly FechaNacimientoJugadorAttribute anotacion = new();

    [Fact]
    public void Es_obligatoria() => EsInvalido(anotacion, null);

    [Fact]
    public void Acepta_a_quien_cumple_18_hoy() => EsValido(anotacion, new DateOnly(2022, 3, 15));

    [Fact]
    public void Rechaza_a_quien_cumple_18_manana() => EsInvalido(anotacion, new DateOnly(2022, 3, 16));

    [Fact]
    public void Acepta_120_anos() => EsValido(anotacion, new DateOnly(1920, 3, 15));

    [Fact]
    public void Rechaza_mas_de_120_anos() => EsInvalido(anotacion, new DateOnly(1919, 3, 15));

    [Fact]
    public void Acepta_DateTime_y_DateTimeOffset()
    {
        EsValido(anotacion, new DateTime(1990, 5, 1));
        EsValido(anotacion, new DateTimeOffset(1990, 5, 1, 0, 0, 0, TimeSpan.Zero));
    }

    [Fact]
    public void Rechaza_lo_que_no_es_una_fecha() => EsInvalido(anotacion, "1990-05-01");
}
