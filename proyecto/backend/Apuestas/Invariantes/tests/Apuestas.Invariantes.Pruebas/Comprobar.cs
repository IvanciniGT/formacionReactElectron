using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Time.Testing;

namespace Apuestas.Invariantes.Pruebas;

internal static class Comprobar
{
    // Fijo para que las pruebas de edad no dependan del día en que se ejecuten. Lejos de la
    // fecha real a propósito: si coincidiera, una regla que ignorase este reloj pasaría igual.
    public static readonly DateTimeOffset Hoy = new(2040, 3, 15, 12, 0, 0, TimeSpan.Zero);

    public static ValidationResult? Validar(ValidationAttribute anotacion, object? valor)
    {
        var servicios = new Servicios(new FakeTimeProvider(Hoy));
        var contexto = new ValidationContext(new object(), servicios, null) { MemberName = "Campo", DisplayName = "Campo" };
        return anotacion.GetValidationResult(valor, contexto);
    }

    public static void EsValido(ValidationAttribute anotacion, object? valor)
    {
        var resultado = Validar(anotacion, valor);
        Assert.True(resultado == ValidationResult.Success, $"Se esperaba válido «{valor}» y dio: {resultado?.ErrorMessage}");
    }

    public static void EsInvalido(ValidationAttribute anotacion, object? valor) =>
        Assert.True(Validar(anotacion, valor) != ValidationResult.Success, $"Se esperaba inválido «{valor}»");

    public static decimal Decimal(string valor) => decimal.Parse(valor, System.Globalization.CultureInfo.InvariantCulture);

    private sealed class Servicios(TimeProvider reloj) : IServiceProvider
    {
        public object? GetService(Type tipo) => tipo == typeof(TimeProvider) ? reloj : null;
    }
}
