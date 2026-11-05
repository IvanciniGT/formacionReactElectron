import { expect } from "chai";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extraer,
  type Origenes,
} from "../../../scripts/divergencias/extraer.js";

// La carpeta con el tsconfig.json, subiendo desde aquí: con cobertura, esta prueba se
// ejecuta compilada desde artifacts/compilado/, y los ejemplos siguen en tests/.
function raizDelProyecto(): string {
  let carpeta = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(carpeta, "tsconfig.json")))
    carpeta = dirname(carpeta);
  return carpeta;
}

const ORIGEN: Origenes = {
  raiz: raizDelProyecto(),
  frontal: "./tests/unitarias/divergencias/ejemplo/frontal.ts",
  modelosFrontal: "./tests/unitarias/divergencias/ejemplo/frontal.ts",
  servidor: "./tests/unitarias/divergencias/ejemplo/servidor.ts",
};

describe("extraer", function () {
  // Arranca el compilador de TypeScript: no es instantáneo.
  this.timeout(20_000);

  const { pares, modelos } = extraer(ORIGEN, [
    { frontal: "Ficha", servidor: "FichaServidor" },
    { frontal: "Aviso", variante: "b", servidor: 'Envoltorio["dentro"]' },
  ]);

  it("saca los campos, también los heredados y los opcionales", () => {
    expect(Object.keys(pares[0]?.frontal ?? {})).to.have.members([
      "id",
      "estado",
      "nota",
      "unico",
      "fecha",
    ]);
  });

  it("de una unión de literales saca sus valores; del resto, solo el nombre", () => {
    expect(pares[0]?.frontal).to.deep.include({
      estado: { valores: ["abierto", "cerrado"] },
      unico: { valores: ["fijo"] },
      fecha: {},
      nota: {},
    });
  });

  it("null y undefined no cuentan como valores", () => {
    expect(pares[0]?.servidor["sobra"]).to.deep.equal({});
  });

  it("de una unión discriminada, solo la variante pedida", () => {
    expect(Object.keys(pares[1]?.frontal ?? {})).to.have.members(["tipo", "y"]);
  });

  it("el servidor puede ser cualquier expresión de tipo, aunque sea opcional", () => {
    expect(Object.keys(pares[1]?.servidor ?? {})).to.deep.equal(["y"]);
  });

  it("los modelos son lo que tiene campos, no los tipos sueltos", () => {
    expect(modelos).to.have.members(["Base", "Ficha", "Aviso"]);
  });

  it("si la tabla nombra algo que no existe, lo dice", () => {
    expect(() =>
      extraer(ORIGEN, [{ frontal: "NoExiste", servidor: "FichaServidor" }]),
    ).to.throw("La tabla de correspondencias no compila");
  });

  it("en un fichero que no es un módulo no hay modelos", () => {
    const { modelos: ninguno } = extraer(
      {
        ...ORIGEN,
        modelosFrontal:
          "./tests/unitarias/divergencias/ejemplo/sin-modulo.d.ts",
      },
      [],
    );
    expect(ninguno).to.deep.equal([]);
  });

  it("sin tsconfig.json en la raíz, lo dice", () => {
    const sinTsconfig = join(ORIGEN.raiz, "tests", "unitarias");
    expect(() => extraer({ ...ORIGEN, raiz: sinTsconfig }, [])).to.throw(
      `No se puede leer ${sinTsconfig}/tsconfig.json.`,
    );
  });
});
