import { format } from "node:util";

// Lo que escribe en la consola el código probado durante un escenario: avisos de la
// implementación, el registro de SignalR... En los escenarios que provocan un error a
// propósito (cortar la conexión, pedir un evento que no existe) es lo esperado, y verlo en
// cada ejecución solo tapa lo que importa. Se guarda, y solo se enseña si el escenario falla,
// que es cuando hace falta.
//
// Se captura la consola, y no el registrador de una implementación, porque el TCK no sabe
// cómo registra cada una: cualquiera acaba escribiendo en console.
const METODOS = ["debug", "info", "log", "warn", "error"] as const;

export interface CapturaDeConsola {
  // Deja la consola como estaba y devuelve lo que se escribió mientras tanto.
  restaurar(): readonly string[];
}

export function capturarConsola(): CapturaDeConsola {
  // Los descriptores y no los métodos: se devuelven tal cual, sin desligarlos de console.
  const originales = METODOS.map(
    (metodo) =>
      [metodo, Object.getOwnPropertyDescriptor(console, metodo)] as const,
  );
  const lineas: string[] = [];
  for (const metodo of METODOS)
    console[metodo] = (...argumentos: unknown[]) => {
      lineas.push(`[${metodo}] ${format(...argumentos)}`);
    };
  return {
    restaurar() {
      for (const [metodo, original] of originales)
        if (original) Object.defineProperty(console, metodo, original);
      return lineas;
    },
  };
}
