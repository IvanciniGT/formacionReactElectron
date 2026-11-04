using Comun.Invariantes.Anotaciones;
using Comun.Validacion;
using Jugadores.Invariantes.Anotaciones;

namespace Jugadores.Dominio;

// Un apunte de la cuenta. No cambia nunca: la regulación exige poder auditar cada uno.
public sealed class Movimiento
{
    [Estado<TipoMovimiento>] public TipoMovimiento Tipo { get; }
    [Importe] public decimal Importe { get; }
    [FechaHora] public DateTimeOffset Fecha { get; }

    private Movimiento(TipoMovimiento tipo, decimal importe, DateTimeOffset fecha)
    {
        Tipo = tipo;
        Importe = importe;
        Fecha = fecha;
    }

    internal static Movimiento Registrar(TipoMovimiento tipo, decimal importe, TimeProvider reloj, IValidador validador)
    {
        var movimiento = new Movimiento(tipo, importe, reloj.GetUtcNow());
        validador.ExigirValido(movimiento);
        return movimiento;
    }
}
