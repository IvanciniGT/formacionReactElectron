using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using Jugadores.Invariantes.Anotaciones;

namespace Jugadores.Dominio;

// Parte del agregado Jugador: solo cambia a través de él, que es quien sabe si el
// jugador puede mover dinero.
public sealed class Cuenta
{
    private readonly List<Movimiento> movimientos = [];

    // La lógica de Retirar ya impide un saldo negativo; la anotación lo deja dicho para
    // quien reconstruya una cuenta desde fuera (la persistencia, por ejemplo).
    [Saldo] public decimal Saldo { get; private set; }

    public IReadOnlyList<Movimiento> Movimientos => movimientos.AsReadOnly();

    internal void Depositar(decimal importe, TimeProvider reloj, IValidador validador)
    {
        var movimiento = Movimiento.Registrar(TipoMovimiento.Deposito, importe, reloj, validador);
        Saldo += importe;
        movimientos.Add(movimiento);
    }

    internal void Retirar(decimal importe, TimeProvider reloj, IValidador validador)
    {
        // Primero el importe: si no es válido da igual el saldo, y el mensaje dice lo que está mal.
        var movimiento = Movimiento.Registrar(TipoMovimiento.Retirada, importe, reloj, validador);
        if (importe > Saldo)
            throw new SaldoInsuficienteException(Saldo, importe);

        Saldo -= importe;
        movimientos.Add(movimiento);
    }
}
