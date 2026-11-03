
# Principios de desarrollo de software

En ciencias exactas, un principio = LEY = REGLA! que debe cumplirse.
Matemáticas, física, Ciencias de la computación son ciencias exactas.
Nosotros estamos en otra guerra: INGENIERIA de software.

Cualquier INGENIERIA, trata de resolver problemas, teniendo en cuenta: Restricciones:
- Recursos disponibles (tiempo, dinero, personal)
- Requisitos del cliente
- Normativas y estándares
- Limitaciones tecnológicas
- Factores de calidad (mantenibilidad, escalabilidad, seguridad)

Aquí no hay una solución UNICA PERFECTA.

Aquí tomamos decisiones. Y el problema es que hay que vivir con esas decisiones y las consecuencias de las mismas.
Ya hablé de la gran crisis del software -> La clave no es crear algo que funcione... sino crear algo que sea mantenible en tiempo.

En las ciencias inexactas (ciencias sociales, ingenirías) los principios simplemente son herramientas para guiar nuestras decisiones. No son leyes que se cumplen siempre, ni reglas que hay que seguir, sino guías que nos ayudan a tomar decisiones con consecuencias... favorables a nosotros.

Hay muchos principios que me ayudan a tomar mejores decisiones y a trabajar mejor.

SoC (Separation of Concerns): Cuando trabajes en una cosa, cénrate en esa cosa, y olvida lo demás.
Esto no es una regla inmutable. Puedo seguir ese principio o no. Nadie me obliga. No soy malña persona si no lo hago. Ni por hacerlo montaré un sistema perfecto tampoco. Simplemente, si lo respepeto (los principios se respetan o no se respetan) tendré más probabilidades de montar algo:
- Que funcione mejor
- Que no tenga un alto nivel de ACOPLAMIENTO con otros componentes de mi sistema

Hay 2 conceptos, que son los más básicos (son como las fuerzas físicas de la naturaleza) en el mundo del sofware:
- Cohesión: Es la fuerza que mantiene unida a una unidad de código, mide la relación que mantiene unidos sus elementos internos. Puede ser variada:
  - Mismo objetivo / propósito
  - Mismo momento del tiempo
  - Mismo contexto o ámbito
  - Nada (Típico fichero o paquete utils)
  Nuestro objetivo es aunementar la cohesión dentro de nuestras unidades de código, para que sean más fáciles de entender, mantener y evolucionar.
- Acoplamiento: Es la fuerza que mide la dependencia entre distintas unidades de código. 
  - Un alto acoplamiento indica que las unidades dependen fuertemente unas de otras, lo que dificulta su mantenimiento y evolución. 
  Nuestro objetivo es reducir el acoplamiento para lograr sistemas más flexibles y fáciles de modificar.

    MAXIMIZAR COHESIÓN y MINIMIZAR ACOPLAMIENTO... Muchos de los principios lo que buscan es esto!


Ryan Singer: So much complexity in software comes from trying to do too many things at once.
Si nos fijamos.. con ese concepto lo que estamos hablando es de generar código con alto nivel de cohesión y bajo acoplamiento.

## Principios SOLID

Estos principios los nombra así y los junta or primera vez el tio BOB (Robert C. Martin). La primera vez que los nombra de esta forma es en su libro Clean Code.

- S: Single Responsibility Principle (SRP) 
    Es posiblemente el peor entendido. El concepto es complejo... y el tio Bob necesito 3 definiciones para dejarlo cerrado.
    La primera fue en el libro: CleanCode:  "Una clase/módulo debe atender a una única responsabilidad". ES AMBIGUO.
    La segunda definición fue: "Una clase/módulo solo debe tener una única razón para cambiar". Define RAZON PARA CAMBIAR. Ambiguo.
    La tercera fue la buena (libro Clean Architecture): "Una clase/móduo debe atender a un único Actor" (actores de los de los casos de uso)
        El SRP No trata sobre temas técnicos, sino con personas dentro de la empresa.

    Pero esto no es sino otra forma de controlar la cohesión/acoplamiento dentro de nuestras unidades de código, asegurando que cada clase o módulo tenga un único actor al que atender.

        Componente Spring (Backend) -> Servicio:

```java
class MiServicio {
    //// Estas tienen que ver con Jugadores
    void aprobarJugador(String id);
    void pagarAlJugador(String id);
    void cambiarNombreDeUnJugador(String id, String nuevoNombre);
    //// Estas tienen que ver con Eventos
    Evento altaDeEvento(DatosDeEvento);
}
```

Tiene sentido que vayan juntar en una clase? Hay un motivo para ello? Cuál es el motivo? ESTO ES UN ANALISIS DE COHESION!
De hecho hay un SINTOMA CLARO DE QUE NO DEBEN IR JUNTAS: Cómo llamo al componente/clase/módulo? No encuentro nombre.
La degeneración absoluta de esto es crear la clase Utils. Trastero.

```java
class ServicioJugadores {
    //// Estas tienen que ver con Jugadores
    void aprobarJugador(String id);                                       // Operador
    void pagarAlJugador(String id,double cantidad);                       // Sistema/Otro
    void cambiarNombreDeUnJugador(String id, String nuevoNombre);         // Jugador
}
class ServicioEventos {
    //// Estas tienen que ver con Eventos
    Evento altaDeEvento(DatosDeEvento);
}
```
Tiene más sentido? MUCHO MAS... y por eso hemos sido capaces de ponerle nombre a la clase.
Hemos aplicado aquí el SRP? De hecho NO. He separado por temáticas. Y está bien hecho.
- Las operaciones que tienen que ver con jugadores a un lado, las operaciones que tienen que ver con Eventos a otro. Este movimiento ^ COHESION.
- El tio Bob con este principio me dice otra cosa. Esas operaciones atienden a los mismos actores? NO, atienden a actores distintos. 
  El tio bob lo que me dice es SEPARALAS!
    Ten una clase con las operaciones que se hacen sobre un Jugador por el propio Jugador
    Ten una clase con las operaciones que se hacen sobre un Jugador por el sistema
    Ten una clase con las operaciones que se hacen sobre un Jugador por un Operador

  Qué buscamos al hacer esto? +Cohesión

    La idea es que si alguien (ACTOR) pide un cambio al sistema haya menos probabilidades de JODER A OTRO!

- O: Open/Closed Principle (OCP) 

- L: Liskov Substitution Principle (LSP)

- I: Interface Segregation Principle (ISP) - Los clientes no deben verse obligados a depender de operaciones (que se definen en interfaces) que no utilizan. Es mejor tener interfaces específicas y pequeñas en lugar de una interfaz general y grande.

```csharp
class DatosModificablesDeUnJugador{
    double saldo;
    String email;
}

class DatosDeAltaDeJugador extends DatosModificablesDeUnJugador {
    String nombre;
    Date fechaDeNacimiento;
}

class IJugador extends DatosDeAltaDeJugador {
    String id;
    Date fechaDeAlta;
    Date fechaDeUltimaModificacion;
}

interface ServicioDeJugadores {
    IJugador altaDeJugador(DatosDeAltaDeJugador jugador); // Id no lo asigno yo. La fecha de alta se calcula (AHORA/HOY)
    IJugador? obtenerJugador(String id);
    IJugador? actualizarJugador(String id,DatosModificablesDeUnJugador jugador);
    IJugador? bajaDeJugador(String id);
}
```

- D: Dependency Inversion Principle (DIP) - Las clases/módulos de alto nivel no deben depender de implementaciones de clases/módulos de bajo nivel. Ambos deben depender de abstracciones (contratos, interfaces). Además, las abstracciones no deben depender de los detalles(clases), sino que los detalles(clases) las que deben depender de las abstracciones (interfaces).

cuando pinte el diagrama de clases de mi sistema, no puede haber NI UNA FLECHA de una interfaz a una clase... ni de una clase a otra clase.
Las dependencias siempre son a nivel de interfaces, no de clases concretas.

De hecho, hoy en día, tenemos UN PATRON de desarrollo (una forma de escribir código) que usamos para asegurarnos que respetamos el Principio de Inversión de Dependencias: La inyección de dependencias. Hay otros que hemos usado a lo largo de la historia (Singleton, Service Locator, Factory) pero la inyección de dependencias es el más común y recomendado actualmente.

Y los grandesframeworks que se han desarrollado en los últimos años, se han montado alrededor de este concepto:
- JAVA: Spring
- CSHARP: Host
- ANGULAR: Angular Dependency Injection

Hay más principios: DRY, YAGNI...
- DRY = Don't Repeat Yourself (No te repitas)
---

Con independencia de esos pricipios, hay otro concepto y es que cada componente de nuestro sistem se dedique a una única cosa (asuma una "responsabilidad" única). Básicamente que sus funciones/comportamiento, lógica tenga una alta cohesión.

> Ejemplo                                                  Lógica de Validación                                                                                SQL (carga externa de jugadores)
                                                      /              ^                                                                        v    
                                Formulario Alta Usuario -> Servicio Frontal ->          Controlador   ->    Servicio ->    Repositorio  -> BBDD
                                - fecha de nacimiento                                   (endPoint)
                                - email 
                                - DNI
                                - País

RESPONSABILIDAD                 Recoger datos                                           Lógica de                                           Persistir/
¿Qué lógica encierra?           del usuario                                             exposición del                                      Garantizar el dato
                                                                                        servicio
                                                                                        a un protocolo

                                Lógica de captura           Lógica de comunicación                          Lógica de           Lógica de 
                                de datos                    con backend                                     negocio             persistencia    
                                                            MAPEADOR (Mapper)           MAPEADOR (Mapper)   MAPEADOR (Mapper)   MAPEADOR (Mapper)

> Por qué quiero transformar datos? Para qué los mapeadores? Para bajar ACOPLAMIENTO

En la capa Repositorio, tendré una clase Jugador? SI
```csharp
class JugadorEntity {
    id: number;                     // Que no quiero exponer fuera de la BBDD
    publicId: UUID;                 // Identificador público que sí se puede exponer fuera de la BBDD
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
}
    vvvv

    MAPPER 1 actuan de barrerra de contención ante cambios.
    Me ayudan a dar estabilidad a los contratos.

    vvvv

class ModeloJugador {               // A nivel de dominio
    id: UUID;                 // Identificador público que sí se puede exponer fuera de la BBDD
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
}

    vvvv

    MAPPER2

    vvvv

public interface IJugadorRepositorio {
    obtenerPorId(id: number): JugadorEntity;
}

    vvvv

    MAPPER 3

    vvvv



class JugadorDTO {
    id: UUID;
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
    enBBDDExternaDeNoJugadores: boolean; // Este dato lo rellno en esta capa (NEGOCIO)
}
public interface IServicioJugadores{
    obtenerPorId(id: number): JugadorDTO; // Objeto de transporte de datos
}

class JugadorDTORestControllerV1 {
    id: UUID;
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
    enBBDDExternaDeNoJugadores: boolean; // Este dato lo rellno en esta capa (NEGOCIO)
    sistema: string; // YO COMO EMPRESA
    fechaConsulta: Date; // Fecha en la que se realizó la consulta
}
public interface IControladorRestV1Jugadores {
    obtenerPorId(id: number): JugadorDTORestControllerV1; // Jugador -> JSON
}

```


```ts
export interface Jugador { // Una cosa eslo que me pasa el backend
    id: UUID;
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
    fotos: string[]; // URL de la foto del jugador
}
export interface ServicioFrontalDeJugadores {
    obtenerPorId(id: number): DatosJugador;
}
export interface DatosJugador { // Otra cosa lo que yo manejo en mios componentes
    id: UUID;
    nombre: string;
    fecha_nacimiento: Date;
    email: string;
    dni: string;
    pais: string;
    foto: string; //La primera de la lista              @Deprecated
    fotos: string[];
}
export class FormularioFrontalDeJugadores{
    
    DatosJugador: DatosJugador; // Los datos de aquñi los muestra por pantalla

    constructor(string id) {
        // Inicialización del formulario frontal de jugadores
        this.Jugador = servicioFrontalDeJugadores.obtenerPorId(id); // Ejemplo de inicialización (FATAL... habría que hacerlo ASINCRONO)
    }
}
```

CAMBIO EN SISTEMA CN MAL DISEÑO
Nos ha comprado una empresa. Sueca!
Quieren la BBDD en inglés.

```csharp
class Player {
    id: number;                     // Que no quiero exponer fuera de la BBDD
    publicId: UUID;                 // Identificador público que sí se puede exponer fuera de la BBDD
    name: string;
    birthdate: Date;
    email: string;
    dni: string;
    country: string;
}

public interface IJugadorRepositorio {
    obtenerPorId(id: number): Player;
}

public interface IServicioJugadores{
    obtenerPorId(id: number): Player; // Objeto de transporte de datos
}

public interface IControladorRestV2Jugadores {
    obtenerPorId(id: number): Player; // Player -> JSON
}

```

```ts
export interface Player {
    id: UUID;
    name: string;
    birthdate: Date;
    email: string;
    dni: string;
    country: string;
}
export interface ServicioFrontalDeJugadores {
    obtenerPorId(id: number): Player;
}
export class FormularioFrontalDeJugadores{
    
    Jugador: Player; // Los datos de aquñi los muestra por pantalla

    constructor(string id) {
        // Inicialización del formulario frontal de jugadores
        this.Jugador = //servicioFrontalDeJugadores.obtenerPorId(id); // Ejemplo de inicialización (FATAL... habría que hacerlo ASINCRONO)
    }
}
```






---


CREATE TABLE Jugadores (
    id INT PRIMARY KEY,
    nombre VARCHAR(100),
    fecha_nacimiento DATE, -> IF que si no es date que pasa? ERROR en la BBDD
    email VARCHAR(100),
    dni DNI,
    pais VARCHAR(50)
);

fecha nacimiento > 18

Falla el sistema si lo pongo donde no debo? NO... el sistema funciona.
Pero... me estoy complicando la vida... en el mnto y evolución del sistema.

Y sabéis por qué? Porque no estoy generando código con alta COHESION!

    MAPPERS
    Qué es un mapper? Una función que transforma un dato en otro.

    Viene el copncepto de teoría de conjuntos /matemática.
    Funciones de que vinculan cada elemento de un conjunto con un elemento de otro conjunto. Funciones de correspondencia.

    En nuestro caso, dónde los aplicamos montonón?