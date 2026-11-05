using System.ComponentModel.DataAnnotations;

namespace Comun.Validacion;

// Lo único que sabe de ValidationContext y de Validator: nadie más los ve.
internal sealed class ValidadorDataAnnotations(IServiceProvider servicios) : IValidador
{
    public IReadOnlyList<ErrorValidacion> Validar(object objeto)
    {
        // Los servicios llegan a los validadores por el contexto: así EdadEntre usa el
        // TimeProvider registrado en el host en lugar del reloj del sistema.
        var contexto = new ValidationContext(objeto, servicios, items: null);
        var resultados = new List<ValidationResult>();

        // Con false, Validator solo comprueba los [Required] y se salta todas nuestras anotaciones.
        Validator.TryValidateObject(objeto, contexto, resultados, validateAllProperties: true);

        return resultados
            .Select(r => new ErrorValidacion(r.MemberNames.FirstOrDefault() ?? string.Empty, r.ErrorMessage ?? string.Empty))
            .ToList();
    }

    public void ExigirValido(object objeto)
    {
        var errores = Validar(objeto);
        if (errores.Count > 0)
            throw new ObjetoInvalidoException(objeto.GetType(), errores);
    }
}
