using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

// Los mensajes se rellenan con los valores de Constantes.Limites. Aquí van escritos a mano
// a propósito: si alguien cambia un límite por error, estas pruebas tienen que enterarse.
public class PruebasMensajes
{
    private static string Mensaje(ValidationAttribute anotacion, object? valor)
    {
        var resultado = Validar(anotacion, valor);
        Assert.NotNull(resultado);
        return resultado.ErrorMessage!;
    }

    [Fact]
    public void Longitud_indica_minimo_y_maximo() =>
        Assert.Equal("El campo Campo debe tener entre 2 y 50 caracteres.", Mensaje(new NombreAttribute(), "A"));

    [Fact]
    public void Email_indica_longitud_maxima() =>
        Assert.Equal("El campo Campo admite como máximo 254 caracteres.",
            Mensaje(new EmailAttribute(), new string('a', 250) + "@ejemplo.es"));

    [Fact]
    public void Documento_describe_dni_y_nie() =>
        Assert.Equal("El campo Campo debe ser un DNI (8 dígitos y letra) o un NIE (X, Y o Z, 7 dígitos y letra), en mayúsculas.",
            Mensaje(new DocumentoIdentidadAttribute(), "123"));

    [Fact]
    public void Letra_de_control() =>
        Assert.Equal("La letra del Campo no corresponde a su número.", Mensaje(new DocumentoIdentidadAttribute(), "12345678A"));
}
