# Comun.Validacion

Validación para todas las capas y todos los dominios del proyecto. Se registra
una vez en el host, se inyecta `IValidador` donde haga falta, y valida
cualquier objeto según las anotaciones que lleve.

No sabe nada de ningún dominio. Las reglas viajan con la clase que se valida,
en sus anotaciones, así que un solo `IValidador` sirve igual para una
`Apuesta` que para un `Pago`. Las anotaciones de cada dominio viven en el
componente de ese dominio, como [`Apuestas.Invariantes`](https://gitlab.ivanosuna.com/apuestas-deportivas/apuestas-invariantes).

## Uso

```csharp
// Program.cs
builder.Services.AgregarValidacion();
```

```csharp
using Comun.Validacion;

public class ServicioLiquidacion(IValidador validador)
{
    public void Liquidar(Apuesta apuesta, Pago pago)
    {
        validador.ExigirValido(apuesta);   // aplica las anotaciones de Apuesta
        validador.ExigirValido(pago);      // y las de Pago, aunque sea de otro dominio
        // …
    }
}
```

| Método | Devuelve |
|---|---|
| `Validar(objeto)` | La lista de `ErrorValidacion(Campo, Mensaje)`, vacía si es válido. |
| `ExigirValido(objeto)` | Nada si es válido. Si no, lanza `ObjetoInvalidoException`, con el `Tipo` y la lista de `Errores`. |

- **El reloj lo decide el host.** Si hay un `TimeProvider` registrado (uno fijo en
  las pruebas, por ejemplo), los validadores que dependen de la fecha lo usan. Si
  no hay ninguno, usan el del sistema. Este componente no registra ninguno.
- **Reglas que cruzan varios campos.** Las escribe la propia clase implementando
  `IValidatableObject`. `IValidador` las ejecuta después de las anotaciones. Si
  no indican campo, el error llega con `Campo` vacío.
- **No valida en cascada.** Si `Apuesta` tiene un `Jugador`, validar la apuesta
  no valida el jugador: hay que validarlo por separado.

## Crear las anotaciones de un dominio

Una anotación de campo hereda de `AnotacionCompuestaAttribute` y recibe las piezas que
necesita, estándar o de este componente. Se aplican en orden y se informa del
primer fallo.

```csharp
using System.ComponentModel.DataAnnotations;
using Comun.Validacion.Anotaciones;
using Comun.Validacion.Validadores;

public sealed class MontoAttribute() : AnotacionCompuestaAttribute(
    new RequiredAttribute { ErrorMessage = "El campo {0} es obligatorio." },
    new MayorQueAttribute(0m),
    new MaximoDecimalesAttribute(2));
```

## Validadores

Son las piezas que DataAnnotations no trae de serie. Ninguno lleva valores fijos:
los límites los pone quien los usa.

| Validador | Comprueba |
|---|---|
| `EdadEntre(minima, maxima)` | Que la edad que corresponde a una fecha de nacimiento esté en el rango, ambos incluidos. Acepta `DateOnly`, `DateTime` y `DateTimeOffset`. Usa el `TimeProvider` del host. |
| `MayorQue(minimo)` | Un `decimal` estrictamente mayor que `minimo`, sin máximo. Es el `Range` estándar con el mínimo excluido. |
| `MaximoDecimales(maximo)` | Un `decimal` con `maximo` decimales como mucho. Los ceros finales no cuentan. Rechaza `double`, que no sirve para dinero. |
| `IdentificadorValido` | Un `Guid` distinto de `Guid.Empty`. Rechaza números y textos. |
| `NoPorDefecto` | Un tipo por valor que no tenga su valor por defecto: rechaza `default(DateTime)`, que `[Required]` deja pasar. |

Todos dan por bueno el nulo: la obligatoriedad la pone `[Required]`.

## Organización

| Espacio de nombres | Qué contiene |
|---|---|
| `Comun.Validacion` | `IValidador`, `ErrorValidacion` y `ObjetoInvalidoException`. La implementación es interna. |
| `Comun.Validacion.Anotaciones` | `AnotacionCompuestaAttribute`, la base de las anotaciones de campo. |
| `Comun.Validacion.Validadores` | Los validadores de la tabla anterior. |
| `Comun.Validacion.Mensajes` | Los textos de error de los validadores, sin cifras. Son internos. |

`AgregarValidacion()` está en el espacio de nombres de `IServiceCollection`,
como las extensiones de .NET, para que se encuentre sin añadir un `using`.

## Decisiones de diseño

**Un servicio inyectado.** En .NET no hay nada como `@Validated` de Spring, que
intercepta la llamada y valida los argumentos. `Microsoft.Extensions.Validation`
(.NET 10) es la infraestructura de las minimal APIs: necesita un generador de
código y tiene una API de bajo nivel. Así que la validación es un servicio,
`IValidador`, que se registra en el host y se inyecta en cualquier capa.
`ValidationContext` y `Validator` solo aparecen en su implementación. Si mañana
se quiere validar con otra cosa por debajo, se cambia la implementación y nadie
más se entera.

**Un solo validador para todos los dominios.** El validador no elige reglas, las
lee del objeto. Por eso no hace falta uno por dominio, ni distinguirlos por
nombre. Si algún día un tipo necesita un validador propio (una regla que vaya a
la base de datos, por ejemplo), se añadiría `IValidador<T>`, con la
implementación genérica por defecto y otra registrada solo para ese tipo. Se
descartan los *keyed services*: eligen por una cadena de texto, y un error al
escribirla solo se descubre en ejecución.

**Se agrupan anotaciones en lugar de heredarlas.** En C# no se puede anotar una
anotación con otras, como en Java, y varias de las estándar están selladas
(`EmailAddress`). `AnotacionCompuestaAttribute` recibe las piezas y las aplica en orden.

**Los validadores aceptan el nulo.** Es la convención de DataAnnotations. Si un
validador rechazase el nulo, saldría su mensaje en lugar de «es obligatorio».

**Los identificadores son Guid.** Los numéricos que use la base de datos son
cosa de la capa de repositorio y no salen de ella. Un número que llegue como
identificador es un error.

**El reloj se pide al contexto.** Si `EdadEntre` usase directamente la fecha del
sistema, la edad de una misma persona cambiaría según el día en que se
ejecutasen las pruebas. `IValidador` pasa los servicios del host a cada
validador a través del contexto.

## Añadir un validador

Solo si no lo trae DataAnnotations y no depende de ningún dominio. Si depende de
uno, va en el componente de ese dominio.

1. Créalo en `Validadores/`. Tiene que dar por bueno el nulo y recibir sus
   límites como parámetros, nunca fijos.
2. Escribe su mensaje en `Mensajes/MensajesValidacion.cs`, con huecos para los
   parámetros.
3. Escribe sus pruebas en `Comun.Validacion.Pruebas/Validadores/`, con los dos lados
   de cada límite y el texto exacto del mensaje.
4. **Comprueba que las pruebas fallan** al romper el validador. Una prueba que
   no falla cuando el código está mal es peor que no tenerla.
5. Añade la fila a la tabla de este README.

## Restaurar en local

Los paquetes propios (`Comun.*`, `Apuestas.*`, `Jugadores.*`,
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
  `artifacts/cobertura/Comun.Validacion.Pruebas/informe/index.html`, y al lado `coverage.cobertura.xml`
  (para GitLab) y `coverage.opencover.xml` (para SonarQube).
