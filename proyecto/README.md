# Apuestas deportivas

Proyecto del curso *Arquitectura frontend profesional con TypeScript, React y
Electron*. Junta todos los componentes, para tenerlo todo de una vez y abrirlo
junto.

**Por ahora, todos viven en este mismo repo**, como carpetas normales. Cada uno
volverá a ser un repo propio, con su versión, sus pruebas y sus pipelines, y este
pasará a juntarlos como submódulos. Entonces, en el CI se consumirán entre ellos
como paquetes (NuGet o npm) con versión; en local, cada componente usa el código
de sus vecinos directamente, sin publicar nada, y así sigue funcionando hoy: lo
explica el README de cada uno.

## Componentes

| Carpeta | Repo | Qué es |
|---|---|---|
| `backend/Comun/Validacion` | [`comun-validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion) | Validación inyectable por DI, para cualquier capa y dominio. |
| `backend/Apuestas/Invariantes` | [`apuestas-invariantes`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-invariantes) | Anotaciones de validación de los campos del dominio. |
| `backend/Apuestas/Dominio` | [`apuestas-dominio`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-dominio) | Modelos del dominio. |
| `contratos/Apuestas/Catalogo` | | El contrato del catálogo: `openapi.yaml` y `asyncapi.yaml`. |
| `frontal/Comun/Configuracion` | | ESLint, Prettier, TypeScript, Mocha y c8 comunes a los paquetes del frontal, y las tareas de cobertura y SonarQube. |
| `frontal/Apuestas/Catalogo*` | | Del catálogo: tipos del servidor, API, implementación, backend fake y TCK. |
| `frontal/` (aplicaciones) | | Los frontales React y Electron, todavía por crear. |

`backend/ApuestasDeportivas.slnx` abre todos los proyectos juntos en el IDE.

## Clonar

```bash
git clone https://gitlab.ivanosuna.com/apuestas-deportivas/proyecto.git
```

Con todo clonado desde aquí no hace falta ninguna credencial: se usan los
proyectos vecinos. Solo hace falta para compilar como el CI
(`-p:UsarFuentesLocales=false`) o un componente clonado suelto.

## El frontal y los contratos (npm workspaces)

Los paquetes npm se juntan como *workspaces* en el `package.json` de esta carpeta, igual
que `ApuestasDeportivas.slnx` junta los proyectos del backend. Una sola instalación para
todos, y cada paquete usa el código de sus vecinos enlazado, sin publicar nada.

```bash
npm install          # todos los paquetes, con un solo package-lock.json aquí
npm run verify       # construye en orden y pasa el verify de cada paquete
```

Desde aquí, para uno solo: `npm run test -w frontal/Apuestas/CatalogoServiciosApi`. O
entrando en su carpeta, como siempre: `npm` sube a buscar los workspaces.

| Script | Qué hace |
|---|---|
| `build` | Construye los paquetes que lo necesitan, en orden |
| `verify` | `build`, y el `verify` de todos: lo que tiene que pasar antes de subir |
| `format` | Prettier en todos |
| `sonar` | SonarQube en los que lo tienen; antes, `verify`, que deja la cobertura. El token, en `SONAR_TOKEN` |

**Los workspaces van en orden de dependencias y sin comodines**, a propósito: npm ejecuta
los scripts de `--workspaces` en el orden en que están escritos, y cada paquete necesita
construidos los anteriores. Un paquete nuevo se añade en su sitio de la lista.

**Cada paquete sigue declarando sus herramientas** (`typescript`, `mocha`…) en sus
`devDependencies`, aunque npm las instale una sola vez aquí: así cada uno puede vivir en su
propio repo el día que se separe, como los del backend. Lo que es configuración, y no
herramienta, está en [`frontal/Comun/Configuracion`](frontal/Comun/Configuracion/README.md).
Para subir una herramienta, se cambia su versión en los `package.json` que la usan y
`npm install` aquí; `npm ls typescript` dice si alguno se ha quedado atrás.

**En Windows** funciona igual: los scripts no usan nada propio de bash, y el
`.gitattributes` del repo hace que git descargue con saltos de línea LF, que es lo que pide
Prettier.

