# @apuestas-deportivas/catalogo-estado

El estado del catálogo con Redux Toolkit, **sin React**: eventos, grupos, mercados y
selecciones, al día con los cambios en tiempo real. Lo puede usar una aplicación React, una
de Electron o una de consola.

## Cómo se montó desde cero (desde `proyecto/`)

```bash
npm init -y -w frontal/Apuestas/CatalogoEstado
npm pkg set name=@apuestas-deportivas/catalogo-estado version=0.0.0 type=module -w frontal/Apuestas/CatalogoEstado
npm install --save-exact @reduxjs/toolkit@2.14.0 -w frontal/Apuestas/CatalogoEstado
npm install --save-exact @apuestas-deportivas/catalogo-servicios-api@0.0.0 -w frontal/Apuestas/CatalogoEstado
npm install --save-peer rxjs@^7.8.0 -w frontal/Apuestas/CatalogoEstado
npm install -D --save-exact typescript@5.9.3 tsx@4.23.15 mocha@12.0.3 chai@6.3.0 c8@12.0.0 eslint@10.14.0 prettier@3.9.10 @types/node@24.19.2 @types/mocha@10.0.10 @types/chai@5.2.3 @apuestas-deportivas/configuracion-frontal@0.0.0 @apuestas-deportivas/catalogo-servicios-impl@0.0.0 @apuestas-deportivas/catalogo-backend-fake@0.0.0 -w frontal/Apuestas/CatalogoEstado
```

La Impl y el fake se instalan como dependencias de desarrollo **solo para la prueba de
sistema**. El paquete en sí depende únicamente de la API.

## En qué orden leerlo

| Fichero | Qué es |
|---|---|
| `src/estado.ts` | La forma del estado, con un bloque por slice: `catalogo` y `evento` |
| `src/catalogo/catalogo.ts` | Slice del catálogo: sus acciones (eventos que pasan) y sus reducers |
| `src/evento/evento.ts` | Slice del evento abierto, incluido `cambioRecibido` (tiempo real) |
| `src/selectores/selectores.ts` | Cómo se lee el estado: selectores simples y uno memorizado |
| `src/efectos/efectos.ts` | Escuchan acciones, llaman al servicio y emiten otras acciones |
| `src/store.ts` | Junta todo: `crearStore(servicio)` |
| `tests/sistema/tiempo-real.test.ts` | El store contra el backend fake: una cuota cambia en el servidor y llega sola |

## Ejecutarlo

```bash
npm test -w frontal/Apuestas/CatalogoEstado       # unitarias
npm run sistema -w frontal/Apuestas/CatalogoEstado # contra el backend fake
npm run verify -w frontal/Apuestas/CatalogoEstado  # tipos, lint, formato, cobertura y sistema
```

## Tres tropiezos, y por qué el código es así

1. **`readonly` contra Immer.** Los modelos de la API son `readonly` hasta el fondo, y el
   borrador de Immer es mutable. Por eso, lo que viene del servicio se mete **devolviendo el
   estado nuevo** (`return { ...estado, eventos: [...payload] }`), y los campos sueltos se
   cambian directamente en el borrador.
2. **Las fechas.** Sin el `serializableCheck` de `store.ts`, RTK avisa en cada acción que
   lleve un `Date`.
3. **Las rutas de Mocha.** Si a `mocha --config x` se le pasa una ruta, la **añade** a las de
   la configuración en vez de sustituirlas. Por eso las pruebas de sistema tienen su propio
   `config/mocharc.sistema.cjs`.

Además:

- Las peticiones funcionan como *takeLatest*: `cancelActiveListeners` cancela la anterior y
  `pause` descarta su respuesta.
- El lint prohíbe importar React en este paquete.

## Limitación de esta v1

Los mercados de un grupo llegan con **su propia marca**, más nueva que la del detalle, pero
los cambios se siguen desde la marca del detalle. Por tanto, si un cambio anterior a la marca
de los mercados llegara **después** de cargarlos, podría volver a poner una cuota antigua. Con
el fake no pasa. Para resolverlo de verdad, el contrato tendría que decir si las marcas se
pueden comparar; hoy son opacas.
