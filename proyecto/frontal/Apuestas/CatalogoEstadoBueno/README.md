# @apuestas-deportivas/catalogo-estado-bueno

El estado del catálogo con Redux Toolkit, **sin React**: eventos, grupos, mercados y
selecciones, al día con los cambios en tiempo real.

Es una **librería**: no crea ningún store. Entrega un slice (su reducer, la clave en la que
va y sus efectos) para que quien la use lo inyecte en el suyo. Será una aplicación React,
Electron o de consola, y hoy son las pruebas.

## Estructura

La librería es **un slice**, `catalogo`. Su estado tiene dos propiedades, `listado` y
`evento`, y cada pieza del slice está en su fichero:

```
src/
├── estado.ts       EstadoCatalogo = { listado, evento }, y sus valores iniciales
├── acciones.ts     las 14 acciones, y accionesCatalogo con todas ellas
├── reducer.ts      un reducer por propiedad, y reducerCatalogo que los junta
├── efectos.ts      acción → servicio → otra acción
├── selectores.ts   cómo se lee
├── modulo.ts       lo que se inyecta: { reducerPath: "catalogo", reducer, middleware }
└── index.ts        lo que exporta la librería
tests/
├── store-de-prueba.ts   un store anfitrión, como hará la aplicación el día que exista
├── unitarias/           reducer, selectores, efectos e inyección
└── sistema/             contra el backend fake: una cuota cambia y llega sola
```

Las acciones son las mismas que en `catalogo-estado`, con los mismos `type`. La diferencia
está en cómo se declaran: aquí se usan `createAction` y `createReducer`, cada uno en su
fichero, en vez de `createSlice`, que junta las acciones y el reducer.

## Inyectarlo en un store

Este es el mecanismo estándar de RTK 2: `combineSlices` para los reducers y
`createDynamicMiddleware` para los efectos.

```ts
const raiz = combineSlices(/* lo que esté desde el principio */)
  .withLazyLoadedSlices<EstadoConCatalogo>();       // lo que se podrá inyectar después
const dinamicos = createDynamicMiddleware();
const store = configureStore({
  reducer: raiz,
  middleware: (porDefecto) => porDefecto(/* admitir Date */).prepend(dinamicos.middleware),
});

// Cuando haga falta el catálogo:
const modulo = crearModuloCatalogo(servicio);
raiz.inject(modulo);                                 // su estado, en estado.catalogo
dinamicos.addMiddleware(modulo.middleware);          // sus efectos
```

Hasta que se inyecta, los selectores leen el catálogo como recién creado. Eso es lo que hace
`seleccionarCatalogo`, y lo mismo hacen los slices de RTK inyectados así.

`tests/store-de-prueba.ts` es justo esto, con otro slice (`usuarios`) al lado para comprobar
que conviven.

## Ejecutarlo (desde `proyecto/`)

```bash
npm test -w frontal/Apuestas/CatalogoEstadoBueno
npm run sistema -w frontal/Apuestas/CatalogoEstadoBueno
npm run verify -w frontal/Apuestas/CatalogoEstadoBueno
```
