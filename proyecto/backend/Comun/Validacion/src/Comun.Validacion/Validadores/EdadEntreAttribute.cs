using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Comun.Validacion.Mensajes;

namespace Comun.Validacion.Validadores;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class EdadEntreAttribute(int minima, int maxima) : ValidationAttribute(MensajesValidacion.EdadEntre)
{
    public override string FormatErrorMessage(string name) =>
        string.Format(CultureInfo.CurrentCulture, ErrorMessageString, name, minima, maxima);

    protected override ValidationResult? IsValid(object? valor, ValidationContext contexto)
    {
        if (valor is null)
            return ValidationResult.Success;

        DateOnly? fecha = valor switch
        {
            DateOnly d => d,
            DateTime dt => DateOnly.FromDateTime(dt),
            DateTimeOffset dto => DateOnly.FromDateTime(dto.Date),
            _ => null,
        };

        // El reloj se pide al contexto para que las pruebas puedan fijar qué día es hoy.
        // Sin él, la edad de una misma persona cambiaría según el día en que se ejecuten.
        var reloj = contexto?.GetService(typeof(TimeProvider)) as TimeProvider ?? TimeProvider.System;
        var hoy = DateOnly.FromDateTime(reloj.GetLocalNow().DateTime);

        if (fecha is { } nacimiento)
        {
            var edad = hoy.Year - nacimiento.Year;
            if (nacimiento > hoy.AddYears(-edad))
                edad--;
            if (edad >= minima && edad <= maxima)
                return ValidationResult.Success;
        }

        return new ValidationResult(
            FormatErrorMessage(contexto?.DisplayName ?? MensajesValidacion.CampoDesconocido),
            contexto?.MemberName is { } miembro ? [miembro] : null);
    }
}
