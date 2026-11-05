namespace Comun.Validacion;

// El punto de entrada de la validación para todas las capas y todos los dominios: se inyecta
// y se usa, sin saber nada de DataAnnotations. No depende de ningún dominio: las reglas
// viajan con la clase que se valida, en sus anotaciones. Es el contrato; cómo se valida por debajo puede cambiar.
public interface IValidador
{
    IReadOnlyList<ErrorValidacion> Validar(object objeto);

    /// <exception cref="ObjetoInvalidoException">Si el objeto incumple alguna invariante.</exception>
    void ExigirValido(object objeto);
}
