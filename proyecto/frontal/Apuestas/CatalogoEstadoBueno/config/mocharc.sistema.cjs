// Las de sistema: la configuración común, con otras pruebas. Por la línea de comandos no se
// puede: Mocha añade esas rutas a las de la configuración, no las sustituye.
module.exports = {
  ...require("@apuestas-deportivas/configuracion-frontal/mocharc.json"),
  spec: ["tests/sistema/**/*.test.ts"],
};
