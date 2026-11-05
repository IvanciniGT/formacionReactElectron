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
- Anotaciones del microservicio de apuestas y su catálogo: `[Cuota]`, `[Monto]`, `[NombreEvento]`, `[NombreTipo]` y `[Descripcion]`.

### Changed
- **BREAKING** El paquete se llama `Apuestas.Invariantes`; antes, `ApuestasDeportivas.Invariantes`.

### Removed
- `[Nombre]`, `[Apellidos]`, `[Email]`, `[DocumentoIdentidad]`, `[Identificador]`, `[Estado<TEnum>]` y `[FechaHora]`: pasan a `Comun.Invariantes`.
- `[FechaNacimiento]`: pasa a `Jugadores.Invariantes` como `[FechaNacimientoJugador]`.
