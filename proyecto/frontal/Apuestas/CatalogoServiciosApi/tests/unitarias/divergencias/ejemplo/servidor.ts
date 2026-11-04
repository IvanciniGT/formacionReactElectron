export interface FichaServidor {
  id: string;
  estado: "abierto" | "suspendido";
  fecha: string;
  sobra: number | null;
}

export interface Envoltorio {
  dentro?: { y: string };
}
