using Comun.Invariantes.Validadores;

namespace Comun.Invariantes.Pruebas.Validadores;

// El resto de su comportamiento se prueba a través de [DocumentoIdentidad].
public class PruebasLetraControl
{
    private readonly LetraControlAttribute validador = new();

    // La obligatoriedad la pone [Required] en la anotación compuesta.
    [Fact]
    public void Acepta_nulo() => Assert.True(validador.IsValid(null));

    [Fact]
    public void Rechaza_longitudes_incorrectas_y_lo_que_no_es_texto()
    {
        Assert.False(validador.IsValid("1234567Z"));
        Assert.False(validador.IsValid(12345678));
    }
}
