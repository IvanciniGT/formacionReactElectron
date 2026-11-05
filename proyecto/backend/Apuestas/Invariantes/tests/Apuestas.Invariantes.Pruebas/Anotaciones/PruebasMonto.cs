using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

public class PruebasMonto
{
    private readonly MontoAttribute anotacion = new();

    [Theory]
    [InlineData("0.01")]
    [InlineData("10.50")]
    [InlineData("1000000")] // sin tope: el máximo lo pone el servicio
    public void Acepta_montos_positivos(string monto) => EsValido(anotacion, Decimal(monto));

    [Fact]
    public void Es_obligatorio() => EsInvalido(anotacion, null);

    [Theory]
    [InlineData("0")]
    [InlineData("-5")]
    public void Rechaza_cero_y_negativos(string monto) => EsInvalido(anotacion, Decimal(monto));

    [Fact]
    public void Rechaza_mas_de_2_decimales() => EsInvalido(anotacion, Decimal("10.555"));
}
