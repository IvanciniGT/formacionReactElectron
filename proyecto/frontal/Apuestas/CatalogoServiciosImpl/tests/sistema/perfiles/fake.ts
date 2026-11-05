import { EntornoFake } from "@apuestas-deportivas/catalogo-backend-fake/pruebas";
import { registrar } from "../soporte/registrar.js";

// De sistema (npm run sistema): contra el backend fake, que se arranca y se controla.
// Se ejecutan todos los escenarios.
registrar(() => new EntornoFake());
