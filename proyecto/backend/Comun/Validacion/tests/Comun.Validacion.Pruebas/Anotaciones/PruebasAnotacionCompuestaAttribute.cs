using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Anotaciones;

public class PruebasAnotacionCompuestaAttribute
{
    // Una anotación de prueba hecha solo con piezas estándar: Comun no conoce las de ningún dominio.
    private sealed class CodigoAttribute() : AnotacionCompuestaAttribute(
        new RequiredAttribute { ErrorMessage = "{0}: obligatorio" },
        new RegularExpressionAttribute("^[A-Z]+$") { ErrorMessage = "{0}: solo mayúsculas" },
        new StringLengthAttribute(3) { ErrorMessage = "{0}: como máximo {1}" });

    private readonly CodigoAttribute anotacion = new();

    [Fact]
    public void Acepta_si_cumple_todas_las_piezas() => EsValido(anotacion, "ABC");

    [Fact]
    public void Falla_si_falla_cualquier_pieza()
    {
        EsInvalido(anotacion, null);
        EsInvalido(anotacion, "abc");
        EsInvalido(anotacion, "ABCD");
    }

    [Fact]
    public void Informa_del_primer_fallo_en_orden() =>
        // Falla el formato y también la longitud: debe decir lo primero.
        Assert.Equal("Campo: solo mayúsculas", Mensaje(anotacion, "abcd"));

    [Fact]
    public void Indica_el_campo_que_ha_fallado()
    {
        var resultado = Validar(anotacion, null);

        Assert.NotNull(resultado);
        Assert.Equal("Campo: obligatorio", resultado.ErrorMessage);
        Assert.Equal(["Campo"], resultado.MemberNames);
    }

    [Fact]
    public void Funciona_sin_contexto_de_validacion()
    {
        Assert.True(anotacion.IsValid("ABC"));
        Assert.False(anotacion.IsValid("abc"));
        Assert.False(anotacion.IsValid(null));
    }
}
