// Recuerda el último evento abierto, para ver en pantalla que el callback llega.
import { useState } from "react";

export function usePaginaListadoEventosItem() {
  const [abierto, setAbierto] = useState<string>();
  return { abierto, onAbrir: setAbierto };
}
