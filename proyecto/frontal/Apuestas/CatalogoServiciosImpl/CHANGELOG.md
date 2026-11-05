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
- Prueba de que, al perder la conexión, una suscripción nueva hecha en ese momento (un reintento) no termina con las demás.
- `ServicioEventosHttp`: implementación de `ServicioEventos` con `fetch` (REST) y SignalR (tiempo real), con reconexión desde la última marca.
- Mappers a mano de los modelos del servidor (de `catalogo-modelos-servidor`) a los del frontal.
- `ConexionTiempoReal` y `adaptarHubConnection`, para aislar SignalR y poder probar sin él.
- Los errores REST se traducen por el `codigo` del contrato, no por el status; los del hub, por el mismo código.
- Errores de la API para cada caso: `SuscripcionDuplicadaError`, `DemasiadasSuscripcionesError`, y `ServicioNoDisponibleError` cuando la conexión se pierde y no se recupera.
- `crearServicioEventos`, con la forma `CrearServicioEventos` de la API, y la configuración de la API aplicada: URL, tiempo máximo de petición, esperas de reconexión y nivel de registro.
- Pruebas unitarias (Mocha, Chai, Sinon, c8).
- Pruebas de sistema: las del TCK (caja negra) y las propias (caja blanca), contra el backend fake (`npm run sistema`).
- Pruebas de integración: las del TCK contra un backend desplegado (`URL_BACKEND=… npm run integracion`).
- `sistema` e `integracion` funcionan también en Windows: el entorno lo elige el perfil de cucumber y `tsx` se registra desde `config/tsx.mjs`, sin variables en los scripts.

### Changed
- La barra final de la URL base se quita sin expresión regular: `/\/+$/` tarda el cuadrado de lo que mide con muchas barras seguidas.
- Mocha, la cobertura y SonarQube vienen de `configuracion-frontal`: `config/mocharc.cjs`, `config/c8rc.json` solo con lo que se cubre, y sin `sonar-project.properties`.
- Instalación desde la raíz del proyecto (npm workspaces). ESLint, Prettier y las opciones base de TypeScript vienen de `@apuestas-deportivas/configuracion-frontal`; las dependencias propias, por versión y no por `file:`.
