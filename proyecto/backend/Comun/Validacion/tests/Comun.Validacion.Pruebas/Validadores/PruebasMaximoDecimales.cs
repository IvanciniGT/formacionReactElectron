using Comun.Validacion.Validadores;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Validadores;

public class PruebasMaximoDecimales
{
    private readonly MaximoDecimalesAttribute validador = new(2);

    [Fact]
    public void Acepta_nulo() => EsValido(validador, null);

    [Fact]
    public void Acepta_hasta_el_maximo()
    {
        EsValido(validador, 10m);
        EsValido(validador, 10.5m);
        EsValido(validador, 10.55m);
        EsValido(validador, 10.500m); // el cero final no cuenta
    }

    [Fact]
    public void Rechaza_mas_decimales() => EsInvalido(validador, 10.501m);

    [Fact]
    public void Solo_admite_decimal() => EsInvalido(validador, 10.5); // double: no sirve para dinero

    [Fact]
    public void El_mensaje_indica_el_maximo() =>
        Assert.Equal("El campo Campo admite como máximo 2 decimales.", Mensaje(validador, 1.555m));
}
