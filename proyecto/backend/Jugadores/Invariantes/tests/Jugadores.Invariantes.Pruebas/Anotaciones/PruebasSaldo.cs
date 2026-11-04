using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

public class PruebasSaldo
{
    private readonly SaldoAttribute anotacion = new();

    [Theory]
    [InlineData("0")] // una cuenta vacía es válida
    [InlineData("0.01")]
    [InlineData("1000000")]
    public void Acepta_cero_y_positivos(string saldo) => EsValido(anotacion, Decimal(saldo));

    [Fact]
    public void Es_obligatorio() => EsInvalido(anotacion, null);

    [Fact]
    public void Rechaza_negativos() => EsInvalido(anotacion, Decimal("-0.01"));

    [Fact]
    public void Rechaza_mas_de_2_decimales() => EsInvalido(anotacion, Decimal("10.555"));
}
