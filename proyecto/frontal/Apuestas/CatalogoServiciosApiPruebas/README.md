# CatalogoServiciosApiPruebas

`@apuestas-deportivas/catalogo-servicios-api-pruebas`

El **TCK** de [`ServicioEventos`](../CatalogoServiciosApi/README.md): las pruebas de
sistema que tiene que pasar **cualquier** implementación. Son de caja negra: solo usan la
interfaz, así que valen igual para la que va por `fetch` y SignalR que para la que venga
después.

Están aquí, y no en cada implementación, porque describen lo que promete la API. Si
estuvieran en la implementación, cada una se haría las suyas, y nadie comprobaría que
todas cumplen lo mismo.

## Qué hay

| Carpeta | Qué |
|---|---|
| `features/` | Los escenarios, en español: `catalogo.feature` (consultas), `tiempo-real.feature` (cambios), `errores.feature` (qué error da cada cosa que sale mal) y `configuracion.feature` (qué configuración se rechaza al crear el servicio) |
| `src/pasos/` | Sus pasos, escritos solo contra `ServicioEventos` |
| `src/soporte/entorno.ts` | `EntornoDePruebas`: el backend contra el que se ejecuta |
| `src/soporte/mundo.ts` | Lo que comparten los pasos de un escenario, y ayudas como `esperarA` |
| `src/registrar.ts` | `registrarPruebas`, el punto de entrada |
| `datos/catalogo.json` | El catálogo con el que arranca cada escenario. También con el que arranca el backend fake con `npm start`: hay uno solo |

## Sistema o integración: depende de contra qué

Los escenarios son siempre los mismos. **Lo que los hace una prueba u otra es el entorno:**

| Entorno | Qué es | Qué demuestra |
|---|---|---|
| `EntornoFake` (del [backend fake](../CatalogoBackendFake/README.md)) | Prueba de **sistema** de la implementación | Que cumple el contrato, con lo de fuera sustituido por un doble controlado |
| `EntornoRemoto(url)` (de aquí) | Prueba de **integración** | Que la implementación y el backend de verdad encajan |

Las **unitarias** son otra cosa: las de cada implementación, por dentro y sin red. El TCK
siempre va por la red.

**No todo se puede hacer contra un backend de verdad.** Casi todos los escenarios necesitan
cargar los datos de prueba o provocar cambios, y eso solo lo puede hacer un entorno que
controle el backend (`controlaElBackend`). Esos escenarios llevan
**`@controla-el-backend`**: contra un entorno que no puede, se saltan, y en el informe salen
como saltados, no como pasados. Los demás (configuración, errores que no dependen de los
datos, backend caído, URL que no es la del backend) se ejecutan siempre.

## Lo que pone quien lo ejecuta

Dos cosas, y nada más:

- **La fábrica de su implementación** (`CrearServicioEventos`, la forma que define la API).
  El TCK crea el servicio con ella en cada escenario, con `CONFIGURACION_DE_PRUEBA` y la URL
  del entorno, y lo cierra al acabar. Se prueba exactamente lo que usará la aplicación.
- **Un entorno**: el backend contra el que se ejecuta.

## El entorno

Una prueba de caja negra no sabe provocar que cambie una cuota: eso pasa en el backend.
Así que el TCK se lo pide al entorno, a través de `EntornoDePruebas`. El entorno no sabe
nada de la implementación: el mismo vale para todas. El del backend fake es `EntornoFake`,
de [CatalogoBackendFake](../CatalogoBackendFake/README.md).

| Método | Qué tiene que hacer |
|---|---|
| `controlaElBackend` | Decir si puede cargar los datos y provocar cambios |
| `arrancar(datos)` | Dejar un backend con esos datos y devolver su URL base |
| `parar()` | Liberarlo todo |
| `cambiarCuota`, `cambiarEstadoMercado`, `cambiarEstadoEvento` | Provocar ese cambio en el backend |
| `suscripcionRegistrada(evento)` | Esperar a que el backend tenga la suscripción, para que el cambio siguiente le llegue |

Todo se nombra como lo lee una persona (el evento por su nombre, la selección por su
descripción), no por id: los ids son cosa de cada backend.

Cada escenario crea su entorno y lo arranca: ninguno depende de otro.

**Un backend caído se simula desde fuera**: el servicio se crea apuntando a un puerto donde
no escucha nadie. Así no hace falta que el entorno sepa pararlo, y vale igual contra un
backend remoto. Lo que solo se puede provocar desde dentro (que se caiga con una
suscripción abierta, demasiadas suscripciones) es caja blanca de cada implementación.

## Cómo se usa desde una implementación

```ts
// tests/sistema/soporte/registrar.ts
import { EntornoFake } from "@apuestas-deportivas/catalogo-backend-fake/pruebas";
import { registrarPruebas } from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import * as cucumber from "@cucumber/cucumber";
import { crearServicioEventos } from "../../../src/index.js";

registrarPruebas({
  cucumber,
  crearEntorno: () => new EntornoFake(),
  crearServicio: crearServicioEventos,
  // configuracion: { tiempoMaximoPeticionMs: 5000 },   // opcional: cambia CONFIGURACION_DE_PRUEBA
});
```

**Se le pasa el Cucumber, no lo importa.** Si el TCK registrara los pasos en su propia
copia de `@cucumber/cucumber`, la implementación, que ejecuta la suya, no los vería. Por
eso Cucumber es `peerDependency`.

Y en su `cucumber.json`, los `.feature` del TCK junto a los suyos:

```json
"paths": [
  "node_modules/@apuestas-deportivas/catalogo-servicios-api-pruebas/features/**/*.feature",
  "tests/sistema/**/*.feature"
]
```

Las pruebas de caja blanca de la implementación pueden usar el mismo mundo
(`MundoCatalogo`) y las mismas ayudas (`esperarA`), y mirar dentro de su entorno. Un
ejemplo es [CatalogoServiciosImpl](../CatalogoServiciosImpl/README.md).

## Trabajar con él

Se instala desde la raíz del proyecto, una vez para todos los paquetes (ver
[*El frontal y los contratos*](../../../README.md#el-frontal-y-los-contratos-npm-workspaces)):

```bash
# Una vez, en la raíz del proyecto (proyecto/):
npm install
npm run build
# Y en esta carpeta:
npm run verify       # tipos, ESLint y Prettier
```

No ejecuta pruebas por sí mismo: no tiene implementación contra la que hacerlo. Las
ejecuta cada implementación con `npm run sistema`.

Se exporta el código TypeScript directamente, como el backend fake: solo lo usan pruebas
que corren con tsx.
