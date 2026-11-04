using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasEmail
{
    private readonly EmailAttribute anotacion = new();

    [Fact]
    public void Acepta_un_email_valido() => EsValido(anotacion, "jm@ejemplo.es");

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Es_obligatorio(string? email) => EsInvalido(anotacion, email);

    [Theory]
    [InlineData("jm.ejemplo.es")]
    [InlineData("@ejemplo.es")]
    [InlineData("jm@")]
    public void Rechaza_lo_que_no_es_un_email(string email) => EsInvalido(anotacion, email);

    [Fact]
    public void Admite_hasta_254_caracteres()
    {
        const string dominio = "@ejemplo.es";
        EsValido(anotacion, new string('a', 254 - dominio.Length) + dominio);
        EsInvalido(anotacion, new string('a', 255 - dominio.Length) + dominio);
    }
}
