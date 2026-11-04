namespace Comun.Invariantes.Constantes;

public static class Formatos
{
    // \p{M} recoge las tildes cuando llegan como carácter combinado (e + ´) en vez de precompuesto (é).
    public const string NombrePropio = @"^[\p{L}\p{M}]+([ '\-][\p{L}\p{M}]+)*$";

    public static readonly string DocumentoIdentidad =
        $@"^(\d{{{Limites.DocumentoIdentidad.DigitosDni}}}|[{Limites.DocumentoIdentidad.LetrasNie}]\d{{{Limites.DocumentoIdentidad.DigitosNie}}})[A-Z]$";
}
