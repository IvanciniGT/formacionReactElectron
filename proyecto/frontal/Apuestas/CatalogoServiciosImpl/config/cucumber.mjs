// En .mjs y no en .json para poder buscar las features del TCK donde npm haya instalado el
// paquete: en su node_modules, en el de la raíz con workspaces, o en otro sitio. Una ruta
// escrita a mano solo vale para una de esas formas de instalarlo.
import { dirname, relative, sep } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";

const tck = dirname(
  fileURLToPath(
    import.meta
      .resolve("@apuestas-deportivas/catalogo-servicios-api-pruebas/features/catalogo.feature"),
  ),
);
// Cucumber busca con globs, y un glob solo entiende «/», también en Windows.
const comoGlob = (ruta) => relative(cwd(), ruta).split(sep).join("/");

const caracteristicas = [
  `${comoGlob(tck)}/**/*.feature`,
  "tests/sistema/**/*.feature",
];
// tsx primero: registra el cargador de .ts para todo lo que viene detrás.
const soporte = [
  "config/tsx.mjs",
  "tests/sistema/soporte/**/*.ts",
  "tests/sistema/pasos/**/*.ts",
];

// De sistema: contra el backend fake.
export default {
  paths: caracteristicas,
  import: [...soporte, "tests/sistema/perfiles/fake.ts"],
  format: [
    "progress",
    "html:artifacts/informes/cucumber.html",
    "junit:artifacts/informes/junit/sistema.xml",
  ],
};

// De integración: contra el backend de URL_BACKEND.
export const integracion = {
  paths: caracteristicas,
  import: [...soporte, "tests/sistema/perfiles/remoto.ts"],
  format: [
    "progress",
    "html:artifacts/informes/integracion.html",
    "junit:artifacts/informes/junit/integracion.xml",
  ],
};
