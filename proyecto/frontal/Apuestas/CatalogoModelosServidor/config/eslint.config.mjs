// El código generado (src/generado/) no se analiza: no lo escribe nadie.
// La configuración común a todo el frontal: frontal/Comun/Configuracion.
import { configuracionEslint } from "@apuestas-deportivas/configuracion-frontal/eslint";

export default configuracionEslint({
  raiz: `${import.meta.dirname}/..`,
  ignorar: ["**/generado/**"],
});
