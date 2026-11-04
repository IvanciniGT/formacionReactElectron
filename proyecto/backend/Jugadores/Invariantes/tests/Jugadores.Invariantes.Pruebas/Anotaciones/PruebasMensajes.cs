using System.ComponentModel.DataAnnotations;
using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

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
    public void Edad_indica_el_rango() =>
        Assert.Equal("El campo Campo debe corresponder a una edad entre 18 y 120 años.",
            Mensaje(new FechaNacimientoJugadorAttribute(), new DateOnly(2039, 1, 1)));

    [Fact]
    public void Importe_indica_el_minimo_excluido() =>
        Assert.Equal("El campo Campo debe ser mayor que 0.", Mensaje(new ImporteAttribute(), 0m));

    [Fact]
    public void Saldo_indica_el_minimo() =>
        Assert.Equal("El campo Campo no puede ser menor que 0.", Mensaje(new SaldoAttribute(), -1m));

    [Fact]
    public void Motivo_indica_la_longitud() =>
        Assert.Equal("El campo Campo debe tener entre 3 y 500 caracteres.", Mensaje(new MotivoAttribute(), "AB"));

    [Fact]
    public void Referencia_indica_la_longitud_maxima() =>
        Assert.Equal("El campo Campo admite como máximo 500 caracteres.", Mensaje(new ReferenciaDocumentoAttribute(), new string('a', 501)));
}
