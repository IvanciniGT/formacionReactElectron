# CatalogoServiciosImpl

`@apuestas-deportivas/catalogo-servicios-impl`

La implementación de [`ServicioEventos`](../CatalogoServiciosApi/README.md) contra el
backend real: **REST con `fetch`** y **cambios en tiempo real con SignalR**. Aquí sí están
los modelos del servidor y la conversión a los del frontal.

```ts
import { crearServicioEventos } from "@apuestas-deportivas/catalogo-servicios-impl";

const servicio = crearServicioEventos({
  urlBase: "https://apuestas.ejemplo",
  tiempoMaximoPeticionMs: 5000,
  esperasReconexionMs: [0, 2000, 10000, 30000],
  nivelDeRegistro: "aviso",
});
const evento = await servicio.obtenerEvento(id);
const suscripcion = servicio.cambios(evento.id, evento.marca).subscribe((cambio) => { … });
// …
suscripcion.unsubscribe();
```

## Configuración

**La configuración es de la API, no de aquí**: `ConfiguracionServicioEventos`,
`comprobarConfiguracion` y `ConfiguracionNoValidaError` están en
[CatalogoServiciosApi](../CatalogoServiciosApi/README.md), con lo que significa cada campo.
Esta librería exporta `crearServicioEventos`, con la forma que la API define
(`CrearServicioEventos`), y la comprueba al crear el servicio.

Lo que aquí significa cada campo:

| Campo | En esta implementación |
|---|---|
| `urlBase` | El REST cuelga de ahí, y el hub en `/v1/hubs/catalogo` |
| `tiempoMaximoPeticionMs` | `AbortSignal.timeout` de cada `fetch` |
| `esperasReconexionMs` | `withAutomaticReconnect` de SignalR |
| `nivelDeRegistro` | El nuestro y el de SignalR (`configureLogging`) |

Lo que no es configuración sino colaboradores (otro `fetch`, otra conexión, otro
registrador) va en el segundo parámetro de `ServicioEventosHttp`, `DependenciasServicioEventos`.

## Cómo está hecho

| Pieza | Qué hace |
|---|---|
| `mappers/mappers.ts` | Del servidor al frontal, y el filtro a parámetros de la URL. Los modelos del servidor, REST y hub, vienen de [`catalogo-modelos-servidor`](../CatalogoModelosServidor/README.md), generados del contrato |
| `registro/registro.ts` | `Registrador`, el filtro por nivel y el nivel equivalente de SignalR |
| `conexion/conexion.ts` | `ConexionTiempoReal`, lo único que el servicio necesita de una conexión en tiempo real, y el adaptador sobre el `HubConnection` de Microsoft |
| `conexion/conexion-signalr.ts` | La única función que construye SignalR de verdad |
| `servicios/servicio-eventos-http.ts` | `ServicioEventosHttp` |

- **Una sola conexión SignalR** para todos los eventos, que se abre con la primera
  suscripción. Cada mensaje dice de qué evento es.
- **Al reconectar, vuelve a suscribirse a cada evento desde la última marca recibida**:
  SignalR no conserva las suscripciones de una conexión a otra.
- **Una suscripción por evento a la vez.** El servidor guarda una por evento y conexión, y
  una segunda sustituiría a la primera sin avisar. Si dos componentes necesitan el mismo
  evento, que compartan el `Observable` (`share()` de RxJS).
- **Los errores REST se deciden por su `codigo`**, no por el status: un 404 sin código
  (un proxy, una `urlBase` que no es la del backend) es `ServicioNoDisponibleError`, no un
  evento que no existe.
- **Los errores del hub** llegan como texto con un código al principio
  (`EventoNoEncontrado`, `DemasiadasSuscripciones`, ver `asyncapi.yaml`), y se traducen a
  los errores de la API.
- **Si se pierde la conexión y no se recupera** (se agotan las esperas de reconexión),
  las suscripciones abiertas terminan con `ServicioNoDisponibleError`, en vez de quedarse
  esperando, y la siguiente suscripción vuelve a abrir la conexión.
- `cerrar()` termina las suscripciones y cierra la conexión.

## Mappers a mano

No hay una librería tipo MapStruct, y no compensa: en TypeScript los tipos no existen en
ejecución, así que no hay de dónde generar el mapeo. Los mappers son funciones puras con
tipo de entrada (generado del contrato) y de salida (el modelo del frontal): si el
contrato cambia, el compilador marca la línea exacta.

## Pruebas

| Tipo | Con qué | Contra qué |
|---|---|---|
| **Unitarias** (`tests/unitarias/`) | Mocha + Chai + Sinon, cobertura con c8 (umbral 90 %) | Un `fetch` falso y una `ConexionTiempoReal` falsa: sin red ni SignalR |
| **Sistema, caja negra** (el [TCK](../CatalogoServiciosApiPruebas/README.md)) | Cucumber, en español | Lo que elija el perfil: por defecto, el [backend fake](../CatalogoBackendFake/README.md) |
| **Sistema, caja blanca** (`tests/sistema/`) | Cucumber, en español | El backend fake, mirando dentro de él |

**Las de caja negra no son de esta librería**: son las que tiene que pasar cualquier
implementación de `ServicioEventos`, y vienen del paquete del TCK. Aquí solo se dice
contra qué se ejecutan, en `tests/sistema/soporte/`:

- `registrar.ts`: elige el entorno según `PERFIL_PRUEBAS` y le pasa a `registrarPruebas`
  el Cucumber de esta librería y su `crearServicioEventos`. El TCK crea el servicio con
  esa fábrica: se prueba exactamente lo que usará la aplicación.
- El entorno del perfil `fake` es `EntornoFake`, del propio
  [backend fake](../CatalogoBackendFake/README.md) (`…/catalogo-backend-fake/pruebas`):
  vale para cualquier implementación, no solo para esta.

**Los mismos escenarios del TCK son de sistema o de integración según el perfil**
(`PERFIL_PRUEBAS`):

| Script | Perfil | Contra qué | Qué se ejecuta |
|---|---|---|---|
| `npm run sistema` | `fake` | El backend fake, arrancado y controlado por cada escenario | Todo |
| `URL_BACKEND=https://… npm run integracion` | `remoto` | El backend de verdad, desplegado | Lo que no necesita controlar el backend; lo demás sale saltado |

`integracion` no va en `verify`: necesita el backend desplegado. Sin `URL_BACKEND`, o con un
perfil que no existe, falla al empezar diciendo qué falta.

**Las de caja blanca** (`caja-blanca.feature`) comprueban lo que desde fuera no se ve o
no se puede provocar: que al dejar de ver un evento el servidor da la suscripción por
cancelada, que tras un corte de red se recupera lo que cambió mientras tanto, y que si el
backend se cae y no vuelve, la suscripción termina con error.

El aviso `WebSocket closed with status code: 1006` que sale al ejecutarlas es de ese
corte, provocado a propósito.

**Cómo se prueba SignalR:** no se prueba SignalR, que es de Microsoft; se prueba lo nuestro
aislándolo de él. `ServicioEventosHttp` no conoce SignalR, solo `ConexionTiempoReal`:

1. **Nuestra lógica** (qué se invoca, cómo se reacciona a cada mensaje, la marca, la
   reconexión, la cancelación) se prueba con una conexión **falsa**.
2. **El adaptador** se prueba con `sinon.createStubInstance(HubConnection)`: que cada
   método llama al que toca.
3. **Que todo funciona de verdad**, en las de sistema: el cliente oficial contra un hub que
   habla el protocolo real.

`conexion/conexion-signalr.ts` (construir el `HubConnection`) e `index.ts` (reexportar) quedan fuera
de la cobertura unitaria: no tienen lógica nuestra, y los ejercitan las de sistema.

## Trabajar con él

Necesita construidos sus vecinos, en local:

```bash
(cd ../CatalogoModelosServidor && npm install && npm run build)
(cd ../CatalogoServiciosApi && npm install && npm run build)
(cd ../CatalogoBackendFake && npm install)
(cd ../CatalogoServiciosApiPruebas && npm install)
npm install
npm run verify       # tipos, ESLint, Prettier, unitarias con cobertura y sistema
```

| Script | Qué hace |
|---|---|
| `build` | Compila a `dist/` |
| `test` | Las unitarias (Mocha con tsx) |
| `cobertura` | Las unitarias sobre lo compilado por tsc, con c8 |
| `integracion` | Cucumber: el TCK contra el backend de `URL_BACKEND`. Informe en `artifacts/informes/integracion.html` |
| `sistema` | Cucumber: el TCK y las de caja blanca, contra el backend fake. Informe en `artifacts/informes/` (HTML y JUnit) |
| `verify` | Todo: lo que tiene que pasar antes de subir |
| `sonar` | Análisis en SonarQube: `SONAR_TOKEN=… npm run sonar`, después de `cobertura` |

Las dependencias propias van por ruta (`file:../CatalogoServiciosApi`, `file:../CatalogoModelosServidor`,
`file:../CatalogoBackendFake`, `file:../CatalogoServiciosApiPruebas`): npm enlaza las carpetas, sin registro. Cuando esté el
registro de GitLab, se cambian por versiones.

## Dónde está cada cosa

En la raíz solo lo que tiene que estar ahí: `package.json` (npm), `tsconfig.json` (VS Code
lo busca en la raíz para el autocompletado y los errores), `.gitignore` (git), y el README
y el CHANGELOG. El resto de la configuración está en `config/`, y los scripts se la pasan
con su ruta:

| Fichero | De qué |
|---|---|
| `config/tsconfig.build.json` | La compilación a `dist/` |
| `config/tsconfig.cobertura.json` | La compilación con la que se mide la cobertura |
| `config/mocharc.json` · `config/mocharc.cobertura.json` | Mocha, para el día a día y para la cobertura |
| `config/c8rc.json` | c8: qué se mide, umbrales e informes |
| `config/cucumber.json` | Cucumber (solo en la implementación) |
| `config/eslint.config.mjs` · `config/prettier.config.json` | ESLint y Prettier |
| `config/sonar-project.properties` | SonarQube |
