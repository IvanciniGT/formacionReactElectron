# Apuestas.Invariantes

Anotaciones de validación de los campos del microservicio de **apuestas**, que
incluye el catálogo (eventos, tipos, mercados, selecciones y sus cuotas):
`[Cuota]`, `[Monto]`, `[NombreEvento]`… Cada una dice qué forma tiene que tener
un dato **para poder existir**.

Las de campos que comparten todos los dominios (nombre, email, DNI,
identificador) están en [`Comun.Invariantes`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-invariantes). Las
construye sobre [`Comun.Validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion), que pone la base
`AnotacionCompuestaAttribute`, los validadores genéricos e `IValidador`.

## Lo que no es

- **No es lógica de negocio.** Aquí está lo que vale siempre: una cuota de
  1,00 no paga nada y un monto negativo no existe. Lo que decide el operador y
  puede cambiar (el máximo de apuesta, las cuotas que se ofrecen) se comprueba
  en el servicio. Por eso ninguna anotación tiene máximos de negocio.
- **Una anotación sola no protege nada.** Solo se comprueba cuando alguien pasa
  el objeto por `IValidador`.

## Uso

```csharp
using Apuestas.Invariantes.Anotaciones;
using Comun.Invariantes.Anotaciones;

public class Apuesta
{
    [Identificador] public Guid Id { get; }
    [Identificador] public Guid JugadorId { get; }
    [Monto]         public decimal Monto { get; }
    [Cuota]         public decimal CuotaAceptada { get; }
    [FechaHora]     public DateTime Realizada { get; }
    // …
}
```

Se valida inyectando `IValidador`, de `Comun.Validacion`.

## Catálogo

> **⚠️ Los valores de esta tabla son una copia y pueden estar desfasados.**
> La única fuente es
> [`Constantes/Limites.cs`](src/Apuestas.Invariantes/Constantes/Limites.cs): las anotaciones y sus
> mensajes leen de ahí, y este README no. Si un valor de aquí no coincide con
> `Limites.cs`, el que vale es el de `Limites.cs` y lo que hay que corregir es
> esta tabla.

Todas las anotaciones son **obligatorias**: rechazan el nulo, y en los textos
también la cadena vacía y la que solo tiene espacios.

| Anotación | Comprueba | Piezas |
|---|---|---|
| `[Cuota]` | Mayor que 1[^1] (no incluido), sin máximo. Como mucho 2[^1] decimales. | Required, `MayorQue`, `MaximoDecimales` |
| `[Monto]` | Mayor que 0[^1] (no incluido), sin máximo. Como mucho 2[^1] decimales. | Required, `MayorQue`, `MaximoDecimales` |
| `[NombreEvento]` | Entre 3[^1] y 100[^1] caracteres, cualquier carácter («Madrid x Barça»). | Required, StringLength |
| `[NombreTipo]` | Entre 2[^1] y 50[^1] caracteres. | Required, StringLength |
| `[Descripcion]` | Entre 3[^1] y 500[^1] caracteres. | Required, StringLength |

En la columna **Piezas**, lo que va sin formato es estándar de DataAnnotations
y lo que va `entre comillas de código` es de `Comun.Validacion`. Se aplican en
ese orden y se informa del primer fallo.

[^1]: Copia del valor de [`Constantes/Limites.cs`](src/Apuestas.Invariantes/Constantes/Limites.cs) en el momento de escribir este README. Puede haber cambiado: el valor bueno es siempre el de `Limites.cs`.

## Organización

| Espacio de nombres | Qué contiene |
|---|---|
| `Apuestas.Invariantes.Anotaciones` | Las anotaciones de campo. |
| `Apuestas.Invariantes.Constantes` | `Limites`, con una clase por campo. |
| `Apuestas.Invariantes.Mensajes` | Los textos de error, sin cifras. |

## Decisiones de diseño

Las decisiones sobre cómo se valida están en el
[README de `Comun.Validacion`](https://gitlab.ivanosuna.com/apuestas-deportivas/comun-validacion#decisiones-de-diseño).

**El catálogo va con las apuestas.** Hacer una apuesta necesita comprobar, en
el mismo momento, que la selección sigue abierta y que la cuota es la vigente.
Juntos es una consulta en la misma transacción; separados sería una llamada
entre servicios o una copia del catálogo mantenida con eventos. Si el catálogo
necesita escalar por su cuenta, se separa entonces.

**`[Cuota]` es de apuestas.** La apuesta guarda la cuota **aceptada** en el
momento de hacerla, porque la del catálogo cambia después.

**Las pruebas no leen `Limites`.** Llevan los valores escritos a mano porque
son la especificación vista desde fuera: si alguien cambia un límite por error,
tienen que enterarse.

**`Limites` está fuera de la cobertura.** Un `const decimal` se compila como un
campo que inicializa un constructor estático que nunca se ejecuta. Salía como
una línea sin cubrir sin que hubiera nada que probar.

## Añadir una anotación

1. Escribe sus límites en `Constantes/Limites.cs`, en una clase con el nombre
   del campo.
2. Escribe sus mensajes en `Mensajes/MensajesValidacion.cs`, con huecos y sin
   cifras.
3. Crea la anotación en `Anotaciones/` heredando de
   `AnotacionCompuestaAttribute` y declarando su `AttributeUsage`. Usa piezas
   estándar siempre que exista una que sirva, y si no, las de
   `Comun.Validacion`.
4. Escribe sus pruebas en `Apuestas.Invariantes.Pruebas/Anotaciones/`, con los valores escritos a
   mano, incluidos los dos lados de cada límite (50 vale, 51 no).
5. **Comprueba que las pruebas fallan.** Quita cada pieza de la anotación, y
   cambia cada límite, y mira que alguna prueba se pone en rojo. Una prueba que
   no falla cuando el código está mal es peor que no tenerla.
6. Añade la fila al catálogo de este README.

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
  `artifacts/cobertura/Apuestas.Invariantes.Pruebas/informe/index.html`, y al lado `coverage.cobertura.xml`
  (para GitLab) y `coverage.opencover.xml` (para SonarQube).
