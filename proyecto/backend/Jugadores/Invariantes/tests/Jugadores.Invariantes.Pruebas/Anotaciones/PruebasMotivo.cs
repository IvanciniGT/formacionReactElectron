using Jugadores.Invariantes.Anotaciones;
using static Jugadores.Invariantes.Pruebas.Comprobar;

namespace Jugadores.Invariantes.Pruebas.Anotaciones;

public class PruebasMotivo
{
    private readonly MotivoAttribute anotacion = new();

    // Que haga falta depende del estado, y eso lo exige el dominio.
    [Fact]
    public void No_es_obligatorio() => EsValido(anotacion, null);

    [Fact]
    public void Admite_entre_3_y_500_caracteres()
    {
        EsInvalido(anotacion, "");
        EsInvalido(anotacion, "AB");
        EsValido(anotacion, "ABC");
        EsValido(anotacion, new string('a', 500));
        EsInvalido(anotacion, new string('a', 501));
    }

    [Fact]
    public void Tiene_que_decir_algo()
    {
        EsInvalido(anotacion, "   ");
        EsInvalido(anotacion, "\t\n ");
        EsValido(anotacion, "  Documento ilegible  ");
    }
}
