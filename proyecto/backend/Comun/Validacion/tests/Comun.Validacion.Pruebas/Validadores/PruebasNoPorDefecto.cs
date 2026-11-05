using Comun.Validacion.Validadores;
using static Comun.Validacion.Pruebas.Comprobar;

namespace Comun.Validacion.Pruebas.Validadores;

public class PruebasNoPorDefecto
{
    private readonly NoPorDefectoAttribute validador = new();

    [Fact]
    public void Acepta_nulo() => EsValido(validador, null);

    [Fact]
    public void Rechaza_el_valor_por_defecto_de_un_tipo_por_valor()
    {
        EsInvalido(validador, default(DateTime));
        EsInvalido(validador, default(DateTimeOffset));
        EsInvalido(validador, 0);
    }

    [Fact]
    public void Acepta_un_valor_asignado()
    {
        EsValido(validador, new DateTime(2026, 10, 22));
        EsValido(validador, 1);
    }

    [Fact]
    public void No_afecta_a_tipos_por_referencia() => EsValido(validador, "");

    [Fact]
    public void Mensaje() => Assert.Equal("El campo Campo no tiene valor asignado.", Comprobar.Mensaje(validador, 0));
}
