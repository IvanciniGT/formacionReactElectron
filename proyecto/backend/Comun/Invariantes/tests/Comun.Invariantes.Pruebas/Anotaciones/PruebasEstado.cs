using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasEstado
{
    private enum EstadoDePrueba { Abierta, Cerrada }

    private readonly EstadoAttribute<EstadoDePrueba> anotacion = new();

    [Fact]
    public void Acepta_estados_definidos()
    {
        EsValido(anotacion, EstadoDePrueba.Abierta);
        EsValido(anotacion, EstadoDePrueba.Cerrada);
    }

    [Fact]
    public void Es_obligatorio() => EsInvalido(anotacion, null);

    [Fact]
    public void Rechaza_valores_fuera_del_enumerado() => EsInvalido(anotacion, (EstadoDePrueba)99);
}
