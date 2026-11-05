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
- Backend simulado del catálogo: el API REST de `openapi.yaml` y el hub SignalR de `asyncapi.yaml`, con los datos de `datos/eventos.json`.
- Control desde las pruebas (`arrancarBackendFake`, `catalogo.cambiarCuota`…) y cuotas que se mueven solas para las pruebas a mano.
- `suscritosA` y `cortarConexiones`, para las pruebas de caja blanca de las implementaciones.
- Rechaza con 400 una clave de grupo mal formada, como dice el contrato.
- Los errores, con el `codigo` del contrato: en REST (con `type`, `parametro` y `eventoId`) y en el hub. Una ruta que no existe responde sin código.
- `EntornoFake` (`./pruebas`): el entorno del TCK sobre este backend, para cualquier implementación. Controla el backend: con él se ejecutan todos los escenarios.

### Changed
- Arranca con los datos de prueba del TCK (`datos/catalogo.json`) y usa su tipo `DatosDePrueba`: ya no tiene su propia copia.
- Mocha, la cobertura y SonarQube vienen de `configuracion-frontal`: `config/mocharc.cjs`, `config/c8rc.json` solo con lo que se cubre.
- Instalación desde la raíz del proyecto (npm workspaces). ESLint, Prettier y las opciones base de TypeScript vienen de `@apuestas-deportivas/configuracion-frontal`; las dependencias propias, por versión y no por `file:`.
