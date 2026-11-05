# Changelog

Todos los cambios de este contrato, en formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen
[SemVer](https://semver.org/lang/es/). Para un contrato, un cambio incompatible es todo
lo que obliga a cambiar a quien lo consume: quitar o renombrar un campo, hacerlo
obligatorio, endurecer una validación.

- Cada cambio se anota en **Unreleased**, en el mismo commit que lo introduce.
- Una entrada por línea, empezando por `- `, bajo su epígrafe: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed` o `Security`.
- Un cambio incompatible en `Changed` empieza por `**BREAKING**`.

## [Unreleased]

### Added
- API REST del catálogo para el jugador (`openapi.yaml`): tipos, eventos con su mercado principal, detalle con sus grupos de mercados, mercados por grupo y cambios de cuotas desde una marca.
- Canal en tiempo real con SignalR (`asyncapi.yaml`): suscribirse a un evento desde una marca y recibir sus cambios de cuotas, de mercados y de estado.
- `CodigoProblema`: los mismos códigos de error en REST (`Problema.codigo`, con `type`, `parametro` y `eventoId`) y en el hub (al principio del texto del error de `Suscribir`), para que el frontal los distinga vengan de donde vengan.
- Validaciones de cada campo, con `x-invariante` donde salen de una invariante del dominio. Los decimales de las cuotas, en `x-decimales`: con `multipleOf` los validadores en coma flotante rechazan cuotas válidas.
- Ejemplos completos de cada respuesta REST, de cada error y de cada mensaje del hub, con los mismos ids en todos para poder seguir una pantalla de principio a fin.

### Changed
- Instalación desde la raíz del proyecto (npm workspaces).

### Fixed
- `validar`: funciona en Windows (la ruta del asyncapi.yaml salía como `C:\C:\…`).
