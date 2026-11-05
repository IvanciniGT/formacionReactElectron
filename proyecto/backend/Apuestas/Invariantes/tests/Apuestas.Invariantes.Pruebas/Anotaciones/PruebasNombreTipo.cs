using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

public class PruebasNombreTipo
{
    private readonly NombreTipoAttribute anotacion = new();

    [Fact]
    public void Acepta_un_nombre_valido() => EsValido(anotacion, "Fútbol");

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Es_obligatorio(string? nombre) => EsInvalido(anotacion, nombre);

    [Fact]
    public void Admite_entre_2_y_50_caracteres()
    {
        EsInvalido(anotacion, "F");
        EsValido(anotacion, "F1");
        EsValido(anotacion, new string('a', 50));
        EsInvalido(anotacion, new string('a', 51));
    }
}
