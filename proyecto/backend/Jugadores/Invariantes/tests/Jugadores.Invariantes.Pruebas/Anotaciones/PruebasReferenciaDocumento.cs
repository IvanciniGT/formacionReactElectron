using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

public class PruebasReferenciaDocumento
{
    private readonly ReferenciaDocumentoAttribute anotacion = new();

    [Fact]
    public void Acepta_una_referencia() => EsValido(anotacion, "documentos/2026/10/dni-anverso.pdf");

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Es_obligatoria(string? referencia) => EsInvalido(anotacion, referencia);

    [Fact]
    public void Admite_hasta_500_caracteres()
    {
        EsValido(anotacion, new string('a', 500));
        EsInvalido(anotacion, new string('a', 501));
    }
}
