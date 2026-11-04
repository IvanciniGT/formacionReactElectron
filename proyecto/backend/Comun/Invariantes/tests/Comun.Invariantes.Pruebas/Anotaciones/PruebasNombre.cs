using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasNombre
{
    private readonly NombreAttribute anotacion = new();

    [Theory]
    [InlineData("Ana")]
    [InlineData("José María")]
    [InlineData("Ana-Belén")]
    [InlineData("O'Neill")]
    [InlineData("José")] // tilde como carácter combinado
    [InlineData("Lu")]
    public void Acepta_nombres_validos(string nombre) => EsValido(anotacion, nombre);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Es_obligatorio(string? nombre) => EsInvalido(anotacion, nombre);

    [Fact]
    public void Rechaza_una_sola_letra() => EsInvalido(anotacion, "A");

    [Fact]
    public void Admite_hasta_50_caracteres()
    {
        EsValido(anotacion, new string('a', 50));
        EsInvalido(anotacion, new string('a', 51));
    }

    [Theory]
    [InlineData("Jose2")]
    [InlineData("Ana  María")]
    [InlineData("-Ana")]
    [InlineData("Ana_María")]
    public void Solo_admite_letras_y_separadores_simples(string nombre) => EsInvalido(anotacion, nombre);
}
