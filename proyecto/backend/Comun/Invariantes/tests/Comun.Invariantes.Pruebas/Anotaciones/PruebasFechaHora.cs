using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasFechaHora
{
    private readonly FechaHoraAttribute anotacion = new();

    [Fact]
    public void Acepta_una_fecha_asignada() => EsValido(anotacion, new DateTime(2026, 10, 22, 21, 0, 0));

    [Fact]
    public void Es_obligatoria() => EsInvalido(anotacion, null);

    [Fact]
    public void Rechaza_fecha_sin_asignar()
    {
        EsInvalido(anotacion, default(DateTime));
        EsInvalido(anotacion, default(DateTimeOffset));
    }
}
