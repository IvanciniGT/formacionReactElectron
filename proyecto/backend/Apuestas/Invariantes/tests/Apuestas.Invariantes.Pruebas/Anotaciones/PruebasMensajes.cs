using System.ComponentModel.DataAnnotations;
using Apuestas.Invariantes.Anotaciones;
using static Apuestas.Invariantes.Pruebas.Comprobar;

namespace Apuestas.Invariantes.Pruebas.Anotaciones;

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
        Assert.Equal("El campo Campo debe tener entre 3 y 100 caracteres.", Mensaje(new NombreEventoAttribute(), "AB"));

    [Fact]
    public void Cuota_indica_el_minimo_excluido() =>
        Assert.Equal("El campo Campo debe ser mayor que 1.", Mensaje(new CuotaAttribute(), 1m));

    [Fact]
    public void Monto_indica_el_minimo_excluido() =>
        Assert.Equal("El campo Campo debe ser mayor que 0.", Mensaje(new MontoAttribute(), 0m));

    [Fact]
    public void Decimales_indica_el_maximo() =>
        Assert.Equal("El campo Campo admite como máximo 2 decimales.", Mensaje(new MontoAttribute(), 1.555m));
}
