using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasDocumentoIdentidad
{
    private readonly DocumentoIdentidadAttribute anotacion = new();

    [Theory]
    [InlineData("12345678Z")]
    [InlineData("00000000T")]
    [InlineData("99999999R")]
    public void Acepta_dni_con_letra_correcta(string dni) => EsValido(anotacion, dni);

    [Theory]
    [InlineData("X1234567L")]
    [InlineData("Y1234567X")]
    [InlineData("Z1234567R")]
    public void Acepta_nie_con_letra_correcta(string nie) => EsValido(anotacion, nie);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Es_obligatorio(string? documento) => EsInvalido(anotacion, documento);

    [Theory]
    [InlineData("12345678A")]
    [InlineData("X1234567A")]
    // Mismo número y letra que un DNI válido: solo es correcto si X vale 0.
    [InlineData("Y1234567L")]
    public void Rechaza_letra_que_no_corresponde(string documento) => EsInvalido(anotacion, documento);

    [Fact]
    public void Informa_del_formato_antes_que_de_la_letra()
    {
        // En minúscula falla el formato, y también fallaría la letra: debe decir lo primero.
        var resultado = Validar(anotacion, "12345678z");

        Assert.NotNull(resultado);
        Assert.StartsWith("El campo Campo debe ser un DNI", resultado.ErrorMessage);
    }

    [Theory]
    [InlineData("12345678z")]
    [InlineData("1234567Z")]
    [InlineData("123456789Z")]
    [InlineData("W1234567L")]
    [InlineData("X12345678Z")]
    [InlineData("12345678 Z")]
    public void Rechaza_formato_incorrecto(string documento) => EsInvalido(anotacion, documento);
}
