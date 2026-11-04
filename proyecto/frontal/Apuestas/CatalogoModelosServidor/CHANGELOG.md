# Changelog

Todos los cambios de este proyecto, en formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen
[SemVer](https://semver.org/lang/es/). Como todo sale del contrato, cada versión del
contrato que cambie un esquema es una versión nueva de este paquete.

- Cada cambio se anota en **Unreleased**, en el mismo commit que lo introduce.
- Una entrada por línea, empezando por `- `, bajo su epígrafe: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed` o `Security`.
- Un cambio incompatible en `Changed` empieza por `**BREAKING**`.

## [Unreleased]

### Added
- Los modelos del servidor del catálogo generados del contrato: los del API REST (`openapi.yaml`) y los mensajes del hub (`asyncapi.yaml`), todo `readonly`.
- `LIMITES_SERVIDOR`: los límites de cada campo según el contrato, por esquema.
- `ESQUEMAS_SERVIDOR` (`./esquemas`): los esquemas combinados, para inicializar los modelos del frontal.
