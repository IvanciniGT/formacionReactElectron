using System.Globalization;

namespace Jugadores.Dominio.Excepciones;

public sealed class SaldoInsuficienteException(decimal saldo, decimal importe)
    : InvalidOperationException(string.Format(CultureInfo.CurrentCulture, MensajesDominio.SaldoInsuficiente, saldo, importe))
{
    public decimal Saldo { get; } = saldo;
    public decimal Importe { get; } = importe;
}
