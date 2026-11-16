// La configuración común a todo el frontal, más las reglas de los hooks de React: que se
// llamen siempre en el mismo orden y que los efectos declaren todo lo que usan.
import { configuracionEslint } from "@apuestas-deportivas/configuracion-frontal/eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  ...configuracionEslint({ raiz: `${import.meta.dirname}/..` }),
  reactHooks.configs.flat["recommended-latest"],
  {
    // Las pruebas de la configuración común (tests/**/*.ts) también para las .tsx.
    files: ["tests/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
