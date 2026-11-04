# Jugadores.Dominio

Modelos y lógica de dominio del microservicio de **jugadores**: el jugador, sus documentos
y su cuenta. Casi toda la lógica es de validación: un `Jugador` **no puede existir
inválido**.

## Modelo

| Clase | Qué es |
|---|---|
| `Jugador` | Raíz del agregado. Los documentos y la cuenta solo cambian a través de él. |
| `Documento` | Un documento subido por el jugador: pendiente, validado o rechazado (con motivo). |
| `Cuenta` | El saldo y sus movimientos. |
| `Movimiento` | Un depósito o una retirada. No cambia nunca: la regulación exige poder auditarlo. |

## Uso

`Jugador` no tiene constructor público. Se crea con `Registrar`, que valida antes de
devolverlo, y cada cambio valida el estado nuevo y lo deshace si no es válido. El
`IValidador` (de [`Comun.Validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion)) llega como parámetro: la
entidad la crea el código con `new`, no el contenedor, y quien lo tiene inyectado es el
servicio que la usa. Lo mismo con el `TimeProvider`, para las fechas.

```csharp
public class ServicioJugadores(IValidador validador, TimeProvider reloj)
{
    public Jugador Registrar(DatosRegistro datos) =>
        Jugador.Registrar(datos.Nombre, datos.Apellidos, datos.Email, datos.Documento, datos.FechaNacimiento, validador);

    public void Depositar(Jugador jugador, decimal importe) =>
        jugador.Depositar(importe, reloj, validador);
}
```

## Reglas

| Acción | Desde | Hacia | Condición |
|---|---|---|---|
| `Registrar` | — | `PendienteVerificacion` | Datos válidos, mayor de edad incluido |
| `SubirDocumento` | `PendienteVerificacion`, `Activo` | igual | Nuevo documento `Pendiente` |
| `ValidarDocumento` | doc. `Pendiente` | doc. `Validado` | Si es de `Identidad` y el jugador estaba pendiente, pasa a `Activo` |
| `RechazarDocumento` | doc. `Pendiente` | doc. `Rechazado` | Con motivo |
| `Bloquear` | `PendienteVerificacion`, `Activo` | `Bloqueado` | Con motivo |
| `Desbloquear` | `Bloqueado` | `Activo` si tiene la identidad validada; si no, `PendienteVerificacion` | — |
| `Depositar` / `Retirar` | `Activo` | igual | Importe válido; retirar no puede dejar saldo negativo |
| `CambiarEmail` | `PendienteVerificacion`, `Activo` | igual | Email válido |

Un documento validado o rechazado no se vuelve a revisar: si hace falta otro, el jugador
sube uno nuevo.

| Excepción | Cuándo |
|---|---|
| `ObjetoInvalidoException` (de `Comun.Validacion`) | Un dato no es válido. El objeto queda como estaba. |
| `TransicionNoPermitidaException` | La acción no vale en el estado del jugador o del documento. |
| `SaldoInsuficienteException` | Se intenta retirar más del saldo. |
| `DocumentoNoEncontradoException` | El documento no es de este jugador. |

## Pendiente

- **Reconstruir un `Jugador` desde la persistencia**, con sus documentos y su saldo: con el
  constructor privado, la capa de persistencia no tiene cómo. Se decide al llegar a ella.
- **Cobrar apuestas y pagar premios** sobre la cuenta: lo hará el microservicio de
  apuestas.

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

## Pruebas y cobertura

Desde la raíz del repo:

```bash
dotnet test
```

Hay tres tipos de prueba, por el nombre del proyecto en `tests/`:

| Proyecto | Tipo | Cuándo corre en el pipeline |
|---|---|---|
| `X.Pruebas` | Unitarias | Siempre |
| `X.Pruebas.Integracion` | Integración | En `dev` y en `main` |
| `X.Pruebas.Sistema` | Sistema | En `main` |

La cobertura se mide en cada `dotnet test`, como JaCoCo en Maven. La configuran
`Directory.Build.props` y `Directory.Build.targets`.

- **Cada proyecto de pruebas mide solo su componente**, no lo que usen sus dependencias.
- **Umbral: 90 % de líneas y 90 % de ramas, solo para las unitarias.** Por debajo,
  `dotnet test` falla aunque pasen todas las pruebas. Las de integración y sistema se miden,
  pero no se les exige: recorren medio componente y no deben tapar que falten unitarias.
- **Si hay código en `src/` y ninguna prueba unitaria, el pipeline falla.**
- **Todo lo generado va a `artifacts/`**: el informe HTML en
  `artifacts/cobertura/Jugadores.Dominio.Pruebas/informe/index.html`, y al lado `coverage.cobertura.xml`
  (para GitLab) y `coverage.opencover.xml` (para SonarQube).
