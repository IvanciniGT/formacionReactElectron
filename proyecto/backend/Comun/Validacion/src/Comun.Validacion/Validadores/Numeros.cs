using System.Globalization;

namespace Comun.Validacion.Validadores;

internal static class Numeros
{
    // Range con decimal recibe los límites como texto; se escriben en cultura invariante
    // para que "1.5" no se lea como 15 en un equipo configurado en español.
    public static string Texto(decimal valor) => valor.ToString(CultureInfo.InvariantCulture);
}
