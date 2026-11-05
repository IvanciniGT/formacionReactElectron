using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

public class PruebasCuota
{
    private readonly CuotaAttribute anotacion = new();

    [Theory]
    [InlineData("1.01")]
    [InlineData("1.85")]
    [InlineData("5000")] // sin tope: el máximo lo pone el servicio
    public void Acepta_cuotas_mayores_que_1(string cuota) => EsValido(anotacion, Decimal(cuota));

    [Fact]
    public void Es_obligatoria() => EsInvalido(anotacion, null);

    [Theory]
    [InlineData("1")]
    [InlineData("0.5")]
    [InlineData("0")]
    [InlineData("-2")]
    public void Rechaza_cuotas_de_1_o_menos(string cuota) => EsInvalido(anotacion, Decimal(cuota));

    [Fact]
    public void Rechaza_mas_de_2_decimales() => EsInvalido(anotacion, Decimal("1.855"));
}
