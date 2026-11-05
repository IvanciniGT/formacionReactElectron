using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

public class PruebasDescripcion
{
    private readonly DescripcionAttribute anotacion = new();

    [Fact]
    public void Acepta_una_descripcion_valida() => EsValido(anotacion, "Quién gana el partido");

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Es_obligatoria(string? descripcion) => EsInvalido(anotacion, descripcion);

    [Fact]
    public void Admite_entre_3_y_500_caracteres()
    {
        EsInvalido(anotacion, "AB");
        EsValido(anotacion, "ABC");
        EsValido(anotacion, new string('a', 500));
        EsInvalido(anotacion, new string('a', 501));
    }
}
