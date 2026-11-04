using System.ComponentModel.DataAnnotations;
using Comun.Invariantes.Mensajes;
using Comun.Invariantes.Validadores;
using Comun.Validacion.Anotaciones;

namespace Comun.Invariantes.Anotaciones;

// DNI o NIE. El formato va antes que la letra para que el mensaje diga qué está mal.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class DocumentoIdentidadAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = MensajesValidacion.Obligatorio },
    new FormatoDocumentoAttribute(),
    new LetraControlAttribute());
