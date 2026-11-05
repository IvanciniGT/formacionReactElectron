# Changelog

Todos los cambios de este proyecto, en formato
[Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Las versiones siguen
[SemVer](https://semver.org/lang/es/). Para un TCK, un cambio incompatible es todo lo que
obliga a cambiar a quien lo ejecuta: un método nuevo en `EntornoDePruebas`, o un escenario
que exige algo que antes no.

- Cada cambio se anota en **Unreleased**, en el mismo commit que lo introduce.
- Una entrada por línea, empezando por `- `, bajo su epígrafe: `Added`, `Changed`,
  `Deprecated`, `Removed`, `Fixed` o `Security`.
- Un cambio incompatible en `Changed` empieza por `**BREAKING**`.

## [Unreleased]

### Added
- Lo que escribe en la consola el código probado durante un escenario se guarda, y solo se enseña (en stderr y adjunto al informe) si el escenario falla. Los avisos esperados de los escenarios que provocan errores ya no ensucian la salida.
- Escenarios de caja negra de `ServicioEventos`: consultas del catálogo y cambios en tiempo real.
- `registrarPruebas`, que recibe el Cucumber, la fábrica de la implementación (`CrearServicioEventos`) y un `EntornoDePruebas`: el backend contra el que se ejecuta.
- Escenarios de configuración: lo que se rechaza al crear el servicio.
- Escenarios de errores: petición no válida (y qué parámetro), demasiados mercados, evento que no existe, suscripción duplicada, backend que no responde y URL que no es la del backend.
- Datos de prueba (`datos/catalogo.json`).
- `EntornoRemoto`, para ejecutar el TCK como prueba de integración contra un backend desplegado, y `@controla-el-backend` en los escenarios que necesitan controlarlo: contra un entorno que no puede, se saltan.

### Changed
- Publica `datos/catalogo.json`, que también usa el backend fake: un solo catálogo de prueba.
- Instalación desde la raíz del proyecto (npm workspaces). ESLint, Prettier y las opciones base de TypeScript vienen de `@apuestas-deportivas/configuracion-frontal`; las dependencias propias, por versión y no por `file:`.
