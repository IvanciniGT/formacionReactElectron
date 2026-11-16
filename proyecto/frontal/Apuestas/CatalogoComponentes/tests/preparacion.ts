// Antes de cada fichero de pruebas: los matchers del DOM (toBeInTheDocument…) y, tras cada
// prueba, desmontar lo pintado. Testing Library solo lo hace solo si Vitest tiene globals, y
// aquí no los tiene: describe, it y expect se importan.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
