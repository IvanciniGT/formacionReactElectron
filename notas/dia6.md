Nos pasaron desde el backend 2 archivos:
- openapi.yaml              REST
- asyncapi.yaml             WebSocket

Y ese fué el punto de partida.
Qué hicimos:

1. Decidir que íbamos a usar una arquitectura modular. No queremos un monolito.
   En los backends no lo queremos desde luego.. pero tampoco en frontal.
   Queremos módulos/componentes desacoplados entre si y reusables. 
    Esto no es gratis... El día 1 me va complicar un poco.
    Es más fácil el día 1 montar un monolito.
    Pero luego no hay quien lo mantenga.
    Cuando tengo componentes desacomplados, me pasa lo contrario...
    El día 1 me cuesta más, pero a la larga es mucho más mantenible.

2. Tomar esos archivos y generar proyecto JS/TS (FRONTAL) con ellos. EL API de BACKEND.
   > contratos/Apuestas/Catalogo 
   Para qué? Tener versionado el contrato del API de backend.
   Aprovechamos para meter un script de validación de los contratos.
   A priori esos contratos deben salir de swagger en automático basado en el código de backend.
   Y deben estar bien... Pero me cuesta poco asegurarme. CUTRESCRIPT TS que valide los contratos.

3. Generar los tipos TS a partir de esos contratos, para usarlos en el frontal.
   Convertir los JSONs que vienen del backend o que mandamos al backend (según contratos) en tipos TS, para tener seguridad de tipos en el frontal.
   > frontal/Apuestas/CatalogoModelosServidor
   Realmente no son los que usaremos en el frontal... En el frontal tendremos NUESTROS PROPIOS TIPOS. Inicialmente sern iguales a los del backend, pero con el tiempo pueden divergir según nuestras necesidades y más que nuestras necesidades, la evolución que vaya teniendo el BACKEND... y nosotros en frontal queremos ir evolucionando a nuestro ritmo.
   Esto se hace en automático:
   - Tipos
   - Invariantes
   - Endpoints

4. Definimos un Servicio para comunicación con el backend.
   > frontal/Apuestas/CatalogoServiciosApi
   Este servicio se encarga de:
   - Define métodos para llamar a los endpoints del backend.
   - Definimos una configuración
   - Define sus propios tipos (los que realmente usará el frontal)
    - La generación de los tipos propios del frontal el día 1 la hicimos en automático, vía un script que toma los contratos y genera los tipos correspondientes. (igual que en el módulo CatalogoModelosServidor)
    - Como luego van a divergir de los tipos del backend, montamos un script para ver las divergencias.

5. En este API montamos pruebas automatizadas? SI, en su propio proyecto
   > frontal/Apuestas/CatalogoServiciosApiPruebas
   Por qué pruebas en un API?
   Las pruebas no son de implementaciones? NO
   No necesito código para poder ejecutar las pruebas sobre él? SI
   Qué pinta este proyecto? Una cosa es DEFINIR LAS PRUEBAS y otra ejecutarlas
   Sobre un API puedo definir pruebas, QUE CUALQUIER IMPLEMENTACIÓN QUE CUMPLA CON EL API DEBE PASAR.
   Aquí incluimos lo que se llaman: Pruebas de caja negra!
    En nuestro caso, usamos cucumber/gherkin para definir las pruebas de manera declarativa y legible.
    No es obligatorio... podría haber usado cualquier otra herramienta de pruebas, pero cucumber/gherkin nos permite mantener las pruebas legibles y declarativas.

6. Montar una implementación del API.
   > frontal/Apuestas/CatalogoServiciosImpl
    - Mapeadores: se encargan de convertir los tipos del backend a los tipos propios del frontal y viceversa.
    - Implementación de los métodos definidos en el API, utilizando los mapeadores para la conversión de tipos y asegurando que se cumplan los contratos establecidos.
    - Implementación de la Configuración del servicio <- IMPORTANTE
       
7. Montar un backend de mentirijilla / cartón piedra
   Me permite probar mi frontal, mis servicios...
   1. Puede que el backend no esté acabado
   2. PERO AUNQUE LO ESTÉ ME QUIERO AISLAR de él. Si una prueba falla, quiero tener claro que es por mi culpa y no por el backend.
      Por eso monto un backend FALSO de cartón piedra, qe cuando le pregunto por los eventos, siempre dice: Madrid-Barça
      Y las cuotas: 33
      Este no falla. CONFIO EN EL ... igual que confío en un bastidor (4 hierros mal soldaos) donde poner un sillin para hacerle pruebas unitarias.
   Éste no le distribuyo a producción, solo lo uso para pruebas locales y controladas. Igual que el bastidor o un sensor de presión.
   ESTO ES ALGO QUE AL PRINCIPIO ME JODE MONTARLO... son horas... para algo a priori NO PRODUCTIVO (No va a producción)
   PERO EN EL MEDIO/LARGO PLAZO el ahorro es gigante (en tiempos, caldiad, tranquilidad, control)
   Y de nuevo, como estas cosas, una IA las crea cojonudas, hoy en día NO ME DA DOLOR DE CABEZA.

La idea es que quizás tenga no solo una, sino varias app frontales que consuman los mismos servicio (de frontal)
Por eso quiero que sean componentes reusables.
Pero además quiero que sean componentes desacomplados... que pueda cambiar uno en el futuro sin impacto en los demás.

En este punto, nos preguntamos: POR DONDE SEGUIMOS?
- A montar componentes react -> NO... aún no!

Yo voy a montar unas apps... y esas aplicaciones tendrán unos ESTADOS GLOBALES.
Nuestros componentes de frontal tendrán ESTADOS LOCALES.

ESTADO GLOBAL: Los datos que maneja la aplicación y que pueden ser compartidos entre diferentes componentes o módulos.
En ese estado guardaré información variopinta:
- Usuario logueado
- Preferencias de usuario
- Eventos que se están cotizando sobre los que puedo apostar
- ...

Esos datos la idea es que sean reusables. Por ejemplo:
- Puedo tener u listado de eventos en mi pantalla (que será un componente WEB, que en nuestro caso crearemos vía REACT)
- Puedo tener un banner arriba, que muestre información sobre los eventos resumida:
  - Cuántos hay ahora mismo
  - ESTE acaba de cambiar su cuota
  - AQUEL otro ha sido cancelado

Una cosa es qué información voy a manejar a nivel de la app... y otra lo que haré con ella.


Cuando monto un sistema, hay metodologías, formas de trabajo, muiy probadas, y que me echan una mano.
Diagrama de Garret (Garret's Diagram) es una herramienta que ayuda a plantear una app.


---

# Estado global.

La gran librería aquí es REDUX.
Redux es guay! porque me ayuda mucho con el concepto de componentes desacoplados. Yo lleva en el ADN.
Tiene sus conceptos que hay que aprender:
- State
- Slice
- Action
- Reducer
- Store
- Effect
- Selector

Montar/Usar REDUX nos da un poco de parafernalia el día 1 de nuevo... Es cierto ritual, pero luego compensa mucho.

NOS RESUELVE UNA PAPELETA ENORME: COMUNICACIONES ENTRE COMPONENTES (WEB y NO WEB) DE MI SISTEMA
Se basa en un modelo orientado a Eventos, con comunicaciones asíncronas entre los diferentes componentes de la aplicación.

- No quiero un componente web REACT llamando a un SERVICIO                              -> ACOPLAMIENTO
- No quiero un Componente web REACT llamando a otro componente web REACT directamente   -> ACOPLAMIENTO
- No quiero un servicio llamando a otro servicio directamente                           -> ACOPLAMIENTO

Por supuesto usaré interfaces... pero aun con interfaces, tengo uncierto nivel de ACOPLAMIENTO entre componentes.
Y un modelo de programación orientado a eventos ayuda a reducir ese acoplamiento.

Redux implementa un modelo de programación orientado a eventos, donde los componentes se comunican a través de acciones y el estado global se actualiza de manera centralizada mediante reducers. Esto reduce el acoplamiento entre componentes y facilita la gestión del estado de la aplicación.

    App, que al iniciar lanza un evento: NECESITO_CARGAR_DATOS
        Hasta aquí llega su RESPONSABILIDAD
    Componente LISTADO DE EVENTOS: Que se SUBSCRIBIRA/SACARÁ POR PANTALLA los DATOS (eventos deportivos) que se depositen en el estado global.
    Componente SERVICIO que escuchará el evento NECESITO_CARGAR_DATOS y se encargará de obtener los datos necesarios, depositándolos en el estado global una vez disponibles.

    Esto hace que LISTADO DE EVENTOS y SERVICIO aún no sabiendo nada el uno del otro, puedan comunicarse de manera efectiva a través del estado global.

El ESTADO GLOBAL: Es un objeto JSON que contiene toda la información compartida entre los diferentes componentes de la aplicación.

estado_global = {
    listado_eventos_deportivos: [
        evento1, 
        evento2,
    ],
    usuario_conectado: usuario1,
    ....
}

BASICAMENTE ESTAMOS DEFINIENDO VARIABLES GLOBALES!
Es ese concepto.

Ahora... tener variables GLOBALES en programación es una buena práctica? NO ni mucho menos..
Entoces como encaja esto?
El problema no es tener una variable global.
El problema es que cuando tengo una variable global se complican mucho las cosas:
- Difícil de controlar quién y cuándo modifica la variable.
- Puede generar efectos colaterales inesperados.

Cómo lo resuelve redux:
   - La variable global (hay una: estado_global) apunta a un dato INMUTABLE.
     Se reemplaza entero si se quiere cambiar algun dato interno.
   - Establece un flujo CERRADO para cambiar ese valor. Nadie puede cambiarlo PORQUE SI.
     El cambio está controlado mediante un flujo.
     No permite que se hagan 2 cambios simultáneamente sobre el estado global.
   - Permite avisar a los componentes interesados cuando el estado global ha cambiado.
   - Permite definir EFECTOS COLATERALES controlados, como llamadas a APIs o actualizaciones de otros sistemas, en respuesta a cambios en el estado global.


De entrada no puedo cambiar cosas en esa variable... Se cambia entera.
Y se cambia por FUNCIONES CONCRETAS que definimos. No hay otra forma de cambiar la variable.
Esas funciones tampoco pueden ejecutarse de manera arbitraria. 
Las ejecuta REDUX, cuando se recibe un EVENTO que alguien ha solicitado.

Esas funciones en REDUX se llaman REDUCERS.
Los eventos en REDUX se llaman ACTIONS.
La variable se llama ESTADO.

---
Por donde empezamos:

## Definir el estado

```yaml
estado_global:
   informacion_sobre_eventos:
    estado:                         sin_solicitar # recibida , sin_solicitar, error_en_la_solicitud, solicitada
    listado_de_eventos:             ~
    cuando:
        solicitud:
        recepción:
    paginacion:
        pagina_actual: 1
        total:
            paginas: 1
            eventos: 0
    ordenacion:
        campo: ~
        direccion: ~
    filtros: [
        {campo: ~, valor: ~},
        {campo: ~, valor: ~}
    ],
    error: ~

```
El servicio qué me da? El que hemos montado? Cuál de esa información SALE DEL SERVICIO
- Lista de eventos
- Paginación
- Cuando?
- Filtros?
- Ordenacón?
- Estado? Un poquito


1000 eventos: 2kbs por evento -> 2000 kbs = 2 MB
Es mucho 2Mbs? RIDICULO
    En un movil con 4 Gbs? Con una red 4G o 5G, que baja datos como loca?

100000 eventos: 2kbs por evento -> 200000 kbs = 200 MB
Estas cuentas hay que echarlas.

Este estudio tengo que hacerlo el día 1.
Condiciona incluso al backend. Los endpoints que me tiene que pasar.

A lo mejor me interesa montar un backend REACTIVO... que por una conexión http va mandando datos de a poco!
Según los va cargando.. usando un driver de BBDD reactivo.
Y A nivel de HTTP cambia la cosa: Lo que devuelvo debe ser contenido reactivo, es decir, que se vaya enviando a medida que se genera o se recibe desde la base de datos. Stream de datos.

Por donde sigo? que ya tengo el estado?

## Cómo cambio este estado global? Qué operaciones existen/defino para modificarlo

```yaml
estado_global:
   informacion_sobre_eventos:
    estado:                         sin_solicitar # recibida , sin_solicitar, error_en_la_solicitud, solicitada
    listado_de_eventos:             ~
    cuando:
        solicitud:
        recepción:
    paginacion:
        pagina_actual: 1
        total:
            paginas: 1
            eventos: 0
    ordenacion:
        campo: ~
        direccion: ~
    filtros: [
        {campo: ~, valor: ~},
        {campo: ~, valor: ~}
    ],
    error: ~
```
Una operación puede modificar 50 datos a la vez... DEBE HACERLO.
Hay restricciones entre los campo, que debo explicitar.
Para poner:
    - estado = solicitado
       me tienen que dar filtros y ordenación.
    - estado = recibida
       me tienen que dar la lista de eventos, paginación, cuando
    - estado = error_en_la_solicitud
       me tienen que dar información sobre el error.
Y hay efectos colaterales:
    - Si me dicen estado = solicitado 
       -> listado_de_eventos = ~
       -> paginacion = ~
       -> error = ~
     
A esas reglas, les doy un nombre: OPERACION
Las operaciones/eventos las nombro como VERBOS EN INFINITIVO -> Redux los llama ACCIONES = VERBO
Igual que a los estados los nombro con SUSTANTIVOS O ADJETIVOS (Participios de verbos o gerundios)

Una acción cambia el estado!

Operaciones / Eventos:
  - SOLICITAR_LISTADO_DE_EVENTOS    |
      - Qué me tienen que dar?      |           ACTION DE REDUX
        - filtros                   |
        - ordenación                |
      - Qué efectos tiene sobre el estado?                                      |
    ```yaml                                                                     |   REDUCER
                   informacion_sobre_eventos:                                   |   El reducer es la función que deja el estado así
                        estado:                         solicitada
                        listado_de_eventos:             ~
                        cuando:
                            solicitud:                  FECHA_AHORA
                            recepción:                  ~
                        paginacion:
                            pagina_actual:              1
                            total:
                                paginas:                ~
                                eventos:                ~
                        ordenacion:                     la que me hayan dicho
                        filtros:                        los que me hayan dicho
                        error:                          ~                       |
    ```
      - Qué otros efectos colaterales tiene sobre mi sistema?                   |
                EL SERVICIO TIENE QUE PREGUNTAR AL BACKEND                      |   EFECTO

  - RECIBIR_LISTADO_DE_EVENTOS
      - Qué me tienen que dar?
        - listado
        - paginación
        - fecha
      - Qué efectos tiene sobre el estado?                                      
    ```yaml                                                                     
                   informacion_sobre_eventos:                                   
                        estado:                         recibido
                        listado_de_eventos:             el que me dan
                        cuando:
                            solicitud:                  la que hubiera
                            recepción:                  la que me dan
                        paginacion:
                            pagina_actual:              1 / la que hubiera que tiene que ser la 1 por narices
                            total:
                                paginas:                la que me dan
                                eventos:                la que me dan
                        ordenacion:                     la que hubiera
                        filtros:                        la que hubiera
                        error:                          ~ / lo que hubiera.. que debería ser vacío por narices
    ```
      - Qué otros efectos colaterales tiene sobre mi sistema?
        Los componentes se tienen que actualizar con el nuevo listado de eventos recibido. Se gestiona vía subscription.

  - SOLICITAR_PAGINA_LISTADO_DE_EVENTOS ...
  -...


Los reducers son funciones que:
- reciben el estado actual y los datos asociados a un evento/accion
- devuelven el nuevo estado resultante de aplicar los cambios necesarios.
    

---


    PANTALLA

        Fecha:          | Hoy               |
        Tipo de evento: | Partido de futbol | -> Cuando se cambia el filtro: No ponía nada y se puso partido de futbol
                                                    quiero guardarlo en estado global? NO
                                                    Es un estado local de componente
            [ BUSCAR ]
                Todos los partidos de futbol de hoy (que estén por empezar o estén jugándose)
                    EVENTO: TRAER LA PRIMERA PAGINA DE EVENTOS de futbol de hoy y también TRAER CUANTAS PAGINAS HAY DISPONIBLES

    ---
    Pero en la misma pantalla, tengo un menú lateral con opciones de navegación.
    Y una es: 
        Carreras de motos en directo!
            ^^^
            Cuando pincho aquí que tiene que pasar?
                QUE ME SAQUE QUE LISTADO?
                    Motos y ahora en directo
                    EVENTO: TRAER LA PRIMERA PAGINA DE CARRERAS DE MOTOS EN DIRECTO y no solo eso: TAMBIEN TRAER CUANTAS PAGINAS HAY DISPONIBLES


Con uno o con otro llegaré a un listado en pantalla
    EVENTOS:


    NAVEGACION:
        Página 1, 2, 3, 4
                     ^
                     Cuandop pulse en esa?
                        EVENTO: TRAER LA PAGINA CORRESPONDIENTE DE EVENTOS

---

En redux, definimos:
- Estado
- Acciones
- Reducers
- Efectos

Redux, que va pensado para trabajar con módulos tiene un concepto adicional: SLICE / Partición del estado.

estado_global:{
    informacion_sobre_evento: {},
    información_sobre_usuario: {},
    información_sobre_apuestas: {}
}

Para evitar tener un estado tan grande.. y reductores enormes, podemos dividir el estado en slices, cada uno con su propio reducer y acciones asociadas.

Lo que tenemos en el proyecto > Front/Apuestas/CatalogoEstado es un slice realmente, no el estado global... UN TROZO DEL ESTADO GLOBAL.

Además, falta otro concepto:
- STORE (No store como tienda, STORE como ALMACÉN DEL ESTADO GLOBAL)

El estado global (esa variable/objeto JSON) se guarda en un STORE, que es el almacén centralizado de todo el estado de la aplicación.

Al STORE es al que le configuraro los reductores, los efectos.
Y al store es al que le mando el EVENTO/accion para que actualice el estado global.
Al store también aes a lo quemis componentes se suscriben para recibir actualizaciones del estado global.

Nuestro proyecto NO DEFINE UN STORE... Define el tratamiento que hacemos de un SLICE del estado global.

El STORE se define en una APLICACION... e incluirá distintos slices del estado global, cada uno con su propio reducer y acciones asociadas.

2 apps diferentes tendrán STORES DIFERENTES. Cada uno con sus slices correspondientes. Puedo reusar slices en distintas aplicaciones si quiero. Pero seguramente apps diferentes tengas al menos algunos slices distintos.
MAS DESACOPLADO: Cada slice puede ser desarrollado y mantenido de manera independiente, lo que facilita la escalabilidad y el mantenimiento de la aplicación.
A nivel de aplicación, decido que slices del estado global voy a incluir en el STORE de esa aplicación.
---

# SELECTORES

Qué es un selector?

Vienen a resolver un problema que tenemos al trabajar con estados globales.

```yaml
estado_global:
   informacion_sobre_eventos:
    estado:                         sin_solicitar # recibida , sin_solicitar, error_en_la_solicitud, solicitada
    listado_de_eventos:             ~
    cuando:
        solicitud:
        recepción:
    paginacion:
        pagina_actual: 1
        total:
            paginas: 1
            eventos: 0
    ordenacion:
        campo: ~
        direccion: ~
    filtros: [
        {campo: ~, valor: ~},
        {campo: ~, valor: ~}
    ],
    error: ~
```

Ese es el slice que hemos definido para la información sobre eventos dentro del estado global.

Vamos a tener a muchos componentes (servicios, componentes web,...) suscritos a este slice del estado global para recibir actualizaciones cuando cambie.
Tendre un componente WEB llamado ListadoDeEventosWebComponent, que mostará el listado de eventos que estén cargados.

Qué propiedad(es) le interesa especialmente a este componente?
    - `estado_global.informacion_sobre_eventos.listado_de_eventos`
    - `estado_global.informacion_sobre_eventos.estado`
    - `estado_global.informacion_sobre_eventos.error` ? Si es que lo saco donde está el listado (que no sería lo suyo)
    - `estado_global.informacion_sobre_eventos.ordenacion`

La paginación... posiblemente la metamos en otro componente WEB, llamado PaginacionWebComponent.
Los filtros..... posiblemente los metamos en otro componente WEB, llamado FiltrosDeEventosWebComponent.

Tendré muchos componentes suscritos a este slice del estado global, cada uno interesado en diferentes propiedades según su funcionalidad. Algunos incluso trabajarn / se suscribiran a varias propiedades a la vez. Y compartiran propiedades con otros componentes.

Veís algún punto delicado en esto? Esto genera un alto ACOPLAMIENTO entre los componentes y la estructura interna del estado global.
Qué pasa si mañana decido cambiar la estructura interna de la variable Estado_Global?
Esto puede ser algo que ocurra? Probabilidad de que eso ocurra? 100% Esto va a pasar!
Cuando empiezo el proyecto NO TENGO TODAVIA UNA VISION CLARA DEL MISMO.
Y además, según pasen los meses/años y vayan apareciendo nuevas funcionalidades, es muy probable que tenga que cambiar la estructura interna del estado global.

Y si lo cambio, que pasa con el cambio? Qué implicaciones tendría?
- Tengo que cambiar los reducers <--- ESTE ME IMPORTA? NO
      Por qué? es el mismo proyecto! Cambia junto con la estructura interna del estado global.
      Están intimamente ligados. Son cosas que deben ir juntas y evolucionar juntas.
      Tienen alta COHESION... y está bien que sea así. Van de la mano
      Cambio el estado global en el proyecto Frontal/Apuestas/CatalogoEstado y tengo que cambiar sus REDUCTORES..
      Los reductores están dentro del mismo proyecto. Y tienen sentido que lo estén por COHESION.. van juntos.
      Saco una nueva versión del PROYECTO ENTERO / COMPONENTE.
      Cuando edite el estado, evidentemente tendré que editar los reductores correspondientes.
      Y quizás añadir nuevos eventos/actiosn...
- Tengo que cambiar todos los componentes que estén suscritos al slice del estado global afectado.
      Y Este? EIN???!?!?
      Cambio el estado global en el proyecto Frontal/Apuestas/CatalogoEstado y tengo que cambiar 50 componentes WEB?
        ESTO NO!!!!
        Cuando esto pasa es que tengo un ALTO ACOPLAMIENTO entre los componentes y la estructura interna del estado global.
        ESTO ES UN PUTO MONOLITO!
        Que cambio una cosa aqui y explita allá a 50 kms.
        ESTO ES LO QUE NO QUIERO... por cambiar un proyecto, tener que cambiar otros 50.
        Si eso pasa es que tengo un mal DISEÑO / ARQUITECTURA!

        Esto es lo típico que como no lo tenga en el radar, tiro para delante y al año LA CAGADA ES DANTESCA.
        Me piden un cambio chiquitito y tardo 6 meses. Por el IMPACTO DE ESE CAMBIO... Por COMO SE PROPAGA ESE CAMBIO POR MI CODIGO.
        Y eso no puedo permitirlo. Porque además, SE QUE VA A PASAR!
        Necesito una forma de CONTROLAR LA PROPAGACION DE ESOS CAMBIOS CUANDO SE PRODUZCAN!

        > En el backend... si hay cambio (manda JSON con otro formato), ese cambio impacta a todo mi frontal?
        NO DEBERIA... me lo curro para que eso no pase.. Y DE HECHO NOS LO HEMOS CURRADO.
        Quién actúa de muralla de contención de propagación de cambios? Quién ABSORBE EL CAMBIO en nuestro código? 
            DTOS propias y MAPPERS entre nuestras DTOS y las del backend.
            Si cambia Backend, solo tengo que actualizar los MAPPERS, el resto del código permanece intacto.
            Si no tuviera DTOs propias y mappers, el cambio del backend se propagaría por todo mi código, por tener alto acoplamiento.

> Cómo podemos resolver esto? Disminuir el ACOPLAMIENTO entre mis componentes web y la estructura del estado global?

Igual que con los DTOs de frontal y backend, metiendo una pieza en medio que absorba los cambios.
Siempre es lo mismo.

TENGO UNA MESA
Y ENCIMA DE LA MESA un aparato que vibra un montón (IMPRESORA 3D, CNC)
Esos componentes están muy ACOPLADOS.. LA vibración de la impresora se transmite a la mesa y a todo lo que esté encima.
Vibra la impresora y vibra la mesa...
Que hago para resolverlo?
Tengo que DESACOPLAR la impresora de la mesa.
Pongo un amortiguador entre la impresora y la mesa, que absorba la vibración.
Así, aunque la impresora vibre, la mesa permanece estable, porque esa capa intermedia se come la vibración.
Pondré muelles en las patas, pondré unos SILENT BLOCKS, cualquier cosa que absorba la vibración y desacople la impresora de la mesa.

Ese elemento intermedio es el que absorbe la vibración y desacopla la impresora de la mesa.
Siempre es igual!
Nuestros mapeadores son los SILENT BLOCKS, los que desacoplan nuestro código de los cambios del backend.
LOS SELECTOCTES DE REDUX SON LOS SILENT BLOCKS DEL ESTADO GLOBAL, los que desacoplan nuestros componentes de los cambios en la estructura del estado global.

Son funciones, que cogen el estado global y extraen de él una parte que me puede interesar.
Si cambia la estructura del estado global, tendré que cambiar los selectores para seguir proporcionando a los componentes solo la parte que les interesa, sin que estos tengan que preocuparse por los cambios en la estructura del estado global.
Que es algo que no es de su competencia.

Dentro del slice/redx/componente del estado global es donde definimos los selectores que extraen la información relevante para nuestros componentes. Si cambio estado etructura de estado global, cambiaré reductores y selectores, todo eso va junto.. ES UN PROYECTO.
Que se distribuye de una!
Tu cambia internamente la estructura del estado global, y mientras mantengas los selectores actualizados, los componentes que dependen de esos selectores no tendrán que preocuparse por los cambios internos.
Ya no tengo que cambiar 50 componentes , ni probar 50 componentes.

Todas estas librerías están muy pensadas!
Me obligan a mucha parafernalia el día 1... Crear selectors, reductores, ...
Pero el día 100 me ahorran muchísimo trabajo.

Hay gente que ve estas librerías y dice... NO JODAS! para una mierda la que tengo que liar!
Y van saliendo librerías más simples... que no llevan tanta parafernalia inicial.
Pero luego FLIPAS!
Necesitamos entender por qué esa parafernalia, que nos va a aportar y luego decidir.. si realmente nos compensa usarla en nuestro proyecto.

---

    Alguien    -> EMITE EVENTO -> STORE -> REDUCER -> CAMBIO EN ESTADO GLOBAL <- subscripción <- Otro Alguien
    (Servicio                                                                                    (Otro servicio, componente web)
    Componente Web)



En javascript tenemos tipado estático o dinámico? Es otro concepto... es DUCK-TYPING.

Si se parece a un pato, nada como un pato y hace cuac como un pato, entonces podemos tratarlo como un pato.
Yo tengo una clase/(interfaz/tipo) llamado Usuario y otro llamado UsuarioBackend
```js 
interface Usuario {
  nombre: string;
  edad: number;
}

interface UsuarioBackend {
  nombre: string;
  edad: number;
}

const usuarioBackend: UsuarioBackend = {
  nombre: "Juan",
  edad: 30
};

const usuario: Usuario = usuarioBackend; // Esto funciona gracias al duck-typing
// Es otro tipo de objeto.. no es reamente un objeto de tipo Usuario, sino un objeto de tipo UsuarioBackend
// Pero como tiene los mismos datos que un objeto de tipo usuario... para mi es un Usuario.

// Un mapper el día 1 devolvería lo mismo que le llega:

function miMapper(usuarioBackend: UsuarioBackend): Usuario {
    return usuarioBackend;
}
```
---

# Con esto seguimos avanzando en nuestra colección de COMPONENTES

Por donde sigo ahora? Podemos ir montando algún componente Web


## Componentes WEB

Qué son?

UNA MARCA PERSONALIZADA HTML QUE YO DEFINO: ListadoDeEventos

Esa marca tendrá asociada:
- Nombre TAG         <listado-de-eventos>
- Atributos          <listado-de-eventos lista="[eventos]">  <- Le doy los eventos
                          podría hacer tmabién que el componente saque el listado de un estado global <- Coge los eventos
                     <listado-de-eventos orden="[campo,asc]">  <- Ordeno los eventos
                     <listado-de-eventos columnas="[col1,col2]">  <- Ordeno los eventos
                     <listado-de-eventos modo="[compacto, detallado]">  <- Defino el modo del listado
                     <listado-de-eventos seleccionable=true>  <- Defino el tema del listado
- Eventos
                     <listado-de-eventos onCambioEnLaOrdenación="miFuncion()">  <- Manejo el evento de cambio en la ordenación
- Estado local del componente. Ejemplos:
    El componente tendrá un reflejo de algunos atributos globales:
    - listado de eventos (si no me lo han pasado explicitamente como atributo)
    - estado de carga de ese listado...
    Propios... que vaya él generando/gestionando 
    - Si el componente admite selección de eventos: los eventos que están seleccionados
      - Cuando quiera notificar esto / COMUNICACION ENTRE COMPONENTES (por ejemplo, si hay alguno -al menos 1- seleccionado activar botón EXPORTAR) tengo 2 opciones:
        - EVENTO local(HTML) al componente padre   MAS ACOPLAMIENTO (en paralelo miro la COHESION!)
        - EVENTO GLOBAL (al store de redux)
        - SERVICIO = MAL ASUNTO / Me lo curro de 0. RxJS
- Lógica interna del componente (que suele ir asociada al control del estado)
        Ordenación: LANZO EVENTO
        Actualización de datos -> Reasigno una prop interna
        Si hacen clic en un evento con CTRL apretada: AÑADO EL EVENTO A LA LISTA DE SELECCIONADOS
        Si hacen clic sin CTRL: REEMPLAZO LA LISTA DE SELECCIONADOS CON EL EVENTO CLICADO
- Plantilla (lleva lógica? SI LLEVA LOGICA!)
  - LOGICA DE PRESENTACION: IFs / Condicionales (por eso no es solo HTML)
    Si el estado es X -> Esta representación
    Si el estado es Y -> Otra representación
- Estilos


        Componente Web ListadoDeEventos
                            V   ^^^^ GUARDA MUCHA COHESION... Deben de ir juntos y los trato juntos y los evoluciono juntos.
        SubComponente Web DetalleDeUnEventoEnElListado (Trabajo con eventos locales)


Angular     La organización/estandarización
            Servicio = Libertad!
  vs
 React      La libertad
            Redux - Organización/estandarización (RIGIDEZ)

La libertad tiene un problema enorme!
Que distintas personas hacen las cocsas como a cada una le sale de los huevos. Y luego llega otro a ver el proyecto y no se empapa.



























---

# Cucumber/Gherkin

Gherkin (pepinillo) es un lenguaje para definir pruebas.
Realmente NO ES UN LENGUAJE... es un conjunto de RESTRICCIONES sobre lenguajes naturales que permiten definir pruebas de manera estructurada y comprensible tanto para humanos como para máquinas.

Cucumber es un motor de procesamiento de Gherkin.
Cucumber lee ficheros gherkin y los ejecuta contra código.

Para ello, cucumber necesita 2 cosas:
1. Ficheros Gherkin que definan las pruebas.
2. El código asociado a cada paso definido en los ficheros Gherkin.

Qué nos ofrece Cucumber:
- Un lenguaje de alto nivel donde definir las pruebas                                           GUAY!
- Un API para aportar el código asociado a cada paso definido en los ficheros Gherkin.          MEDIO GUAY!
  - En un poco rollo, tienes que escribir código para cada paso definido en los ficheros Gherkin, lo que puede ser tedioso.
  - La gracia es que es reusable! GUAY!
  - Esto suele pasar. Y es agradecido el rusar textos.

Pero impone cierto ritual.
Usar librerías/frameworks de pruebas tipo mocha, jest (en backend MSTest) es más directo.
Pero:
- 1. Da lugar a pruebas menos mantenibles
- 2. No cualquier persona entiende esas pruebas / lenguaje

SOLEMOS RESERVAR GERKIN/CUCUMBER para pruebas de SISTEMA!
Y esas (tanto en back como en front) si tiene sentido hacerlas en cucumber. Estas pruebas además queremos que sean leídas por personal técnico y no técnico (negocio). Las pruebas a su vez son REQUISITOS DE SISTEMA (FUNCIONALES)!

Cuesta un poco comenzar, hay que configurar varias cosas.
Como esto, hoy en día lo solemos montar con una IA, tampoco me da mucha guerra... ni pereza.. antes nos daba más pereza.