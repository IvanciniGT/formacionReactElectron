// La app de pruebas manual: una página por componente, para verlos y tocarlos en el
// navegador. No se construye ni se publica: solo se sirve (npm run app).
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
});
