// La librería (vite build) y sus pruebas (vitest). La app de pruebas manual tiene su propia
// configuración, en app-pruebas/.
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      // Todo el CSS de los componentes en un fichero, que la aplicación importa una vez.
      cssFileName: "estilos",
    },
    rolldownOptions: {
      // Lo pone quien use la librería: si se empaquetara aquí, habría dos React (o dos
      // stores) en la misma aplicación.
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        "react-redux",
        /^@reduxjs\/toolkit/,
        /^@apuestas-deportivas\//,
      ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["tests/preparacion.ts"],
    include: ["tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reportsDirectory: "artifacts/cobertura",
      reporter: ["text", "html", "cobertura", "lcov"],
      // Los mismos umbrales que el resto del frontal (configuracion-frontal/c8.json).
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
