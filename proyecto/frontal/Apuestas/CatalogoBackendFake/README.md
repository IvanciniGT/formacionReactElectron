# CatalogoBackendFake

Un **fake del backend del catálogo**, en TypeScript. En la clasificación de dobles de prueba
es un *fake*: una implementación que funciona de verdad, pero con un atajo (los datos en
memoria en vez de en una base de datos). No es un *stub* (no devuelve respuestas fijas:
calcula) ni un *mock* (no comprueba llamadas). Sirve el API REST de
[`openapi.yaml`](../../../contratos/Apuestas/Catalogo/openapi.yaml) y el hub SignalR de
[`asyncapi.yaml`](../../../contratos/Apuestas/Catalogo/asyncapi.yaml), con los datos de prueba del
[TCK](../CatalogoServiciosApiPruebas/datos/catalogo.json). Es para las pruebas de sistema y
para probar los frontales a mano. No se publica.

Los datos no son suyos a propósito: son los que esperan los escenarios del TCK, y el TCK
tiene que poder cargarlos también en el backend de verdad, donde el fake no existe. Con un
solo catálogo de prueba no hay dos copias que se separen.

## Por qué no json-server

json-server sirve un JSON como un API de tipo CRUD (`/eventos/:id`). Este contrato tiene
respuestas **calculadas**: el mercado principal dentro de cada evento, los grupos con su
número de mercados, la marca, los cambios desde una marca… Y para WebSocket no hay un
equivalente, y menos para SignalR, que tiene su propio protocolo.

## Arrancarlo a mano

Se instala desde la raíz del proyecto, una vez para todos los paquetes (ver
[*El frontal y los contratos*](../../../README.md#el-frontal-y-los-contratos-npm-workspaces)):

```bash
# Una vez, en la raíz del proyecto (proyecto/):
npm install
npm run build
# Y en esta carpeta:
npm start -- --puerto 5080 --mover-cada-ms 3000
```

Sirve en `http://127.0.0.1:5080` y mueve una cuota al azar cada 3 segundos, para ver la
web moverse. Con `--mover-cada-ms 0`, las cuotas quedan quietas.

## Desde las pruebas

```ts
import { arrancarBackendFake } from "@apuestas-deportivas/catalogo-backend-fake";

const backend = await arrancarBackendFake({ puerto: 0, moverCuotasCadaMs: 0 });
const eventoId = backend.catalogo.buscarEventoPorNombre("Real Madrid - FC Barcelona");
const { seleccionId } = backend.catalogo.buscarSeleccionPorDescripcion(eventoId, "Empate");
backend.catalogo.cambiarCuota(seleccionId, 3.6);   // les llega a los suscritos
await backend.parar();
```

## Como entorno del TCK

`EntornoFake` (en `…/catalogo-backend-fake/pruebas`) es el `EntornoDePruebas` del
[TCK](../CatalogoServiciosApiPruebas/README.md) sobre este backend: uno nuevo por
escenario, en un puerto libre y con las cuotas quietas. No sabe nada de la implementación
que se prueba, así que vale para cualquiera. Su `backend` queda a la vista para las pruebas
de caja blanca.

El TCK es dependencia par opcional: solo hace falta para usar `EntornoFake`, y lo pone quien
ejecuta el TCK.

Para las pruebas de caja blanca, además:

| | |
|---|---|
| `backend.suscritosA(eventoId)` | Cuántas conexiones siguen ese evento ahora mismo |
| `backend.cortarConexiones()` | Corta todas las conexiones en tiempo real, como una caída de red |

Se exporta el código TypeScript directamente: solo lo usan pruebas que corren con tsx.

## Cómo está hecho

| Fichero | Qué es |
|---|---|
| `catalogo/catalogo.ts` | El estado en memoria, las consultas del contrato, la marca y el registro de cambios. Responde con los modelos de [`catalogo-modelos-servidor`](../CatalogoModelosServidor/README.md), generados del contrato: si el contrato cambia, no compila |
| `servidor/http.ts` | El REST, sin framework: cinco rutas de lectura, errores en `problem+json`, y CORS para que lo use una web en otro puerto |
| `servidor/signalr.ts` | El hub, hablando el protocolo de SignalR (negociación, saludo, invocaciones, *pings*) lo justo para que el cliente oficial no note diferencia |
| `index.ts` | `arrancarBackendFake` |
| `main.ts` | El arranque desde la línea de órdenes |
| `pruebas/entorno-fake.ts` | `EntornoFake`, el entorno del TCK |

## Pruebas

```bash
npm run verify       # tipos, ESLint, Prettier y pruebas con cobertura
```

La cobertura se mide solo sobre **`catalogo.ts`**, que es la lógica. Los servidores
(`http.ts`, `signalr.ts`) no tienen sentido sin un cliente de verdad: los ejercitan las
pruebas de sistema de [`CatalogoServiciosImpl`](../CatalogoServiciosImpl/README.md), con
`fetch` y el cliente oficial de SignalR.

## Dónde está cada cosa

En la raíz solo lo que tiene que estar ahí: `package.json` (npm), `tsconfig.json` (VS Code
lo busca en la raíz para el autocompletado y los errores), `.gitignore` (git), y el README
y el CHANGELOG. El resto de la configuración está en `config/`, y los scripts se la pasan
con su ruta:

| Fichero | De qué |
|---|---|
| `config/tsconfig.cobertura.json` | La compilación con la que se mide la cobertura: extiende la común |
| `config/mocharc.cjs` | Mocha para el día a día: reexporta la común (la de la cobertura la pone `configuracion-frontal cobertura`) |
| `config/c8rc.json` | c8: **solo qué se mide**. Umbrales e informes son los comunes, y los junta `configuracion-frontal cobertura` |
| `config/eslint.config.mjs` | ESLint: una llamada a la configuración común |

Lo común (Prettier, la base de TypeScript, los umbrales de cobertura y SonarQube) está en [Configuracion](../../Comun/Configuracion/README.md). Prettier se indica con la clave `prettier` de `package.json`, y Sonar no tiene fichero: `configuracion-frontal sonar` saca la clave del nombre del paquete.
