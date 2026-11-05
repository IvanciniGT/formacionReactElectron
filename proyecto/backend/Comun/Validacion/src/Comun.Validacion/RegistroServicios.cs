using Comun.Validacion;
using Microsoft.Extensions.DependencyInjection.Extensions;

// En el espacio de nombres de IServiceCollection, como hace .NET con sus extensiones:
// quien configura el host la encuentra sin añadir ningún using.
namespace Microsoft.Extensions.DependencyInjection;

public static class RegistroServicios
{
    public static IServiceCollection AgregarValidacion(this IServiceCollection servicios)
    {
        // El reloj no se registra aquí: es decisión del host. Si registra un TimeProvider
        // (uno fijo en pruebas, por ejemplo) se usa; si no, el del sistema.
        servicios.TryAddSingleton<IValidador, ValidadorDataAnnotations>();
        return servicios;
    }
}
