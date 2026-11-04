// Saca los campos de cada modelo con el compilador de TypeScript: en ejecución los tipos ya
// no existen, así que es la única forma de mirarlos. Se le pregunta al compilador lo mismo
// que al pasar el ratón en el editor, con herencias, uniones y alias resueltos.
import { dirname, join, relative } from "node:path";
import ts from "typescript";
import type { Campo, Campos, Correspondencia } from "./comparar.js";

export interface Origenes {
  // La carpeta del proyecto: de ahí se leen tsconfig.json y node_modules.
  readonly raiz: string;
  // Lo que exporta los modelos del frontal: una ruta relativa a la raíz (./…).
  readonly frontal: string;
  // Los modelos del frontal que se listan (para saber cuáles faltan en la tabla).
  readonly modelosFrontal: string;
  // Lo que exporta los modelos del servidor: un paquete o una ruta relativa a la raíz.
  readonly servidor: string;
}

export interface Extraido {
  readonly pares: readonly {
    readonly frontal: Campos;
    readonly servidor: Campos;
  }[];
  readonly modelos: readonly string[];
}

function especificador(desde: string, origen: Origenes, ruta: string): string {
  if (!ruta.startsWith(".")) return ruta;
  const rel = relative(dirname(desde), join(origen.raiz, ruta)).replace(
    /\.ts$/,
    ".js",
  );
  return rel.startsWith(".") ? rel : `./${rel}`;
}

// Un fichero que no existe en disco: un alias de tipo por cada lado de cada par.
function fuenteDePares(
  fichero: string,
  origen: Origenes,
  correspondencias: readonly Correspondencia[],
): string {
  const lineas = [
    `import type * as F from "${especificador(fichero, origen, origen.frontal)}";`,
    `import type * as S from "${especificador(fichero, origen, origen.servidor)}";`,
  ];
  correspondencias.forEach((c, i) => {
    const frontal = c.variante
      ? `Extract<F.${c.frontal}, { readonly tipo: "${c.variante}" }>`
      : `F.${c.frontal}`;
    lineas.push(`export type F${i} = NonNullable<${frontal}>;`);
    lineas.push(`export type S${i} = NonNullable<S.${c.servidor}>;`);
  });
  return lineas.join("\n");
}

function camposDe(
  checker: ts.TypeChecker,
  tipo: ts.Type,
  nodo: ts.Node,
): Campos {
  const campos: Record<string, Campo> = {};
  for (const propiedad of checker.getPropertiesOfType(tipo)) {
    const deCampo = checker.getNonNullableType(
      checker.getTypeOfSymbolAtLocation(propiedad, nodo),
    );
    const partes = deCampo.isUnion() ? deCampo.types : [deCampo];
    campos[propiedad.name] = partes.every((p) => p.isStringLiteral())
      ? { valores: partes.map((p) => p.value) }
      : {};
  }
  return campos;
}

// Un modelo es lo que tiene campos: interfaces y uniones de objetos. Id, Cuota o un estado
// son tipos sueltos, no modelos.
function esModelo(tipo: ts.Type): boolean {
  const partes = tipo.isUnion() ? tipo.types : [tipo];
  return partes.every((p) => (p.flags & ts.TypeFlags.Object) !== 0);
}

export function extraer(
  origen: Origenes,
  correspondencias: readonly Correspondencia[],
): Extraido {
  const config = ts.getParsedCommandLineOfConfigFile(
    join(origen.raiz, "tsconfig.json"),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );
  if (!config)
    throw new Error(`No se puede leer ${origen.raiz}/tsconfig.json.`);

  const fichero = join(origen.raiz, "__pares_de_divergencias__.ts");
  const fuente = fuenteDePares(fichero, origen, correspondencias);
  const anfitrion = ts.createCompilerHost(config.options);
  const leerOriginal = anfitrion.getSourceFile.bind(anfitrion);
  anfitrion.getSourceFile = (nombre, version, ...resto) =>
    nombre === fichero
      ? ts.createSourceFile(nombre, fuente, version)
      : leerOriginal(nombre, version, ...resto);
  const existeOriginal = anfitrion.fileExists.bind(anfitrion);
  anfitrion.fileExists = (nombre) =>
    nombre === fichero || existeOriginal(nombre);

  const modelos = join(origen.raiz, origen.modelosFrontal);
  const programa = ts.createProgram(
    [fichero, modelos],
    config.options,
    anfitrion,
  );
  const errores = ts
    .getPreEmitDiagnostics(programa, programa.getSourceFile(fichero))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  if (errores.length > 0)
    throw new Error(
      `La tabla de correspondencias no compila:\n${errores.join("\n")}`,
    );

  const checker = programa.getTypeChecker();
  const alias = new Map<string, ts.TypeAliasDeclaration>();
  programa.getSourceFile(fichero)?.forEachChild((nodo) => {
    if (ts.isTypeAliasDeclaration(nodo)) alias.set(nodo.name.text, nodo);
  });
  const campos = (nombre: string): Campos => {
    const nodo = alias.get(nombre);
    if (!nodo) throw new Error(`No se ha generado ${nombre}.`);
    return camposDe(checker, checker.getTypeAtLocation(nodo), nodo);
  };

  const modulo = checker.getSymbolAtLocation(
    programa.getSourceFile(modelos) as ts.SourceFile,
  );
  const nombres = (modulo ? checker.getExportsOfModule(modulo) : [])
    .filter((s) =>
      (s.declarations ?? []).some(
        (d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d),
      ),
    )
    .filter((s) => esModelo(checker.getDeclaredTypeOfSymbol(s)))
    .map((s) => s.name);

  return {
    pares: correspondencias.map((_, i) => ({
      frontal: campos(`F${i}`),
      servidor: campos(`S${i}`),
    })),
    modelos: nombres,
  };
}
