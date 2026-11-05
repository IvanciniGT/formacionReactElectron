# Apuestas.Dominio

Modelos del dominio de apuestas deportivas: `Apuesta`, `Jugador`, `Evento`,
`Tipo`, `Mercado` y `Seleccion`.

Todavía está vacío. Sus campos se anotarán con
[`Apuestas.Invariantes`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-invariantes)
y se validarán con `IValidador` de
[`Comun.Validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion).

Versión 0.x mientras el dominio se define: con SemVer, una 0.x puede romper el
contrato sin pasar a 2.0.

## Trabajar en local con todo el proyecto

Las dependencias de otros componentes propios están declaradas dos veces en el
`.csproj`:

- **Como proyecto**, si el componente está clonado al lado, desde el repo padre
  `proyecto`, y no estás en CI. Un cambio en la dependencia se ve al momento,
  sin publicar nada, y el IDE salta a su código.
- **Como paquete con versión fija** en cualquier otro caso: en el CI y en un
  clon suelto de este repo.

Ojo: en local compilas contra el código de la dependencia **tal como está en tu
disco**, y el CI contra **la versión fija**. Si algo compila en tu máquina y no
en el CI, normalmente es que falta publicar una `-desa` de la dependencia y
subir la versión en el `PackageReference`. Para compilar como el CI:

```bash
dotnet test -p:UsarFuentesLocales=false
```

## Restaurar en local

Solo hace falta si usas los paquetes y no los proyectos: con el repo
clonado suelto, o con `-p:UsarFuentesLocales=false`. Los paquetes propios (`Comun.*`, `Apuestas.*`, `Jugadores.*`,
`Operadores.*`) vienen del registro
NuGet de GitLab, que pide credenciales. Una vez por máquina, con un token
personal con permiso `read_api`:

```bash
dotnet nuget add source \
  "https://gitlab.ivanosuna.com/api/v4/groups/41/-/packages/nuget/index.json" \
  --name gitlab-apuestas --username <tu-usuario> --password <tu-token> \
  --store-password-in-clear-text --configfile ~/.nuget/NuGet/NuGet.Config
```

El nombre `gitlab-apuestas` tiene que coincidir con el del `nuget.config` del
repo, que declara el origen sin credenciales. En macOS y Linux NuGet no puede
cifrar la contraseña, de ahí `--store-password-in-clear-text`: el fichero es
tuyo y no va a ningún repo.

## Ramas, versiones y publicación

La versión **no la escribe nadie**: el pipeline la calcula con `.gitlab/version.sh` a partir
de la última versión aprobada (el último tag `vX.Y.Z`) y de lo que hay en **Unreleased** en
[`CHANGELOG.md`](CHANGELOG.md).

| Lo que hay en Unreleased | Sube |
|---|---|
| `Removed`, o un `**BREAKING**` en `Changed` | MAJOR (en 0.x, MINOR) |
| `Added`, `Changed` o `Deprecated` | MINOR (en 0.x, PATCH) |
| `Fixed` o `Security` | PATCH |

| Evento | Pruebas | Publica (solo si pasa todo) |
|---|---|---|
| Push a `feature/*` | Unitarias | — |
| Push a `dev` | Unitarias, integración y Sonar | Botón **publicar-desa**: `X.Y.Z-desa.N`, provisional y sin tag |
| Push a `main` | Unitarias, integración, sistema, versión y compatibilidad del API | `X.Y.Z-rc.N` y su tag |
| Botón **aceptar** (pipeline de `main`) | — | `X.Y.Z` del mismo commit que la rc, su tag, la *Release* de GitLab y el CHANGELOG de `dev` formalizado |

- **No hace falta MR.** Quien puede hacer push a `dev` o a `main` lo decide la protección
  de ramas. Lo que se garantiza es que nada se publica sin pasar sus pruebas.
- **Los tags solo los pone el pipeline, y solo en `main`**, que no se reescribe. En
  `feature/*` y en `dev` se puede hacer `rebase` y `reset`: allí no hay tags que dependan
  de los commits.
- **Cada cambio se anota en Unreleased en el mismo commit que lo introduce**, una entrada
  por línea, bajo su epígrafe. Al aceptar una versión, el pipeline pasa a `## [X.Y.Z] -
  fecha` solo las entradas que entraron en esa candidata; las que llegaron a `dev` después
  se quedan en Unreleased.
- **Para ver en local qué versión va a salir:** `sh .gitlab/version.sh calcular`.
- **El pipeline necesita la variable `TOKEN_ESCRITURA`** (un token del proyecto o del
  grupo con `api` y `write_repository`) para poner tags, crear la *Release* y formalizar
  el CHANGELOG. El `CI_JOB_TOKEN` no puede escribir en el repo.
- **Una pre-release nunca se elige sola.** Quien la quiera la pide con su versión exacta,
  entre corchetes: `Version="[1.1.0-desa.12]"`.

### Hook antes de subir

`.githooks/pre-push` comprueba el CHANGELOG y pasa las pruebas unitarias antes de subir
una rama. Es un aviso rápido en tu máquina; lo que obliga es el pipeline. Se activa una
vez por clon:

```bash
git config core.hooksPath .githooks
```
