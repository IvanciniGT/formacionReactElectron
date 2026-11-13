// La configuración común a todo el frontal, y una regla propia: este paquete lo comparten
// la web y la consola de Electron, así que nada de React.
import { configuracionEslint } from "@apuestas-deportivas/configuracion-frontal/eslint";

export default [
  ...configuracionEslint({ raiz: `${import.meta.dirname}/..` }),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: ["react", "react-redux", "@reduxjs/toolkit/query/react"] },
      ],
    },
  },
];
