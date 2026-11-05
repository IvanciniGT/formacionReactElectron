using Comun.Validacion.Validadores;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Validadores;

public class PruebasIdentificadorValido
{
    private readonly IdentificadorValidoAttribute validador = new();

    [Fact]
    public void Acepta_nulo() => EsValido(validador, null);

    [Fact]
    public void Acepta_un_guid() => EsValido(validador, Guid.NewGuid());

    [Fact]
    public void Rechaza_el_guid_vacio() => EsInvalido(validador, Guid.Empty);

    // Los ids numéricos son de la base de datos y no deben salir del repositorio.
    [Fact]
    public void Rechaza_lo_que_no_es_un_guid()
    {
        EsInvalido(validador, 5);
        EsInvalido(validador, 5L);
        EsInvalido(validador, "abc");
        EsInvalido(validador, "  ");
        EsInvalido(validador, Guid.NewGuid().ToString());
    }

    [Fact]
    public void Mensaje() => Assert.Equal("El campo Campo no es un identificador válido.", Comprobar.Mensaje(validador, 5));
}
