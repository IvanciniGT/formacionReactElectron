// npm run divergencias: en qué no coinciden los modelos del frontal con los del servidor.
// Avisa, no falla: una divergencia puede ser a propósito. Si lo es, se declara en
// correspondencias.ts con su porqué, y deja de avisar.
import { LIMITES_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor";
import { fileURLToPath } from "node:url";
import { LIMITES } from "../../src/index.js";
import {
  compararCampos,
  compararLimites,
  modelosSinCorrespondencia,
  type Aviso,
} from "./comparar.js";
import { CORRESPONDENCIAS, SIN_EQUIVALENTE } from "./correspondencias.js";
import { extraer } from "./extraer.js";

const { pares, modelos } = extraer(
  {
    raiz: fileURLToPath(new URL("../..", import.meta.url)),
    frontal: "./src/index.ts",
    modelosFrontal: "./src/modelos/modelos.ts",
    servidor: "@apuestas-deportivas/catalogo-modelos-servidor",
  },
  CORRESPONDENCIAS,
);

const avisos: Aviso[] = [
  ...modelosSinCorrespondencia(modelos, CORRESPONDENCIAS, SIN_EQUIVALENTE),
  ...CORRESPONDENCIAS.flatMap((c, i) => {
    const par = pares[i];
    return par ? compararCampos(c, par.frontal, par.servidor) : [];
  }),
  ...compararLimites(CORRESPONDENCIAS, LIMITES, LIMITES_SERVIDOR),
];

if (avisos.length === 0)
  console.log(
    `Sin divergencias: ${String(CORRESPONDENCIAS.length)} correspondencias revisadas.`,
  );
else {
  for (const { donde, mensaje } of avisos)
    console.warn(`⚠ ${donde}: ${mensaje}`);
  console.warn(
    `\n${String(avisos.length)} divergencias. Si son a propósito, se declaran en scripts/divergencias/correspondencias.ts.`,
  );
}
