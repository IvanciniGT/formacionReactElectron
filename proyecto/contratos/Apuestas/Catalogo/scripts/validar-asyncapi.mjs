// Valida asyncapi.yaml, incluidas sus referencias a openapi.yaml. Con el parser de AsyncAPI y
// no con su CLI: el CLI trae el generador de código, y con él React, que aquí no pinta nada.
import { fromFile, Parser } from "@asyncapi/parser";

const GRAVEDAD = ["error", "aviso", "información", "sugerencia"];

const { diagnostics: diagnosticos } = await fromFile(
  new Parser(),
  new URL("../asyncapi.yaml", import.meta.url).pathname,
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
