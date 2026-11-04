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
- Anotaciones de campos comunes a todos los dominios: `[Nombre]`, `[Apellidos]`, `[Email]`, `[DocumentoIdentidad]` (DNI y NIE), `[Identificador]`, `[Estado<TEnum>]` y `[FechaHora]`.
- Validadores `FormatoDocumento` y `LetraControl`, del DNI y el NIE.
