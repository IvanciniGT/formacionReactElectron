using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;

namespace Comun.Validacion.Pruebas;

// Se prueba como lo usará cualquier capa: registrando en el contenedor e inyectando IValidador.
public class PruebasValidador
{
    private static readonly DateTimeOffset Hoy = new(2040, 3, 15, 12, 0, 0, TimeSpan.Zero);

    private sealed class NombreAttribute() : AnotacionCompuestaAttribute(
        new RequiredAttribute { ErrorMessage = "{0}: obligatorio" },
        new RegularExpressionAttribute(@"^\p{L}{2,}$") { ErrorMessage = "{0}: solo letras, al menos dos" });

    private sealed class MayorDeEdadAttribute() : AnotacionCompuestaAttribute(
        new RequiredAttribute { ErrorMessage = "{0}: obligatoria" },
        new EdadEntreAttribute(18, 120));

    private sealed class Persona
    {
        [Nombre] public string? Nombre { get; init; }
        [MayorDeEdad] public DateOnly? FechaNacimiento { get; init; }
    }

    private static Persona Valida() => new() { Nombre = "Ana", FechaNacimiento = new DateOnly(1990, 1, 1) };

    private static IValidador Resolver(Action<IServiceCollection>? antes = null)
    {
        var servicios = new ServiceCollection();
        antes?.Invoke(servicios);
        servicios.AgregarValidacion();
        return servicios.BuildServiceProvider().GetRequiredService<IValidador>();
    }

    private static IValidador ConRelojFijo() =>
        Resolver(s => s.AddSingleton<TimeProvider>(new FakeTimeProvider(Hoy)));

    [Fact]
    public void Un_objeto_valido_no_tiene_errores() => Assert.Empty(ConRelojFijo().Validar(Valida()));

    [Fact]
    public void Devuelve_campo_y_mensaje_de_cada_error()
    {
        var persona = new Persona { Nombre = "A1", FechaNacimiento = null };

        Assert.Equal(
            [
                new ErrorValidacion("Nombre", "Nombre: solo letras, al menos dos"),
                new ErrorValidacion("FechaNacimiento", "FechaNacimiento: obligatoria"),
            ],
            ConRelojFijo().Validar(persona));
    }

    [Fact]
    public void Valida_todas_las_anotaciones_no_solo_las_Required()
    {
        // Ningún campo es nulo: con validateAllProperties: false, Validator daría esto por bueno.
        var persona = new Persona { Nombre = "A", FechaNacimiento = new DateOnly(1990, 1, 1) };

        Assert.Single(ConRelojFijo().Validar(persona));
    }

    [Fact]
    public void Usa_el_reloj_registrado_en_el_contenedor()
    {
        // Cumple 18 el 15/03/2040 según el reloj fijo; con el reloj del sistema no tendría edad.
        var persona = new Persona { Nombre = "Ana", FechaNacimiento = new DateOnly(2022, 3, 15) };

        Assert.Empty(ConRelojFijo().Validar(persona));
    }

    [Fact]
    public void Sin_reloj_registrado_usa_el_del_sistema()
    {
        var persona = new Persona { Nombre = "Ana", FechaNacimiento = DateOnly.FromDateTime(DateTime.Today) };

        Assert.Single(Resolver().Validar(persona));
    }

    [Fact]
    public void ExigirValido_no_hace_nada_si_es_valido()
    {
        var excepcion = Record.Exception(() => ConRelojFijo().ExigirValido(Valida()));

        Assert.Null(excepcion);
    }

    [Fact]
    public void ExigirValido_lanza_con_un_solo_error()
    {
        var persona = new Persona { Nombre = "A", FechaNacimiento = new DateOnly(1990, 1, 1) };

        var excepcion = Assert.Throws<ObjetoInvalidoException>(() => ConRelojFijo().ExigirValido(persona));

        Assert.Single(excepcion.Errores);
    }

    [Fact]
    public void ExigirValido_lanza_con_todos_los_errores()
    {
        var persona = new Persona { Nombre = "A1", FechaNacimiento = null };

        var excepcion = Assert.Throws<ObjetoInvalidoException>(() => ConRelojFijo().ExigirValido(persona));

        Assert.Equal(typeof(Persona), excepcion.Tipo);
        Assert.Equal(2, excepcion.Errores.Count);
        Assert.Equal("Persona no es válido. Nombre: solo letras, al menos dos FechaNacimiento: obligatoria", excepcion.Message);
    }

    // Las reglas que cruzan varios campos las escribe la propia clase con IValidatableObject.
    // Validator las ejecuta después de las anotaciones, y pueden no indicar campo.
    private sealed class Seleccion : IValidatableObject
    {
        [Nombre] public string? Nombre { get; init; }
        public bool Cerrada { get; init; }
        public bool Liquidada { get; init; }

        public IEnumerable<ValidationResult> Validate(ValidationContext contexto)
        {
            if (Liquidada && !Cerrada)
                yield return new ValidationResult("No se puede liquidar una selección abierta.");
            if (Nombre == "Vacio")
                yield return new ValidationResult(null, [nameof(Nombre)]);
        }
    }

    [Fact]
    public void Incluye_las_reglas_de_la_propia_clase() =>
        Assert.Equal(
            [new ErrorValidacion("", "No se puede liquidar una selección abierta.")],
            ConRelojFijo().Validar(new Seleccion { Nombre = "Final", Liquidada = true }));

    [Fact]
    public void Un_error_sin_mensaje_llega_con_mensaje_vacio() =>
        Assert.Equal([new ErrorValidacion("Nombre", "")], ConRelojFijo().Validar(new Seleccion { Nombre = "Vacio" }));

    [Fact]
    public void Rechaza_validar_nulo() =>
        Assert.Throws<ArgumentNullException>(() => ConRelojFijo().Validar(null!));

    [Fact]
    public void Se_registra_una_sola_vez_aunque_se_llame_dos_veces()
    {
        var servicios = new ServiceCollection();
        servicios.AgregarValidacion().AgregarValidacion();

        Assert.Single(servicios, d => d.ServiceType == typeof(IValidador));
    }
}
