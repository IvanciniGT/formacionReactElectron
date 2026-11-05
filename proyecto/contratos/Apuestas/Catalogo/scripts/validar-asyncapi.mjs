// Valida asyncapi.yaml, incluidas sus referencias a openapi.yaml. Con el parser de AsyncAPI y
// no con su CLI: el CLI trae el generador de código, y con él React, que aquí no pinta nada.
import { fromFile, Parser } from "@asyncapi/parser";
import { fileURLToPath } from "node:url";

const GRAVEDAD = ["error", "aviso", "información", "sugerencia"];

const { diagnostics: diagnosticos } = await fromFile(
  new Parser(),
  // fileURLToPath y no .pathname: en Windows, .pathname da /C:/… y Node lo convierte en C:\C:\….
  fileURLToPath(new URL("../asyncapi.yaml", import.meta.url)),
).parse();

for (const d of diagnosticos)
  console.log(
    `${GRAVEDAD[d.severity] ?? d.severity}  ${d.path.join(".") || "(raíz)"}  ${d.message}`,
  );

const errores = diagnosticos.filter((d) => d.severity === 0).length;
console.log(
  errores === 0
    ? "asyncapi.yaml es válido."
    : `asyncapi.yaml tiene ${errores} ${errores === 1 ? "error" : "errores"}.`,
);
process.exit(errores === 0 ? 0 : 1);
