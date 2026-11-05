// endOfLine lf también en Windows: el .gitattributes de la raíz hace que git descargue LF,
// y así prettier y git están de acuerdo.
export default {
  semi: true,
  trailingComma: "all",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: "lf",
  arrowParens: "always",
  bracketSpacing: true,
  proseWrap: "preserve",
};
