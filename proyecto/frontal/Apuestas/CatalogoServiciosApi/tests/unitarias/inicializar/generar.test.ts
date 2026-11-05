import { LIMITES_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor";
import { ESQUEMAS_SERVIDOR } from "@apuestas-deportivas/catalogo-modelos-servidor/esquemas";
import { expect } from "chai";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  compararCampos,
  compararLimites,
} from "../../../scripts/divergencias/comparar.js";
import { extraer } from "../../../scripts/divergencias/extraer.js";
import {
  inicializar,
  type Esquema,
} from "../../../scripts/inicializar/generar.js";

const ESQUEMAS = ESQUEMAS_SERVIDOR as Readonly<Record<string, Esquema>>;

describe("inicializar los modelos (día 0)", () => {
  describe("cómo traduce cada esquema", () => {
    const { modelos, datos } = inicializar(
      {
        Id: { type: "string", description: "Un id." },
        Estado: { type: "string", enum: ["abierto", "cerrado"] },
        Base: {
          type: "object",
          required: ["id"],
          properties: { id: { $ref: "#/components/schemas/Id" } },
        },
        Ficha: {
          allOf: [
            { $ref: "#/components/schemas/Base" },
            {
              type: "object",
              required: ["fecha", "etiquetas", "estado"],
              properties: {
                fecha: { type: "string", format: "date-time" },
                etiquetas: { type: "array", items: { type: "string" } },
                estado: {
                  oneOf: [
                    { $ref: "#/components/schemas/Estado" },
                    { type: "null" },
                  ],
                },
                varios: {
                  type: "array",
                  items: { anyOf: [{ type: "integer" }, { type: "boolean" }] },
                },
                nombre: {
                  type: "string",
                  description: "Primera línea.\nSegunda línea.\n",
                },
                dentro: {
                  type: "object",
                  properties: { a: { type: "number" } },
                },
                raro: {},
              },
            },
          ],
        },
        // Lo que añade a su base no tiene nada obligatorio.
        Anexo: {
          allOf: [
            { $ref: "#/components/schemas/Base" },
            { type: "object", properties: { lista: { type: "array" } } },
          ],
        },
        Problema: { type: "object", properties: { title: { type: "string" } } },
        MensajeCancelar: { $ref: "#/components/schemas/Base" },
      },
      { Ficha: { nombre: { longitudMaxima: 9 } } },
    );

    it("los tipos sueltos son alias, con su descripción", () => {
      expect(modelos).to.include("/** Un id. */\nexport type Id = string;");
      expect(modelos).to.include('export type Estado = "abierto" | "cerrado";');
    });

    it("allOf es extends, y los campos son readonly", () => {
      expect(modelos).to.include("export interface Ficha extends Base {");
      expect(modelos).to.include("  readonly id: Id;");
    });

    it("las fechas son Date, las listas readonly y lo que admite null, T | null", () => {
      expect(modelos).to.include("  readonly fecha: Date;");
      expect(modelos).to.include("  readonly etiquetas: readonly string[];");
      expect(modelos).to.include("  readonly estado: Estado | null;");
      expect(modelos).to.include(
        "  readonly varios?: readonly (number | boolean)[];",
      );
    });

    it("lo no obligatorio es opcional; lo que no se sabe traducir, unknown", () => {
      expect(modelos).to.include(
        "  readonly dentro?: { readonly a?: number; };",
      );
      expect(modelos).to.include("  readonly raro?: unknown;");
    });

    it("una lista sin tipo de elemento es de unknown, y sin required todo es opcional", () => {
      expect(modelos).to.include(
        "export interface Anexo extends Base {\n  readonly lista?: readonly unknown[];\n}",
      );
    });

    it("el TSDoc lleva la descripción y el enlace a su límite", () => {
      expect(modelos).to.include(
        "  /**\n   * Primera línea.\n   * Segunda línea.\n   * Ver {@link LIMITES.Ficha.nombre}.\n   */\n  readonly nombre?: string;",
      );
    });

    it("deja fuera el error HTTP y los mensajes del hub", () => {
      expect(modelos).not.to.include("Problema");
      expect(modelos).not.to.include("MensajeCancelar");
    });

    it("solo los modelos con campos van a la tabla, y con esquema si tienen límites", () => {
      expect(datos.correspondencias).to.deep.equal([
        { frontal: "Base", servidor: 'components["schemas"]["Base"]' },
        {
          frontal: "Ficha",
          servidor: 'components["schemas"]["Ficha"]',
          esquema: "Ficha",
        },
        { frontal: "Anexo", servidor: 'components["schemas"]["Anexo"]' },
      ]);
      expect(datos.limites).to.deep.equal({
        Ficha: { nombre: { longitudMaxima: 9 } },
      });
    });
  });

  // Con el contrato de verdad: lo que sale el día 0 compila y no tiene ni una divergencia.
  describe("con el contrato", function () {
    this.timeout(30_000);

    const raiz = (() => {
      let carpeta = dirname(fileURLToPath(import.meta.url));
      while (!existsSync(join(carpeta, "tsconfig.json")))
        carpeta = dirname(carpeta);
      return carpeta;
    })();
    const carpeta = join(raiz, "artifacts", "pruebas", "dia0");
    const resultado = inicializar(ESQUEMAS, LIMITES_SERVIDOR);

    before(() => {
      rmSync(carpeta, { recursive: true, force: true });
      mkdirSync(carpeta, { recursive: true });
      writeFileSync(join(carpeta, "modelos.ts"), resultado.modelos);
      writeFileSync(join(carpeta, "limites.ts"), resultado.limites);
    });

    it("compila", () => {
      const programa = ts.createProgram([join(carpeta, "modelos.ts")], {
        strict: true,
        noEmit: true,
        module: ts.ModuleKind.NodeNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        types: [],
      });
      const errores = ts
        .getPreEmitDiagnostics(programa)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
      expect(errores).to.deep.equal([]);
    });

    it("no tiene ninguna divergencia con el servidor", () => {
      const { correspondencias, limites } = resultado.datos;
      const { pares } = extraer(
        {
          raiz,
          frontal: "./artifacts/pruebas/dia0/modelos.ts",
          modelosFrontal: "./artifacts/pruebas/dia0/modelos.ts",
          servidor: "@apuestas-deportivas/catalogo-modelos-servidor",
        },
        correspondencias,
      );
      const avisos = [
        ...correspondencias.flatMap((c, i) =>
          compararCampos(c, pares[i]?.frontal ?? {}, pares[i]?.servidor ?? {}),
        ),
        ...compararLimites(correspondencias, limites, LIMITES_SERVIDOR),
      ];
      expect(avisos).to.deep.equal([]);
      expect(correspondencias.map((c) => c.frontal)).to.include.members([
        "EventoResumen",
        "Mercado",
        "CambioDeEvento",
      ]);
    });
  });
});
