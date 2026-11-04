# CatalogoModelosServidor

`@apuestas-deportivas/catalogo-modelos-servidor`

**Lo que manda y recibe el servidor del catálogo**, como tipos de TypeScript, y **sus
límites como constantes**. Todo se genera del
[contrato](../../../contratos/Apuestas/Catalogo/README.md): no se escribe nada a mano.

Lo usan quienes hablan con el servidor: el [backend fake](../CatalogoBackendFake/README.md)
para responder, y la [implementación](../CatalogoServiciosImpl/README.md) para entender lo
que le responden. Así los dos usan los mismos tipos, y si el contrato cambia, los dos dejan
de compilar en el mismo sitio. La [API](../CatalogoServiciosApi/README.md) lo usa solo para
detectar en qué difieren de ellos los modelos del frontal.

**Los componentes de pantalla no lo usan nunca.** Trabajan con los modelos del frontal, que
son otros.

## Qué hay

```ts
import type {
  EventoResumenServidor,   // REST: lo que trae GET /v1/eventos
  CambiosServidor,         // Hub: el mensaje Cambios
} from "@apuestas-deportivas/catalogo-modelos-servidor";
import { LIMITES_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor";

LIMITES_SERVIDOR.EventoResumen.nombre   // { longitudMinima: 3, longitudMaxima: 100, invariante: "NombreEvento (…)" }
```

| Fichero | Qué |
|---|---|
| `src/modelos/rest.ts` | Los esquemas de `openapi.yaml`, con nombre: `TipoEventoServidor`, `MercadoServidor`… |
| `src/modelos/hub.ts` | Los mensajes de `asyncapi.yaml`: `SuscripcionServidor`, `CambiosServidor`, `RecargarServidor`… |
| `src/generado/contrato.ts` | Lo que genera `openapi-typescript`: `components`, `paths`, `operations` |
| `src/generado/esquemas.ts` | `ESQUEMAS_SERVIDOR`, los esquemas combinados, en `…/catalogo-modelos-servidor/esquemas`: para inicializar los modelos del frontal |
| `src/generado/limites.ts` | `LIMITES_SERVIDOR`: por esquema y campo, longitudes, patrón, mínimo, decimales y máximo de elementos |

- **Todo termina en `Servidor`**, para que nunca se confunda con el modelo del frontal que
  se llama igual y no es lo mismo.
- **Todo es `readonly`**: lo que manda el servidor no se modifica; se convierte.
- `src/generado/` no se sube a git: se regenera con `npm run generar`, y antes de compilar
  o probar.

## Cómo se generan los del hub

No hay un generador de AsyncAPI a TypeScript que no arrastre medio mundo, y no hace falta:
los mensajes de `asyncapi.yaml` ya son JSON Schema, y casi todo lo que usan son esquemas de
`openapi.yaml`. `scripts/combinar.ts` junta los dos ficheros en un solo documento OpenAPI,
con los mensajes como `Mensaje<Nombre>`, y `openapi-typescript` lo genera todo de una vez.
Si los dos ficheros definen un esquema con el mismo nombre, falla.

## Trabajar con él

```bash
npm install
npm run build        # genera y compila a dist/: hay que hacerlo antes de usarlo desde otro proyecto
npm run verify       # genera, tipos, ESLint, Prettier y pruebas con cobertura
```

| Script | Qué hace |
|---|---|
| `generar` | `src/generado/` desde el contrato |
| `build` | Genera y compila a `dist/` |
| `test` | Genera y pasa las pruebas (Mocha con tsx) |
| `cobertura` | Las pruebas sobre lo compilado por tsc, con c8: umbral del 90 % |
| `verify` | Todo: lo que tiene que pasar antes de subir |

Las pruebas son de `scripts/combinar.ts` y `scripts/limites.ts`, que es donde está la
lógica, y de `LIMITES_SERVIDOR` con las cifras escritas a mano: si el contrato cambia un
límite, fallan, y alguien tiene que decidir qué hacer.

El contrato es dependencia de desarrollo: solo se lee al generar.
