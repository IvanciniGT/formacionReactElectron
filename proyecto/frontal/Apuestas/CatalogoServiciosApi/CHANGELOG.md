# Changelog

Todos los cambios de este proyecto, en formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen
[SemVer](https://semver.org/lang/es/).

- Cada cambio se anota en **Unreleased**, en el mismo commit que lo introduce.
- Una entrada por línea, empezando por `- `, bajo su epígrafe: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed` o `Security`.
- Un cambio incompatible en `Changed` empieza por `**BREAKING**`.

## [Unreleased]

### Added
- La interfaz `ServicioEventos`: tipos, eventos, detalle, mercados por grupo y cambios en tiempo real como `Observable`.
- Los modelos del frontal (`Evento`, `Mercado`, `Seleccion`…), con fechas como `Date` y datos derivados para la pantalla (`enDirecto`, `seAdmitenApuestas`, `hayMas`).
- `CambioEnEvento` como unión discriminada, y `comprobarExhaustivo` para tratar todos sus casos.
- `LIMITES` del frontal, escritos a mano: tamaños y valores que pueden llegar en cada campo de texto o de cuota, enlazado desde el TSDoc de cada campo.
- `CrearServicioEventos`, la forma de la fábrica que exporta cada implementación, y `ConfiguracionServicioEventos` con `comprobarConfiguracion` y `ConfiguracionNoValidaError`.
- `ServicioEventos.cerrar()`, para liberar lo que el servicio tenga abierto.
- `npm run inicializar-modelos`: el día 0 de los modelos, los `LIMITES` y la tabla de correspondencias, desde el contrato. No pisa ficheros existentes.
- Detector de divergencias con los modelos del servidor (`npm run divergencias`): avisa de campos sin equivalente, valores de estado distintos y constantes que no coinciden.
- Errores `EventoNoEncontradoError`, `PeticionIncorrectaError`, `ServicioNoDisponibleError`, `SuscripcionDuplicadaError` y `DemasiadasSuscripcionesError`, la unión `ErrorServicioEventos`, y los `@throws` de cada método. `PeticionIncorrectaError.parametro`: el parámetro que no vale.
