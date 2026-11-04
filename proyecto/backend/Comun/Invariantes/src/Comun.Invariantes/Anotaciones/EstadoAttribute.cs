using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Mensajes;
using Comun.Validacion.Anotaciones;

namespace Comun.Invariantes.Anotaciones;

// Genérica para que Invariantes no dependa de los enumerados del dominio:
// se usa como [Estado<EstadoApuesta>]. EnumDataType rechaza (EstadoApuesta)99,
// que el compilador deja pasar sin quejarse.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class EstadoAttribute<TEnum>() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new EnumDataTypeAttribute(typeof(TEnum)) { ErrorMessage = MensajesValidacion.EstadoInvalido })
    where TEnum : struct, Enum;
