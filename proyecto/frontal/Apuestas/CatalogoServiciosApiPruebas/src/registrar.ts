import type {
  ConfiguracionServicioEventos,
  CrearServicioEventos,
} from "@apuestas-deportivas/catalogo-servicios-api";
import type * as Cucumber from "@cucumber/cucumber";
import { readFileSync } from "node:fs";
import { registrarPasosCatalogo } from "./pasos/catalogo.js";
import { registrarPasosConfiguracion } from "./pasos/configuracion.js";
import { registrarPasosErrores } from "./pasos/errores.js";
import { registrarPasosTiempoReal } from "./pasos/tiempo-real.js";
import { capturarConsola, type CapturaDeConsola } from "./soporte/consola.js";
import type { DatosDePrueba, EntornoDePruebas } from "./soporte/entorno.js";
import type { MundoCatalogo } from "./soporte/mundo.js";

// El Cucumber de quien ejecuta el TCK. Se recibe en vez de importarlo: si el TCK registrara
// los pasos en su propia copia de Cucumber, la implementación, que ejecuta la suya, no los
// vería. Es el mismo principio que con el ServicioEventos: se inyecta.
export type ApiCucumber = typeof Cucumber;

export interface OpcionesTck {
  readonly cucumber: ApiCucumber;
  // Uno nuevo por escenario: cada escenario arranca su backend, y ninguno depende de otro.
  readonly crearEntorno: () => EntornoDePruebas;
  // La fábrica que exporta la implementación: lo que se prueba.
  readonly crearServicio: CrearServicioEventos;
  // Para cambiar algo de CONFIGURACION_DE_PRUEBA. La URL la pone siempre el entorno.
  readonly configuracion?: Partial<
    Omit<ConfiguracionServicioEventos, "urlBase">
  >;
}

// Con la que se crea el servicio en cada escenario. Tiempos cortos, para que una prueba
// que falla no se quede colgada, y avisos visibles.
export const CONFIGURACION_DE_PRUEBA: Omit<
  ConfiguracionServicioEventos,
  "urlBase"
> = {
  tiempoMaximoPeticionMs: 2000,
  esperasReconexionMs: [0, 100, 500],
  nivelDeRegistro: "aviso",
};

// Los datos que carga cada entorno al arrancar.
export const DATOS_DE_PRUEBA = JSON.parse(
  readFileSync(new URL("../datos/catalogo.json", import.meta.url), "utf8"),
) as DatosDePrueba;

export function registrarPruebas({
  cucumber,
  crearEntorno,
  crearServicio,
  configuracion = {},
}: OpcionesTck): void {
  class Mundo extends cucumber.World implements MundoCatalogo {
    readonly entorno = crearEntorno();
    readonly crearServicio = crearServicio;
    configuracion!: ConfiguracionServicioEventos;
    servicio!: MundoCatalogo["servicio"];
    pagina: MundoCatalogo["pagina"];
    evento: MundoCatalogo["evento"];
    mercados: MundoCatalogo["mercados"];
    error: unknown;
    recibidos: MundoCatalogo["recibidos"] = [];
    terminada = false;
    suscripcion: MundoCatalogo["suscripcion"];
    consola: CapturaDeConsola | undefined;
  }

  cucumber.setDefaultTimeout(10_000);
  cucumber.setWorldConstructor(Mundo);

  // El primer Before y, como los After van en orden inverso, el último After: se captura
  // todo lo que pasa en el escenario, también al cerrar el servicio y parar el backend.
  cucumber.Before(function (this: Mundo) {
    this.consola = capturarConsola();
  });
  cucumber.After(function (this: Mundo, { pickle, result }) {
    const lineas = this.consola?.restaurar() ?? [];
    const fallido =
      result !== undefined &&
      result.status !== cucumber.Status.PASSED &&
      result.status !== cucumber.Status.SKIPPED;
    if (!fallido || lineas.length === 0) return;
    const texto = lineas.join("\n");
    this.attach(texto, "text/plain");
    process.stderr.write(
      `\nLo que escribió en la consola «${pickle.name}», que ha fallado:\n${texto}\n`,
    );
  });

  // Antes que nada: si el escenario necesita controlar el backend y este entorno no
  // puede, se salta, y se ve como saltado en el informe.
  cucumber.Before({ tags: "@controla-el-backend" }, function (this: Mundo) {
    return this.entorno.controlaElBackend ? undefined : "skipped";
  });

  cucumber.Before(async function (this: Mundo) {
    const urlBase = await this.entorno.arrancar(DATOS_DE_PRUEBA);
    this.configuracion = {
      ...CONFIGURACION_DE_PRUEBA,
      ...configuracion,
      urlBase,
    };
    this.servicio = this.crearServicio(this.configuracion);
  });

  cucumber.After(async function (this: Mundo) {
    this.suscripcion?.unsubscribe();
    // Puede no haberlo: un escenario saltado no llega a crearlo.
    await (this.servicio as Mundo["servicio"] | undefined)?.cerrar();
    await this.entorno.parar();
  });

  registrarPasosCatalogo(cucumber);
  registrarPasosTiempoReal(cucumber);
  registrarPasosConfiguracion(cucumber);
  registrarPasosErrores(cucumber);
}
