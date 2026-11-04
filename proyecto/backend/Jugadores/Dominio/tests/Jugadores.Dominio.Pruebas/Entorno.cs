using Comun.Validacion;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;

namespace Jugadores.Dominio.Pruebas;

// Lo que el servicio tendrá inyectado: el validador del contenedor y el reloj del host.
internal static class Entorno
{
    // Fijo y lejos de la fecha real: si coincidiera, algo que usara el reloj del sistema pasaría igual.
    public static readonly DateTimeOffset Ahora = new(2040, 3, 15, 12, 0, 0, TimeSpan.Zero);

    public static readonly FakeTimeProvider Reloj = new(Ahora);

    public static readonly IValidador Validador = new ServiceCollection()
        .AddSingleton<TimeProvider>(Reloj)
        .AgregarValidacion()
        .BuildServiceProvider()
        .GetRequiredService<IValidador>();

    public static Jugador UnJugador() =>
        Jugador.Registrar("Ana", "Pérez Gómez", "ana@ejemplo.es", "12345678Z", new DateOnly(1990, 5, 1), Validador);

    public static Jugador UnJugadorActivo()
    {
        var jugador = UnJugador();
        var dni = jugador.SubirDocumento(TipoDocumento.Identidad, "documentos/dni.pdf", Reloj, Validador);
        jugador.ValidarDocumento(dni.Id);
        return jugador;
    }

    public static Jugador UnJugadorBloqueado()
    {
        var jugador = UnJugador();
        jugador.Bloquear("Actividad sospechosa", Validador);
        return jugador;
    }
}
