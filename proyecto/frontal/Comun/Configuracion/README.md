# Configuración del frontal

La configuración de herramientas que comparten los paquetes TypeScript del frontal, y las
tareas que son iguales en todos. Una regla, un umbral o una opción del compilador se
cambia aquí una vez, y no en cada paquete.

## Qué hay

| Fichero | Qué es | Cómo lo usa un paquete |
|---|---|---|
| `eslint.mjs` | `configuracionEslint({ raiz, ignorar })`: `strictTypeChecked` con información de tipos, y Prettier apagando lo que chocaría con él | `config/eslint.config.mjs`, de una línea |
| `prettier.mjs` | El formato. `endOfLine: "lf"`, también en Windows | `"prettier": "@apuestas-deportivas/configuracion-frontal/prettier"` en `package.json` |
| `tsconfig.base.json` | Las opciones del compilador: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`… | `"extends"` en su `tsconfig.json` |
| `tsconfig.build.json` | `src/` a `dist/`, con sus `.d.ts` | `config/tsconfig.build.json`, solo con `extends` |
| `tsconfig.cobertura.json` | `src/` y `tests/unitarias/` a `artifacts/compilado/`, para medir la cobertura | `config/tsconfig.cobertura.json`, con `extends` y, si mide más, su `include` |
| `mocharc.json` | Mocha para el día a día: las unitarias con tsx | `config/mocharc.cjs`, que la reexporta |
| `mocharc.cobertura.json` · `c8.json` | Mocha sobre lo compilado, y los umbrales (90 %) e informes de c8 | Los usa `configuracion-frontal cobertura` |
| `bin/configuracion-frontal.mjs` | Las tareas `cobertura` y `sonar` | `"cobertura": "configuracion-frontal cobertura"` |

Los tsconfig compartidos escriben sus rutas con `${configDir}`: TypeScript lo sustituye por
la carpeta del tsconfig que extiende (`config/` del paquete), no por la de este. Por eso un
paquete se queda en:

```json
{
  "extends": [
    "../tsconfig.json",
    "@apuestas-deportivas/configuracion-frontal/tsconfig.build.json"
  ]
}
```

Primero su `tsconfig.json` (los tipos, `noEmit`…) y encima el compartido, que gana.

## Las tareas

**`configuracion-frontal cobertura`**:
1. Borra `artifacts/compilado`. Si no, una prueba movida o borrada se seguiría ejecutando
   desde su copia vieja.
2. Compila con `config/tsconfig.cobertura.json`.
3. Pasa Mocha con c8. La cobertura se mide sobre lo que compila `tsc` y no sobre lo que
   ejecuta tsx, porque tsx añade funciones auxiliares que la descuadran.

c8 no sabe extender la configuración de otro paquete: su `extends` es una ruta desde la
carpeta de trabajo. Así que la tarea junta `c8.json` con el `config/c8rc.json` del paquete,
que solo dice qué se cubre, y le pasa el resultado.

**`configuracion-frontal sonar`** analiza con `sonarqube-scanner`, con lo común escrito una
vez: servidor, quality gate, fuentes, pruebas, exclusiones, cobertura, y dos reglas que no
aplican: la del «todo» en castellano, que Sonar toma por un TODO, y la de alias redundantes
en `modelos/`, donde `type Id = string` es un nombre del dominio. La clave sale del nombre del paquete: `@apuestas-deportivas/catalogo-servicios-api`
pasa a ser `ivan_catalogo-servicios-api`. El token, en `SONAR_TOKEN`. Para apuntar a otro
servidor, `SONAR_HOST_URL`.

## Lo que no está aquí, y por qué

- **Qué cubre cada paquete** (`config/c8rc.json`): es una decisión de cada uno. Unos miden
  sus scripts y otros dejan fuera lo que solo reexporta o lo que solo envuelve SignalR.
- **El `.gitignore`**: git no tiene forma de compartirlo entre repos.
- **Los scripts de `package.json`** de una línea (`tipos`, `lint`, `build`…): se quedan a la
  vista en cada paquete, que es donde se buscan.
- **Las herramientas** (`eslint`, `prettier`, `typescript`, `mocha`, `c8`,
  `sonarqube-scanner`): son `peerDependencies`, y las pone cada paquete, que es quien las
  ejecuta. Las tres últimas son opcionales: el TCK no tiene ni unitarias ni Sonar. Los
  plugins de ESLint sí van aquí, en `dependencies`, porque son parte de la configuración.

## Trabajar con él

No tiene código que construir ni probar por sí mismo. Se comprueba con el `verify` de los
paquetes que lo usan: desde la raíz del proyecto, `npm run verify`.
