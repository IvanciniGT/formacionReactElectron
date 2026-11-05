using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

public class PruebasNombreEvento
{
    private readonly NombreEventoAttribute anotacion = new();

    [Theory]
    [InlineData("Madrid x Barça")]
    [InlineData("Final 2026 (vuelta)")]
    public void Acepta_cualquier_caracter(string nombre) => EsValido(anotacion, nombre);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Es_obligatorio(string? nombre) => EsInvalido(anotacion, nombre);

    [Fact]
    public void Admite_entre_3_y_100_caracteres()
    {
        EsInvalido(anotacion, "AB");
        EsValido(anotacion, "ABC");
        EsValido(anotacion, new string('a', 100));
        EsInvalido(anotacion, new string('a', 101));
    }
}
