# Changelog

Todos los cambios de este componente, en formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen
[SemVer](https://semver.org/lang/es/) y **no las escribe nadie**: el pipeline las calcula
a partir de lo que hay aquí (`.gitlab/version.sh`).

- Cada cambio se anota en **Unreleased**, en el mismo commit que lo introduce.
- Una entrada por línea, empezando por `- `, bajo su epígrafe: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed` o `Security`.
- Un cambio incompatible en `Changed` empieza por `**BREAKING**`.
- Al aceptar una versión, el pipeline pasa sus entradas a `## [X.Y.Z] - fecha`.

## [Unreleased]

### Added
- `IValidador`, con `Validar` y `ExigirValido`, que se registra con `AgregarValidacion()` y se inyecta en cualquier capa.
- `ErrorValidacion` y `ObjetoInvalidoException`.
- `AnotacionCompuestaAttribute`: base para anotaciones de campo que agrupan piezas estándar y propias.
- Validadores genéricos: `EdadEntre`, `MayorQue`, `MaximoDecimales`, `IdentificadorValido` y `NoPorDefecto`.
