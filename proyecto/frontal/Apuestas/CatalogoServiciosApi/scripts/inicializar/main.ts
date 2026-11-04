// npm run inicializar-modelos [-- --destino <carpeta>]
//
// El día 0 de los modelos del frontal, a partir del contrato. Una sola vez: si los ficheros
// ya existen, no toca nada. Para ver qué saldría sin pisar lo que hay, --destino otra carpeta.
import { LIMITES_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor";
import { ESQUEMAS_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor/esquemas";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { inicializar, type Esquema } from "./generar.js";

const RAIZ = fileURLToPath(new URL("../..", import.meta.url));
const { values } = parseArgs({ options: { destino: { type: "string" } } });

const { modelos, limites, correspondencias } = inicializar(
  ESQUEMAS_SERVIDOR as Readonly<Record<string, Esquema>>,
  LIMITES_SERVIDOR,
);

const destino = values.destino
  ? join(process.cwd(), values.destino)
  : undefined;
const ficheros: Readonly<Record<string, string>> = destino
  ? {
      [join(destino, "modelos.ts")]: modelos,
      [join(destino, "limites.ts")]: limites,
      [join(destino, "correspondencias.ts")]: correspondencias,
    }
  : {
      [join(RAIZ, "src/modelos/modelos.ts")]: modelos,
      [join(RAIZ, "src/modelos/limites.ts")]: limites,
      [join(RAIZ, "scripts/divergencias/correspondencias.ts")]:
        correspondencias,
    };

const existentes = Object.keys(ficheros).filter((f) => existsSync(f));
if (existentes.length > 0) {
  console.error(
    `Los modelos ya están inicializados: no se toca nada.\n${existentes
      .map((f) => `  ${relative(process.cwd(), f)}`)
      .join(
        "\n",
      )}\nDesde el día 0 se cambian a mano. Para ver qué saldría: --destino <otra carpeta>.`,
  );
  process.exit(1);
}

for (const [fichero, texto] of Object.entries(ficheros)) {
  mkdirSync(join(fichero, ".."), { recursive: true });
  writeFileSync(fichero, texto);
  console.log(`Escrito ${relative(process.cwd(), fichero)}`);
}
console.log("Ahora: npm run format, y revisarlos. Desde aquí son del frontal.");
