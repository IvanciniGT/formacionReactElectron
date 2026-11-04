using Comun.Validacion;
using Jugadores.Dominio.Excepciones;
using static Jugadores.Dominio.Pruebas.Entorno;

namespace Jugadores.Dominio.Pruebas;

public class PruebasCuenta
{
    [Fact]
    public void Depositar_suma_al_saldo_y_apunta_el_movimiento()
    {
        var jugador = UnJugadorActivo();

        jugador.Depositar(50.25m, Reloj, Validador);

        Assert.Equal(50.25m, jugador.Cuenta.Saldo);
        var movimiento = Assert.Single(jugador.Cuenta.Movimientos);
        Assert.Equal(TipoMovimiento.Deposito, movimiento.Tipo);
        Assert.Equal(50.25m, movimiento.Importe);
        Assert.Equal(Ahora, movimiento.Fecha);
    }

    [Fact]
    public void Retirar_resta_del_saldo_y_apunta_el_movimiento()
    {
        var jugador = UnJugadorActivo();
        jugador.Depositar(100m, Reloj, Validador);

        jugador.Retirar(30m, Reloj, Validador);

        Assert.Equal(70m, jugador.Cuenta.Saldo);
        Assert.Equal([TipoMovimiento.Deposito, TipoMovimiento.Retirada], jugador.Cuenta.Movimientos.Select(m => m.Tipo));
    }

    [Fact]
    public void Se_puede_retirar_todo_el_saldo()
    {
        var jugador = UnJugadorActivo();
        jugador.Depositar(100m, Reloj, Validador);

        jugador.Retirar(100m, Reloj, Validador);

        Assert.Equal(0m, jugador.Cuenta.Saldo);
    }

    [Fact]
    public void No_se_retira_mas_del_saldo_y_la_cuenta_no_cambia()
    {
        var jugador = UnJugadorActivo();
        jugador.Depositar(100m, Reloj, Validador);

        var error = Assert.Throws<SaldoInsuficienteException>(() => jugador.Retirar(100.01m, Reloj, Validador));

        Assert.Equal(100m, error.Saldo);
        Assert.Equal(100.01m, error.Importe);
        Assert.Equal(100m, jugador.Cuenta.Saldo);
        Assert.Single(jugador.Cuenta.Movimientos);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-10")]
    [InlineData("10.555")]
    [InlineData("1000.555")] // no válido y además mayor que el saldo
    public void Un_importe_no_valido_no_mueve_dinero(string importe)
    {
        var jugador = UnJugadorActivo();
        jugador.Depositar(100m, Reloj, Validador);
        var valor = decimal.Parse(importe, System.Globalization.CultureInfo.InvariantCulture);

        Assert.Throws<ObjetoInvalidoException>(() => jugador.Depositar(valor, Reloj, Validador));
        // Aunque supere el saldo, lo que se informa es el importe: es lo que está mal.
        Assert.Throws<ObjetoInvalidoException>(() => jugador.Retirar(valor, Reloj, Validador));
        Assert.Equal(100m, jugador.Cuenta.Saldo);
        Assert.Single(jugador.Cuenta.Movimientos);
    }

    [Fact]
    public void Solo_un_activo_mueve_dinero()
    {
        foreach (var jugador in new[] { UnJugador(), UnJugadorBloqueado() })
        {
            Assert.Throws<TransicionNoPermitidaException>(() => jugador.Depositar(10m, Reloj, Validador));
            Assert.Throws<TransicionNoPermitidaException>(() => jugador.Retirar(10m, Reloj, Validador));
            Assert.Equal(0m, jugador.Cuenta.Saldo);
            Assert.Empty(jugador.Cuenta.Movimientos);
        }
    }

    [Fact]
    public void El_mensaje_de_saldo_insuficiente_da_las_dos_cantidades()
    {
        var jugador = UnJugadorActivo();

        var error = Assert.Throws<SaldoInsuficienteException>(() => jugador.Retirar(5m, Reloj, Validador));

        Assert.Equal($"Saldo insuficiente: hay {0m} y se intenta retirar {5m}.", error.Message);
    }
}
