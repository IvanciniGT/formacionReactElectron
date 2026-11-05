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
- `configuracion-frontal sonar` no marca como redundantes los alias de `modelos/` (`type Id = string`): son nombres del dominio.
- `configuracionEslint({ raiz, ignorar })`, la configuración de Prettier y `tsconfig.base.json`, sacados de los paquetes del catálogo, donde estaban copiados.
- `tsconfig.build.json` y `tsconfig.cobertura.json` compartidos, con las rutas en `${configDir}`.
- La configuración de Mocha y la parte común de c8 (umbrales e informes).
- `configuracion-frontal cobertura` y `configuracion-frontal sonar`: las tareas que estaban copiadas en cada paquete. Sonar ya no necesita `sonar-project.properties`: la clave sale del nombre del paquete.
