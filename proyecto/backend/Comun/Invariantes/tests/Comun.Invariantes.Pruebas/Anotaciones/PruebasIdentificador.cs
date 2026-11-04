using Comun.Invariantes.Anotaciones;
using static Comun.Invariantes.Pruebas.Comprobar;

namespace Comun.Invariantes.Pruebas.Anotaciones;

public class PruebasIdentificador
{
    private readonly IdentificadorAttribute anotacion = new();

    [Fact]
    public void Acepta_un_guid() => EsValido(anotacion, Guid.NewGuid());

    [Fact]
    public void Es_obligatorio() => EsInvalido(anotacion, null);

    [Fact]
    public void Rechaza_el_guid_vacio() => EsInvalido(anotacion, Guid.Empty);

    // Los ids numéricos son de la base de datos y no deben llegar al dominio.
    [Fact]
    public void Rechaza_lo_que_no_es_un_guid()
    {
        EsInvalido(anotacion, 5);
        EsInvalido(anotacion, 5L);
        EsInvalido(anotacion, "abc");
        EsInvalido(anotacion, Guid.NewGuid().ToString());
    }
}
