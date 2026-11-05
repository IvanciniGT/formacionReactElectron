// La URL base sin las barras del final, para pegarle rutas («/v1/eventos») sin que queden
// dos. Sin expresión regular a propósito: /\/+$/ prueba desde cada barra y, con muchas
// seguidas que no están al final, tarda el cuadrado de lo que mide.
export function sinBarrasFinales(url: string): string {
  let fin = url.length;
  while (fin > 0 && url.charAt(fin - 1) === "/") fin--;
  return url.slice(0, fin);
}
