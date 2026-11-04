// El backend contra el que se ejecuta el TCK. Una prueba de caja negra no sabe qué hay
// detrás del ServicioEventos; pero para probarlo tiene que poder cargar unos datos y
// provocar cambios, como haría el operador. El servicio no lo crea el entorno: lo crea el
// TCK con la fábrica de la implementación (CrearServicioEventos), apuntando a la URL que
// le da el entorno. Así un mismo entorno vale para cualquier implementación.
export interface EntornoDePruebas {
  // Si puede cargar los datos de prueba y provocar cambios. Los escenarios que lo
  // necesitan llevan @controla-el-backend, y contra un entorno que no puede se saltan: se
  // ven como saltados en el informe, no como pasados.
  readonly controlaElBackend: boolean;

  // Deja un backend con esos datos y devuelve su URL base. Si no controla el backend,
  // los datos no se cargan: se devuelve la URL tal cual.
  arrancar(datos: DatosDePrueba): Promise<string>;
  parar(): Promise<void>;

  // Provocar cambios. Por nombre, no por id: la prueba no sabe cómo identifica las cosas
  // el backend. Los nombres son únicos dentro de cada evento en los datos del TCK.
  cambiarCuota(evento: string, seleccion: string, cuota: number): Promise<void>;
  cambiarEstadoMercado(
    evento: string,
    mercado: string,
    estado: "abierto" | "suspendido" | "cerrado",
  ): Promise<void>;
  cambiarEstadoEvento(
    evento: string,
    estado: EstadoEventoDePrueba,
  ): Promise<void>;

  // Resuelve cuando el backend ya tiene registrada la suscripción a ese evento. Sin esto,
  // un cambio provocado justo después de suscribirse podría escaparse.
  suscripcionRegistrada(evento: string): Promise<void>;
}

export type EstadoEventoDePrueba =
  | "programado"
  | "enJuego"
  | "interrumpido"
  | "finalizado"
  | "aplazado"
  | "cancelado";

// Los datos que carga cualquier entorno (datos/catalogo.json). La forma mínima para
// describir un catálogo a mano: el backend calcula lo demás.
export interface DatosDePrueba {
  readonly grupos: Readonly<Record<string, string>>;
  readonly tipos: readonly { readonly id: string; readonly nombre: string }[];
  readonly eventos: readonly {
    readonly id: string;
    readonly nombre: string;
    readonly tipoId: string;
    readonly comienzo: string;
    readonly estado: EstadoEventoDePrueba;
    readonly mercados: readonly {
      readonly id: string;
      readonly tipo: string;
      readonly grupo: string;
      readonly descripcion: string;
      readonly estado: "abierto" | "suspendido" | "cerrado";
      readonly principal?: boolean;
      readonly selecciones: readonly {
        readonly id: string;
        readonly descripcion: string;
        readonly cuota: number;
      }[];
    }[];
  }[];
}
