# @apuestas-deportivas/catalogo-componentes

Componentes React del catálogo. **No es una aplicación**: cada aplicación los monta en la
suya. De momento hay dos, el listado de eventos y su item; el filtro vendrá después.

## Qué hay

| Componente                | Qué es                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `ListadoEventosItem`      | Un evento: tipo, nombre, cuándo empieza (o «En directo») y las cuotas de su mercado principal. Avisa con `onAbrir(id)`   |
| `ListadoEventos`          | La lista de items, con sus estados: cargando, error, vacío. Recibe los eventos por props y avisa con `onAbrirEvento(id)` |
| `ListadoEventosConectado` | El mismo listado, con las props sacadas del slice `catalogo` (`catalogo-estado-bueno`)                                   |

Los dos primeros son **presentacionales**: no saben de Redux y sirven en cualquier aplicación.
Solo el conectado sabe que hay un store, y necesita un `<Provider>` con el slice `catalogo`
inyectado. El conectado **no pide los eventos**: los pide quien lo use (la aplicación al
arrancar, un filtro…) con `solicitarListadoEventos`, y el listado enseña lo que haya.

## Una pieza por fichero

Cada componente, en su carpeta, separa la plantilla, la lógica y los estilos:

```
src/ListadoEventosItem/
├── ListadoEventosItem.tsx         la plantilla (JSX): solo coloca lo que le dan
├── useListadoEventosItem.ts       la lógica, en un hook: deja los datos listos para pintar
└── ListadoEventosItem.module.css  los estilos (CSS Modules: las clases no se pisan)
```

Los colores son variables CSS con un valor por defecto (`--catalogo-directo`,
`--catalogo-sube`…): la aplicación los cambia sin tocar los componentes.

## Usarlo

```tsx
import "@apuestas-deportivas/catalogo-componentes/estilos.css"; // una vez, en la aplicación
import { ListadoEventos } from "@apuestas-deportivas/catalogo-componentes";

<ListadoEventos eventos={eventos} carga="listo" onAbrirEvento={abrir} />;
```

## Las carpetas

```
src/          los componentes (lo único que se publica)
tests/        las unitarias: Vitest + Testing Library, sobre jsdom
dobles/       para probar sin backend
├── datos.ts                 4 eventos, uno por caso: por empezar, en directo,
│                            suspendido y sin mercado
├── servicio-en-memoria.ts   un ServicioEventos con esos datos en RAM
└── store-de-prueba.ts       un store con el slice «catalogo» inyectado
app-pruebas/  la app de pruebas manual: una ruta por componente
```

## Ejecutarlo (desde `proyecto/`)

```bash
npm run app -w frontal/Apuestas/CatalogoComponentes     # la app de pruebas, en http://localhost:5173
npm test -w frontal/Apuestas/CatalogoComponentes        # unitarias
npm run verify -w frontal/Apuestas/CatalogoComponentes  # tipos, lint, formato y cobertura
npm run build -w frontal/Apuestas/CatalogoComponentes   # dist/: index.js, estilos.css y los .d.ts
```

## Por qué Vite y Vitest, y no mocha como el resto

Mocha no entiende JSX ni los `import` de `.module.css`, y la app de pruebas necesita un
servidor de desarrollo. Vite hace las dos cosas, y Vitest usa su misma configuración. El
ESLint, el Prettier y los umbrales de cobertura son los comunes del frontal.
