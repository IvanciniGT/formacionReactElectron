// Genera src/generado/ desde el contrato: los tipos de REST y del hub (contrato.ts), los
// límites de cada campo (limites.ts) y los esquemas en sí (esquemas.ts). No se edita a mano: se cambia el contrato y se
// regenera (npm run generar).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import openapiTS, { astToString } from "openapi-typescript";
import { parse } from "yaml";
import {
  combinar,
  type DocumentoAsyncApi,
  type DocumentoOpenApi,
} from "./combinar.js";
import { comoLiteral, extraerLimites } from "./limites.js";

// A través del paquete del contrato, con la versión que diga package.json: no se sabe ni
// importa dónde está en disco.
const leer = (fichero: string): unknown =>
  parse(
    readFileSync(
      new URL(
        import.meta.resolve(
          `@apuestas-deportivas/catalogo-contrato/${fichero}`,
        ),
      ),
      "utf8",
    ),
  );

const documento = combinar(
  leer("openapi.yaml") as DocumentoOpenApi,
  leer("asyncapi.yaml") as DocumentoAsyncApi,
);

const CABECERA = `// GENERADO desde @apuestas-deportivas/catalogo-contrato por scripts/generar.ts.
// No se edita a mano: se cambia el contrato y se regenera (npm run generar).
`;
const DESTINO = new URL("../src/generado/", import.meta.url);
mkdirSync(DESTINO, { recursive: true });

// immutable: todo readonly. Lo que manda el servidor no se modifica, se convierte.
const tipos = astToString(
  await openapiTS(documento as never, { immutable: true }),
);
writeFileSync(new URL("contrato.ts", DESTINO), CABECERA + tipos);

writeFileSync(
  new URL("limites.ts", DESTINO),
  `${CABECERA}//
// Lo que admite el servidor en cada campo, por esquema del contrato. invariante: la
// anotación del dominio de la que sale, si sale de una.
export const LIMITES_SERVIDOR = ${comoLiteral(extraerLimites(documento.components.schemas))} as const;
`,
);
// Los esquemas tal cual, para quien tenga que leerlos en ejecución: el script que inicializa
// los modelos del frontal el día 0. Va en su propia ruta del paquete (./esquemas), para que
// no le llegue a quien solo quiere los tipos.
writeFileSync(
  new URL("esquemas.ts", DESTINO),
  `${CABECERA}//
// Los esquemas del contrato (openapi.yaml y los mensajes de asyncapi.yaml), combinados.
export const ESQUEMAS_SERVIDOR: Readonly<Record<string, unknown>> = ${JSON.stringify(documento.components.schemas, null, 2)};
`,
);
console.log(`Generado ${DESTINO.pathname}`);
