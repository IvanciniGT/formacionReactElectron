using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasApellidos
{
    private readonly ApellidosAttribute anotacion = new();

    [Theory]
    [InlineData("Pérez")]
    [InlineData("Pérez-Llorente O'Neill")]
    [InlineData("de la Fuente")]
    public void Acepta_apellidos_validos(string apellidos) => EsValido(anotacion, apellidos);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Es_obligatorio(string? apellidos) => EsInvalido(anotacion, apellidos);

    [Fact]
    public void Rechaza_una_sola_letra() => EsInvalido(anotacion, "P");

    [Fact]
    public void Admite_hasta_100_caracteres()
    {
        EsValido(anotacion, new string('a', 100));
        EsInvalido(anotacion, new string('a', 101));
    }

    [Fact]
    public void Solo_admite_letras_y_separadores_simples() => EsInvalido(anotacion, "Pérez 2");
}
