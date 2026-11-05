# CatalogoServiciosApi

`@apuestas-deportivas/catalogo-servicios-api`

Lo único que un frontal sabe del catálogo de apuestas: la interfaz **`ServicioEventos`**,
**cómo se crea y se configura**, y los **modelos con los que trabaja el frontal**. No hay nada del servidor: ni sus modelos,
ni fetch, ni SignalR. Eso es de la implementación
([`CatalogoServiciosImpl`](../CatalogoServiciosImpl/README.md)).

Así un componente React (o la consola Electron) depende de un contrato y no de cómo se
llega al backend, y en sus pruebas se le puede inyectar un doble.

## La interfaz

```ts
export interface ServicioEventos {
  listarTipos(): Promise<readonly TipoEvento[]>;
  listarEventos(filtro?: FiltroEventos): Promise<PaginaEventos>;
  obtenerEvento(eventoId: Id): Promise<EventoDetalle>;
  listarMercados(eventoId: Id, grupo: string): Promise<MercadosDeGrupo>;
  cambios(eventoId: Id, desde: Marca, mercados?: readonly Id[]): Observable<CambioEnEvento>;
  cerrar(): Promise<void>;
}
```

- **Las consultas devuelven `Promise`**, que es lo que espera React Query.
- **Los cambios en tiempo real, `Observable`** (RxJS): se cancelan con `unsubscribe`, y
  terminan solos cuando el evento deja de verse o hay que recargar. `desde` es la `marca`
  de la respuesta con la que se cargó el evento: así no se pierde ningún cambio.
- **`CambioEnEvento` es una unión discriminada** por `tipo` (`cuotas`, `estado`,
  `recargar`). Con un `switch` y `comprobarExhaustivo` en el `default`, si se añade un tipo
  nuevo, el código que no lo trate deja de compilar.

- **`cerrar()`** libera lo que el servicio tenga abierto y termina las suscripciones.
  Quien lo crea, lo cierra.

## Cómo se crea: `CrearServicioEventos` y su configuración

La API define **la forma de la fábrica**; cada implementación la exporta con esa forma, y la
aplicación elige cuál inyectar:

```ts
export type CrearServicioEventos = (configuracion: ConfiguracionServicioEventos) => ServicioEventos;
```

| Campo | Qué es |
|---|---|
| `urlBase` | El backend: `http` o `https` |
| `tiempoMaximoPeticionMs` | Lo que se espera a una petición antes de darla por fallida |
| `esperasReconexionMs` | Las esperas entre reintentos al perder la conexión; agotadas, se deja de intentar. `[]` es no reintentar |
| `nivelDeRegistro` | `depuracion`, `informacion`, `aviso` o `ninguno` |

- **Los valores no son de ninguna librería.** Los pone la aplicación que ensambla, según su
  entorno: los perfiles de desarrollo y producción viven allí.
- **`comprobarConfiguracion`** es la regla, y es de aquí: toda implementación la llama al
  crear el servicio, y así todas rechazan lo mismo con el mismo error,
  `ConfiguracionNoValidaError`. El [TCK](../CatalogoServiciosApiPruebas/README.md) lo
  comprueba.
- Lo que no es configuración sino colaboradores (otro `fetch`, un registrador) es de cada
  implementación: ver la suya.

```ts
// En la aplicación: el perfil decide los valores, la DI decide la implementación.
import { crearServicioEventos } from "@apuestas-deportivas/catalogo-servicios-impl";

const servicio = crearServicioEventos(configuracionDelEntorno);
```

## Los modelos del frontal

No son los del servidor:

- **Las fechas son `Date`**, no texto.
- **Los estados son uniones de literales** (`"programado" | "enJuego" | "interrumpido"`).
- **Hay datos que la pantalla necesita y el servidor no manda:** `Evento.enDirecto`,
  `Mercado.seAdmitenApuestas` (un mercado suspendido se ve, pero no se apuesta) y
  `PaginaEventos.hayMas`.
- **Todo es `readonly`**: un componente no debería modificar lo que recibe.

## Qué tamaños pueden llegar: `LIMITES`

Para que quien haga un componente sepa a qué atenerse (cuánto puede medir un nombre de
evento, cuántos decimales tiene una cuota), la librería exporta **`LIMITES`**:

```ts
import { LIMITES } from "@apuestas-deportivas/catalogo-servicios-api";

LIMITES.Evento.nombre        // { longitudMinima: 3, longitudMaxima: 100, invariante: "NombreEvento (Apuestas.Invariantes)" }
LIMITES.Seleccion.cuota      // { mayorQue: 1, decimales: 2, invariante: "Cuota (Apuestas.Invariantes)" }
```

- **Son del frontal y se escriben a mano**, en `src/modelos/limites.ts`. No son una copia
  generada de los del servidor: el frontal puede decidir otros, y el detector de
  divergencias avisa de en qué no coinciden.
- **Cada campo de los modelos lo enlaza en su TSDoc** (`/** Ver {@link LIMITES.Evento.nombre}. */`):
  se ve al pasar el ratón por el campo en el editor.
- **Son hechos, no reglas de presentación.** Qué hace cada frontal con ellos (truncar, en
  cuántos caracteres, con *tooltip*) lo decide cada uno: el de React y el de Electron
  pueden decidir distinto, y eso no va en esta librería.
- **Solo están los campos con tamaño o valor acotado** (textos, clave de grupo, cuotas). Los
  ids, las fechas y los estados ya los describe su tipo.

## Día 0: los modelos iniciales, desde el contrato

Para no empezar de cero, `npm run inicializar-modelos` escribe una **primera versión** de
los modelos (`src/modelos/modelos.ts`), de sus `LIMITES` (`src/modelos/limites.ts`) y de la
tabla de correspondencias (`scripts/divergencias/correspondencias.ts`), a partir del
contrato:

- **Un modelo por esquema**, con el mismo nombre. Fuera quedan `Problema`, que la
  implementación traduce a los errores de la API; `Suscripcion`, que es lo que la
  implementación manda al hub, y los mensajes del hub, que solo envuelven a otros esquemas.
- **Ya a la manera del frontal:** todo `readonly`, las fechas como `Date`, los `enum` como
  uniones de literales, `allOf` como `extends`, y lo que admite `null` como `T | null`.
- **El TSDoc de cada campo**, con su descripción del contrato y el enlace a su límite.
- **Los `LIMITES`, copiados de los del servidor**, y la tabla con cada modelo frente a su
  esquema.

**Es solo para el día 0.** Si los ficheros ya existen, no toca nada. Desde ese momento son
del frontal y se cambian a mano: se renombran (`EventoResumen` pasa a `Evento`), se añaden
los campos calculados, se deciden otros límites… y `npm run divergencias` avisa de cada
separación que no esté declarada en la tabla. Para ver qué saldría sin pisar lo que hay:

```bash
npm run inicializar-modelos -- --destino artifacts/dia0
```

Una prueba lo genera con el contrato de verdad y comprueba que compila y que **no tiene
ninguna divergencia** con el servidor.

## Divergencias con el servidor

Los modelos del frontal **no tienen por qué ser los del servidor**: las fechas son `Date`
y no texto, `comienzo` se llama `fechaHora` en el servidor, `enDirecto` se calcula… Para
eso están los mappers de cada implementación. Lo que interesa es **enterarse** de lo que
diverge, y eso hace `npm run divergencias`: compara los modelos y los `LIMITES` del frontal
con los de [`catalogo-modelos-servidor`](../CatalogoModelosServidor/README.md) y **avisa,
sin fallar**, de:

| Aviso | Ejemplo |
|---|---|
| Un campo del servidor que el frontal no recoge | El servidor añade `Mercado.favorito` |
| Un campo del frontal sin equivalente en el servidor | El frontal añade `Evento.destacado` |
| Valores de un estado que solo tiene uno de los dos | El servidor puede mandar `interrumpido` y el frontal no lo contempla |
| Una constante con otro valor, o que falta en un lado | `LIMITES.Evento.nombre.longitudMaxima`: el frontal dice 80 y el servidor 100 |
| Un modelo del frontal que no está en la tabla | Nadie ha dicho con qué se corresponde |
| Una entrada de la tabla que ya no es verdad | Un campo renombrado que el servidor ya no tiene |

Que un tipo sea distinto **no** avisa. Lo que diverge a propósito se declara, con su
porqué, en [`scripts/divergencias/correspondencias.ts`](scripts/divergencias/correspondencias.ts),
y deja de avisar:

```ts
{
  frontal: "Evento",
  servidor: "EventoResumenServidor",
  esquema: "EventoResumen",
  renombrados: { comienzo: "fechaHora" },
  soloFrontal: { enDirecto: "Se calcula del estado: en juego o interrumpido." },
}
```

Los campos se leen con el compilador de TypeScript (en ejecución los tipos no existen), con
herencias, uniones discriminadas y alias resueltos. `verify` lo ejecuta al final. Los modelos
del servidor son solo dependencia de desarrollo: no llegan a `dist/` ni a quien use la
librería.

## Errores

| Error | Cuándo | Lo lanza | ¿Reintentar? |
|---|---|---|---|
| `ServicioNoDisponibleError` | No responde, tarda más de lo configurado, falla, o se pierde la conexión en tiempo real y no se recupera | Todos | Puede servir |
| `EventoNoEncontradoError` | El evento no existe o ya no se puede ver | `obtenerEvento`, `listarMercados`, `cambios` | No |
| `PeticionIncorrectaError` | Lo pedido no es válido: una página fuera de rango, una clave de grupo mal formada, demasiados mercados. `parametro` dice cuál, si se sabe | `listarEventos`, `listarMercados`, `cambios` | No |
| `SuscripcionDuplicadaError` | Ya hay una suscripción abierta a ese evento: hay que compartir el `Observable` (`share()`) | `cambios` | No |
| `DemasiadasSuscripcionesError` | Ya se siguen todos los eventos que admite el servidor | `cambios` | No, hasta dejar de seguir alguno |
| `ConfiguracionNoValidaError` | La configuración no tiene sentido | Al crear el servicio | No |

- **Son clases**, para distinguirlos con `instanceof`. `ErrorServicioEventos` es la unión de
  todos los que puede lanzar un servicio ya creado.
- **Cada método dice los suyos en su TSDoc** (`@throws`). Los de `cambios` no se lanzan:
  terminan el `Observable` por su `error`.
- **El [TCK](../CatalogoServiciosApiPruebas/README.md) comprueba** que cada implementación
  lanza el que toca en cada caso que se puede provocar desde fuera.

## rxjs

Es **dependencia par** (`peerDependencies`): la pone la aplicación. Si cada librería trajera
la suya, habría dos copias de RxJS y los `Observable` de una no serían los de la otra.

## Trabajar con él

Se instala desde la raíz del proyecto, una vez para todos los paquetes (ver
[*El frontal y los contratos*](../../../README.md#el-frontal-y-los-contratos-npm-workspaces)):

```bash
# Una vez, en la raíz del proyecto (proyecto/):
npm install
npm run build
# Y en esta carpeta:
npm run build        # dist/: lo que usan la implementación y las aplicaciones
npm run verify       # tipos, ESLint, Prettier, pruebas con cobertura y divergencias
```

| Script | Qué hace |
|---|---|
| `build` | Compila a `dist/`. **Hay que hacerlo antes de usarla desde otro proyecto** |
| `tipos` | Comprueba los tipos sin compilar |
| `lint` / `lint:fix` | ESLint con las reglas con información de tipos (`strictTypeChecked`) |
| `format` / `format:check` | Prettier |
| `test` | Mocha (con tsx, rápido, para el día a día) |
| `cobertura` | Las pruebas sobre lo compilado por tsc, con c8: umbral del 90 % |
| `divergencias` | Avisa de en qué no coinciden los modelos y los `LIMITES` con los del servidor |
| `inicializar-modelos` | Día 0: los modelos, los `LIMITES` y la tabla de correspondencias, desde el contrato. No pisa nada |
| `verify` | Todo lo anterior: lo que tiene que pasar antes de subir |
| `sonar` | Análisis en SonarQube: `SONAR_TOKEN=… npm run sonar`, después de `cobertura` |

**Uso desde otro paquete del proyecto:** `"@apuestas-deportivas/catalogo-servicios-api":
"0.0.0"`, y que esté en los workspaces de la raíz: npm enlaza la carpeta, sin registro.
Cuando esté el registro de GitLab, la misma línea vale para instalarla de allí.

**La cobertura se mide sobre lo que compila `tsc`**, no sobre lo que ejecuta tsx: tsx
añade funciones auxiliares que descuadran la cobertura y dan por no ejecutado código que
sí lo está. `index.ts` queda fuera porque solo reexporta; del detector se miden
`comparar.ts` y `extraer.ts`, y del día 0, `generar.ts`: son la lógica.

## Dónde está cada cosa

En la raíz solo lo que tiene que estar ahí: `package.json` (npm), `tsconfig.json` (VS Code
lo busca en la raíz para el autocompletado y los errores), `.gitignore` (git), y el README
y el CHANGELOG. El resto de la configuración está en `config/`, y los scripts se la pasan
con su ruta:

| Fichero | De qué |
|---|---|
| `config/tsconfig.build.json` | La compilación a `dist/`: solo extiende la común |
| `config/tsconfig.cobertura.json` | La compilación con la que se mide la cobertura: extiende la común, más los scripts del detector y del día 0 |
| `config/mocharc.cjs` | Mocha para el día a día: reexporta la común (la de la cobertura la pone `configuracion-frontal cobertura`) |
| `config/c8rc.json` | c8: **solo qué se mide**. Umbrales e informes son los comunes, y los junta `configuracion-frontal cobertura` |
| `config/eslint.config.mjs` | ESLint: una llamada a la configuración común |

Lo común (Prettier, la base de TypeScript, los umbrales de cobertura y SonarQube) está en [Configuracion](../../Comun/Configuracion/README.md). Prettier se indica con la clave `prettier` de `package.json`, y Sonar no tiene fichero: `configuracion-frontal sonar` saca la clave del nombre del paquete.
