// Modelos de ejemplo para probar extraer: lo justo para cada caso.
export type Id = string;
export type Estado = "abierto" | "cerrado";

export interface Base {
  readonly id: Id;
}

export interface Ficha extends Base {
  readonly estado: Estado;
  readonly nota?: string;
  readonly unico: "fijo";
  readonly fecha: Date;
}

export type Aviso =
  | { readonly tipo: "a"; readonly x: number }
  | { readonly tipo: "b"; readonly y: string };
