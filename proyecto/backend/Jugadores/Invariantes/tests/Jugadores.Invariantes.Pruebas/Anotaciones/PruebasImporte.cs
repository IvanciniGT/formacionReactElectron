using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

public class PruebasImporte
{
    private readonly ImporteAttribute anotacion = new();

    [Theory]
    [InlineData("0.01")]
    [InlineData("50")]
    [InlineData("1000000")] // sin tope: el máximo lo pone el servicio
    public void Acepta_importes_positivos(string importe) => EsValido(anotacion, Decimal(importe));

    [Fact]
    public void Es_obligatorio() => EsInvalido(anotacion, null);

    [Theory]
    [InlineData("0")]
    [InlineData("-5")]
    public void Rechaza_cero_y_negativos(string importe) => EsInvalido(anotacion, Decimal(importe));

    [Fact]
    public void Rechaza_mas_de_2_decimales() => EsInvalido(anotacion, Decimal("10.555"));
}
