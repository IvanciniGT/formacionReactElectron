import { EntornoRemoto } from "@apuestas-deportivas/catalogo-servicios-api-pruebas";
import { registrar } from "../soporte/registrar.js";

// De integración (npm run integracion): contra el backend de verdad, en URL_BACKEND. Solo los
// escenarios que no necesitan controlarlo; los demás salen saltados.
const url = process.env["URL_BACKEND"];
if (!url)
  throw new Error(
    "Las pruebas de integración necesitan la URL del backend en URL_BACKEND.\n" +
      "  bash:       URL_BACKEND=https://… npm run integracion\n" +
      '  PowerShell: $env:URL_BACKEND="https://…"; npm run integracion\n' +
      "  cmd:        set URL_BACKEND=https://… && npm run integracion",
  );

registrar(() => new EntornoRemoto(url));
