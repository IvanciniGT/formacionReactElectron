using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using Jugadores.Invariantes.Constantes;
using Jugadores.Invariantes.Mensajes;

namespace Jugadores.Invariantes.Anotaciones;

// Dónde está guardado el fichero del documento (una ruta o una clave de almacenamiento).
// El fichero no viaja por el dominio: solo su referencia.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class ReferenciaDocumentoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new StringLengthAttribute(Limites.ReferenciaDocumento.LongitudMaxima) { ErrorMessage = MensajesValidacion.LongitudMaxima });
