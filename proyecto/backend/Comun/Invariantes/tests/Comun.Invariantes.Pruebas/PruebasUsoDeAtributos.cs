using System.Reflection;
using Comun.Invariantes.Anotaciones;

namespace Comun.Invariantes.Pruebas;

public class PruebasUsoDeAtributos
{
    // Todos los atributos del componente, también los que se añadan en el futuro.
    public static TheoryData<Type> Atributos()
    {
        var datos = new TheoryData<Type>();
        foreach (var tipo in typeof(NombreAttribute).Assembly.GetTypes().Where(t => typeof(Attribute).IsAssignableFrom(t)))
            datos.Add(tipo);
        return datos;
    }

    // Se exige declarado en cada uno, no heredado de AnotacionCompuestaAttribute, para que
    // cambiar una base no cambie en silencio dónde se pueden usar.
    [Theory]
    [MemberData(nameof(Atributos))]
    public void Solo_se_pueden_poner_en_propiedades_campos_y_parametros(Type atributo)
    {
        var uso = atributo.GetCustomAttribute<AttributeUsageAttribute>(inherit: false);

        Assert.NotNull(uso);
        Assert.Equal(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, uso.ValidOn);
        Assert.False(uso.AllowMultiple);
    }
}
