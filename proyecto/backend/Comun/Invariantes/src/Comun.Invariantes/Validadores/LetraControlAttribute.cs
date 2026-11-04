using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Constantes;
using Comun.Invariantes.Mensajes;

namespace Comun.Invariantes.Validadores;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class LetraControlAttribute() : ValidationAttribute(MensajesValidacion.LetraControl)
{
    // Es el algoritmo oficial, no un parámetro: no tiene sentido sacarlo a Limites.
    private const string Letras = "TRWAGMYFPDXBNJZSQVHLCKE";

    // Nulo es válido por convención de DataAnnotations: la obligatoriedad es cosa de [Required].
    public override bool IsValid(object? valor) => valor switch
    {
        null => true,
        string { Length: Limites.DocumentoIdentidad.DigitosDni + 1 } documento
            when int.TryParse(Numero(documento), out var numero) => Letras[numero % Letras.Length] == documento[^1],
        _ => false,
    };

    private static string Numero(string documento)
    {
        var posicion = Limites.DocumentoIdentidad.LetrasNie.IndexOf(documento[0]);
        return posicion < 0 ? documento[..^1] : posicion + documento[1..^1];
    }
}
