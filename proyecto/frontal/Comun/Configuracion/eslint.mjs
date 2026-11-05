// Reglas con información de tipos (strictTypeChecked): detectan promesas sin await,
// comparaciones imposibles o any que se cuela, que es justo lo que se escapa en una
// librería de la que dependen otros. El formato no es cosa de ESLint: lo hace Prettier
// por su cuenta (npm run format:check), y eslint-config-prettier apaga las reglas que
// chocarían con él.
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

/**
 * La configuración de ESLint de un paquete del frontal.
 *
 * @param {object} opciones
 * @param {string} opciones.raiz La carpeta del paquete, donde está su tsconfig.json.
 * @param {string[]} [opciones.ignorar] Lo que no se analiza, además de lo de siempre: por
 *   ejemplo, el código generado.
 */
export function configuracionEslint({ raiz, ignorar = [] }) {
  return tseslint.config(
    { ignores: ["node_modules/**", "dist/**", "artifacts/**", ...ignorar] },
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          projectService: { allowDefaultProject: ["*.ts", "config/*.mjs"] },
          tsconfigRootDir: raiz,
        },
      },
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        // Los mensajes de error interpolan números y estados: no aporta prohibirlo.
        "@typescript-eslint/restrict-template-expressions": [
          "error",
          { allowNumber: true },
        ],
      },
    },
    {
      // En las pruebas se fuerzan casos imposibles a propósito (as never, as unknown).
      files: ["tests/**/*.ts"],
      rules: {
        "@typescript-eslint/no-unsafe-type-assertion": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
      },
    },
    { files: ["config/*.mjs"], ...tseslint.configs.disableTypeChecked },
    {
      // Los .cjs de config/ reexportan una configuración compartida (Mocha no sabe extender
      // la suya): son CommonJS, con require y module.
      files: ["config/*.cjs"],
      ...tseslint.configs.disableTypeChecked,
      languageOptions: {
        ...tseslint.configs.disableTypeChecked.languageOptions,
        sourceType: "commonjs",
        globals: { module: "writable", require: "readonly" },
      },
      rules: {
        ...tseslint.configs.disableTypeChecked.rules,
        "@typescript-eslint/no-require-imports": "off",
      },
    },
    eslintConfigPrettier,
  );
}
