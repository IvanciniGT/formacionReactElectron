using Comun.Validacion.Validadores;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Validadores;

public class PruebasMayorQue
{
    private readonly MayorQueAttribute validador = new(1m);

    [Fact]
    public void Acepta_nulo() => EsValido(validador, null);

    [Fact]
    public void Excluye_el_minimo() => EsInvalido(validador, 1m);

    [Fact]
    public void Rechaza_por_debajo() => EsInvalido(validador, 0.99m);

    [Fact]
    public void Acepta_por_encima_sin_maximo()
    {
        EsValido(validador, 1.01m);
        EsValido(validador, 1_000_000_000m);
    }

    [Fact]
    public void El_mensaje_indica_el_minimo() =>
        Assert.Equal("El campo Campo debe ser mayor que 1.", Mensaje(validador, 0m));
}
