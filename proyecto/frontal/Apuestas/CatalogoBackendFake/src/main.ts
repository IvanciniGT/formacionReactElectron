import { parseArgs } from "node:util";
import { arrancarBackendFake } from "./index.js";

// npm start -- --puerto 5080 --mover-cada-ms 2000
const { values } = parseArgs({
  options: {
    puerto: { type: "string", default: "5080" },
    "mover-cada-ms": { type: "string", default: "3000" },
  },
});

const backend = await arrancarBackendFake({
  puerto: Number(values.puerto),
  moverCuotasCadaMs: Number(values["mover-cada-ms"]),
});

console.log(`Backend fake del catálogo en ${backend.url}`);
console.log(`  REST:      ${backend.url}/v1/eventos`);
console.log(`  SignalR:   ${backend.url}/v1/hubs/catalogo`);
console.log(
  `  Las cuotas se mueven cada ${values["mover-cada-ms"]} ms. Ctrl+C para parar.`,
);

process.on("SIGINT", () => {
  void backend.parar().then(() => process.exit(0));
});
