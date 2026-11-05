using Comun.Validacion.Validadores;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Validadores;

// "Hoy" es el 15/03/2040 (ver Comprobar.Hoy).
public class PruebasEdadEntre
{
    private readonly EdadEntreAttribute validador = new(18, 120);

    [Fact]
    public void Acepta_nulo() => EsValido(validador, null);

    [Fact]
    public void Incluye_el_minimo_el_dia_del_cumpleanos() => EsValido(validador, new DateOnly(2022, 3, 15));

    [Fact]
    public void Rechaza_un_dia_antes_del_cumpleanos() => EsInvalido(validador, new DateOnly(2022, 3, 16));

    [Fact]
    public void Incluye_el_maximo() => EsValido(validador, new DateOnly(1920, 3, 15));

    [Fact]
    public void Rechaza_por_encima_del_maximo() => EsInvalido(validador, new DateOnly(1919, 3, 15));

    [Fact]
    public void Acepta_DateTime_y_DateTimeOffset()
    {
        EsValido(validador, new DateTime(1990, 5, 1));
        EsValido(validador, new DateTimeOffset(1990, 5, 1, 0, 0, 0, TimeSpan.Zero));
    }

    [Fact]
    public void Rechaza_lo_que_no_es_una_fecha() => EsInvalido(validador, "1990-05-01");

    [Fact]
    public void El_mensaje_indica_el_rango() =>
        Assert.Equal("El campo Campo debe corresponder a una edad entre 18 y 120 años.",
            Mensaje(validador, new DateOnly(2039, 1, 1)));

    // Las fechas están elegidas para que el resultado no dependa del día en que se ejecute.
    [Fact]
    public void Sin_contexto_usa_el_reloj_del_sistema()
    {
        Assert.True(validador.IsValid(new DateOnly(1990, 1, 1)));
        Assert.False(validador.IsValid(DateOnly.FromDateTime(DateTime.Today)));
    }
}
