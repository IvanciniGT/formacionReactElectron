
# Qué componentes hemos creado

- Componente que cierra el contrato con el backend: API REST + API Websocket    <- Trabajitos: VALIDAR
- Modelos del Backend                                                           <- Trabajitos: GENERAR en automático
   Interfaces (tipos de datos + campos que tienen) 
   Invariantes: Límites, expresiones regulares, valores por defecto
   Errores: Tipos de errores que puede devolver el backend
- API de un servicio frontal para comunicarnos con el backend                   <- Trabajitos: 
                                                                                    - Comprobar las Divergencias de:
                                                                                      - nuestros modelos del API de uso interno
                                                                                      - los modelos del API del backend
                                                                                    - Generar la versión 1 de nuestros modelos en base a los del API: Heredamos tipos, campos e invariantes. DIA 1
    Aquí tenemos muchos métodos (4). Tienen una peculiaridad: Asincronía (Promise o Observable)
- Pruebas del API del Servicio (Pruebas de caja negra del API). En nuestro caso las diseñamos después de escribir el API.
  Podríamos haber escrito las pruebas ANTES DE ESCRIBIR EL API: Desarrollo guiado por pruebas (TDD).
    - Normalmente será pruebas de sistema!
- Implementación de API del servicio de frontal.
      Test de caja blanca (auqnue deberá pasar también los test de caja negra definidos a nivel de API del servicio).
      Test de Integración (comprobamos que todos los componentes funcionan correctamente juntos)
- Servidor de Backend FAKE...,. que devuelve 4 datos: Madrid-Barça y 33

Queremos una app WEB (React) para que los jugadores puedan:
- Ver eventos que hay
- Ver mercados de cada evento
- Ver las selecciones de cada mercado
- Realizar apuestas en cada selección (Más adelante):.. malditos los del backend que aún no me han pasado eso en el contrato!

Por donde sigo ahora que tengo esto de aquí?
OJO, que he montado antes del frontal.. porque quizás tenga varios frontales...y pueda reusar todo esto.

Empezamos ya por fin a definir componentes React. Podría... y me acabaría metiendo en un charcazo!
OJO: En nuestro caso estamos haciendo un desarrollo BOTTOM - TOP (desarrollo desde los componentes de abajo hacia los de más arriba)
Podría hacer un desarrollo TOP - DOWN (de arriba hacia abajo), donde empezaría por los componentes WEB / REACT... pero... sin mezclar capas.
Y el punto, es que hay una capa entre medias del servicio y de los componentes que aún no ha dado la cara!
CUAL?
Pistas: Es una capa que antes se definía en el backend. Y hace ya como 15 años que se movió al frontal.

EL CONTROL DEL ESTADO DE LA APLICACION!
Antiguamente las apps de backend eran: STATEFUL, es decir, mantenían el estado de la aplicación en el servidor.
Hoy en día son: STATELESS, es decir, no mantienen el estado de la aplicación en el servidor, sino que lo gestionan en el cliente (frontal).

REST: Representational State Transfer. Es un estilo de arquitectura para diseñar servicios web que son stateless, es decir, no mantienen el estado de la aplicación en el servidor.

Es lo que antiguamente en backend se implementaba con el concepto de SESSION, donde el servidor mantenía el estado de la aplicación para cada usuario.

Una cosa es el Servicio, que me permite interactuar con el backend y obtener datos.
Y otra cosa es el estado de la aplciación, que se montará (la aplciación) vía componentes React.
Otra cosa son los componentes React, que se encargan de la interfaz de usuario.

De hecho, hay librerías que nos ayudan un huevo a controlar ese estado, y a hacer una separación muy clara de todas estas capas. La más usada en JS se llama: REDUX. 

REDUX es una librería para el control del estado de la aplicación en aplicaciones JavaScript. 
REDUX me invita a un modelo de programación basado en Eventos y en un flujo de datos unidireccional y en manipulación de objetos Inmutables.

Pero antes de meternos con redux, planteemos el estado de la aplicación y cómo queremos gestionarlo... luego lo llevamos a redux.

Por supuesto yo podría hacer que mi componente REACT X llame a nuestro Servicio... Creando un nivel de acomplamiento Alto entre el componente y el servicio. Pero ya dijimos que al desarrollar, lo que buscamos es :
- MINIMIZAR el acoplamiento entre componentes y servicios.
- MAXIMIZAR la cohesión dentro de cada componente o módulo.

Qué es el estado de nuestra aplicación? BASICAMENTE EL CONJUNTO DE DATOS QUE USA EN UN MOMENTO DEL TIEMPO.
Para nuestra aplciación: Cuáles son esos datos/conjuntos de datos?

- Ver eventos que hay
- Ver mercados de cada evento
- Ver las selecciones de cada mercado
- Realizar apuestas en cada selección (Más adelante):.. malditos los del backend que aún no me han pasado eso en el contrato!

TODO ESTO ES EL ESTADO DE NUESTRA APP.

- EVENTOS QUE HAY ACTUALMENTE
  - MERCADOS
    - SELECCIONES
- JUGADOR
- APUESTAS QUE SE ESTAN REALIZANDO / REALIZADAS
- Quiere el usuario tema claro o lo quiere oscuro
- Errores que se han producido al llamar al backend / Estado de operatividad del backend
- Formato de las cuotas
- Filtros o selecciones que haga el usuario (qué evento está mirando), que eventos quiere ver.
- Cómo los quiere ver? Ordenación, campos....
    ^^^^
    Estado de la app. Habrá que analizar si todo es estado GLOBAL o parte es estado de COMPONENTE.
    Y otra cosa que analizar es SI TIENE SENTIDO AGRUPAR TODOS ESOS DATOS en GRUPOS, para que la gestión / mnto sea más sencilla.
    REDUX permite hacer eso... lo llama "lonchas" del estado: Slice.
        Cada Slice se encarga de una parte del estado global y tiene su propio reductor y acciones.


REACT nos permitirá crear componentes con comportamiento dinámico, que REACCionen al estado de nuestros compoenntes o de nuestra aplicación.
Los componentes tendrán su estado... que puede o no guardar relación con el estado global de la aplicación.

Tendremos un componente WEB (que crearemos con REACT) ListadoDeEventos que se encargará de mostrar los eventos disponibles.

Otras librerías que me ayudan con eso?
- Angular
- Vue.js
- Polymer
  - LitElement

Componente WEB? -> SPA (Single Page Application)
Es una MARCA HTML custom que yo creo para mi proyecto(s).

<evento id="2948748"> <- Existe en HTML?
NO.. pero a mi interesa.. y la creo!

Y para crear la marca defino:
- Su comportamiento:    JS
- Su estructura:        HTML
- Su estilo:            CSS

APLICACION < MUCHOS COMPONENTES
           < MUCHOS SERVICIOS
           < ESTADOS 


Lo ideal es DESACOPLAR TODO ESO. Y eso puedo hacerlo con EVENTOS (PROGRAMACION ORIENTADA A EVENTOS). Con esto me ayuda REDUX.

El componente ListadoDeEventos, mostrará los eventos disponibles en el estado de la aplicación.
Y puede solicitar su carga.
Por supuesto puedo:
    1. Hacer que el componente ListadoDeEventos llame al Servicio para cargar los evento, generando un alto acoplamiento entre el componente y el servicio.
    2. O puedo hacer que el listado solicite la carga de eventos mediante un evento, desacoplando así el componente del servicio.
       Y SUBSCRIBIRSE A LOS CAMBIOS DEL ESTADO (para que cuando lleguen eventos, el componente reciba los datos automáticamente).

Pero el componente no debería ASUMIR LA RESPONSABILIDAD DE LLAMAR AL SERVICIO.
Su RESPONSABILIDAD ES PINTAR DATOS (de eventos).
Eso si... para pintar dato, NECESITA DATOS... y hace 2 cosas:
- Subscribirse a los datos que tenga la app.
- Y notificar (vía un evento) que NECESITA_DATOS.

En REDUX (si uso redux) puedo lanzar eventos, mediante lo que redux llama "acciones" (actions).
Un ACTION de REDUX es solo un EVENTO que solicito que se ejecute!

Aquñi entra un concepto que llevamos siglos usando en programación: SCOPE! ALCANCE!
Quien necesita el dato?
- Solo yo, lo guardo yo
- Es compartido? Entonces NO LO GUARDO YO.,
- Por eso tenemos estado(DATOS) a nivel de app y estado a nivel de componente.


ESTADO: OK
        ERROR GORDO DE NARICES 
        ERRORCITO
        OCUPADO


SERVICIO deja de lanzar peticiones.. o aplica una determinada política de reintentos.

    Arranca al app.
    De alguna forma (NO SABEMOS... EVENTO ;) ) se solicita la carga de datos.
    Entra el servicio y llama al backend: (ASINCRONO)
    Entre tanto muesto la pantalla: CARGANDO LA SUPER APP DE ORENES COJUNDA!
    El servicio recibe 500. OStión padre la huerta! El backend está jodido
        Emite evento:  BACKEND_JODIDO_ERROR_GORDO_QUE TE_CAGAS
        Sigue reintentando la petición, aplicando una determinada política de reintentos.
    Pero el componente que muestra la APP (Menu, CABECERA, Listado de eventos) Se entera (porque está subscrito) de que HAY ERROR GORDRO DE COJONES!
    Y decide no mostrar esos SUBCOMPONENTES (Menu, Cabecera, ListadoDeEvemntos) Y mostrar el componente:
    OVERLAY GORDO ROJO (ERROR QUE TE CAGAS)

    El servicio no llama al componente ERROR GORDO ROJO QUE TE CAGAS.
    Yo, OH CREADOR DEL SERVICIO... a mi que leches me importa quien o como se muestre ese error. MI RESPONSABILIDAD TERMINA EN AVISA QUE EL BACKEND ESTA COLGAO!
        Emito nota: A QUIEN LE INTERESE: EL BACKEND ESTÁ COLGAO!
    El componente Web APP PRINCIPAL Se subscribe a esos avisos... más bien al ESTADO DE OPERATIVIDAD DEL BACKEND.
    Habrá alguien que COMO CONSECUENCIA DE HABER NOTIFICADO ESE EVENTO, actualizará el estado GLOBAL DE OPERATIVIDAD DEL BACKEND.
    Aquí no hay acoplamiento.
                                                                        ESTADO
    ServicioDeUsuarios  -> Backend OK , Backend CAGADO ! -> PROGRAMA -> OperatividadDelBackend <- subscripción al estado -> Componente
    ServicioDeEventos   ->      Evento (ACCION)             Reductor                                    aviso
    ServicioDeApuestas  ->                                  Efecto
                                                                ^
                                                        if Backend CAGADO -> OperatividadDelBAckend = FALSE
                                                        else -> OperatividadDelBackend = TRUE

Reductor es una función que recibe (Estado actual + Acción) y devuelve el nuevo estado.

Vamos a coger una loncha del estado global (Slice): EVENTOS/MERCADOS/SELECCIONES.
Pensar en esa LONCHA como si fuera una tabla CLAVE VALOR. (intermante en realidad es un OBJETO JS: {})

```json
"estado_global": {
    "jugador": { // LONCHA JUGADOR
        "api_token": "SJFD8213876298asSDFASAS",
        "Nombre": "Menchu",
        "Tema": "Oscuro"
    },
    "eventos": { // LONCHA EVENTOS
        "evento1": {
            "nombre": "Fútbol",
            "fecha": "2024-06-15",
            "mercados": {
                "mercado1": {
                    "nombre": "Resultado",
                    "selecciones": {
                        
                    }
                }
            }
        }
    }
}
```

Qué datos me interesa guardar sobre eventos?
```json
{
    "eventos": {
        "listado":{
            "datos_actuales": [
                {
                    id: "evento1",
                    nombre: "Fútbol",
                    fecha: "2024-06-15"
                    estado: "pendiente",
                    mercado_principal: "mercado1"
                },
                {}
            ],
            "paginación": {
                "pagina_actual": 1,
                "total_paginas": 5,
                "elementos_por_pagina": 10,
                "total_elementos": 50
            },
            "hora_actualizacion": "2024-06-15 12:00:00",
            "estado_consulta": "en_proceso", // Finalizada, // Error // Sin hacer
        }
    }
}
```
Eventos(Acciones):
- SOLICITAR_LISTADO_DE_EVENTOS (pagina_actual=1, tamaño_de_pagina=10)
- LISTADO_DE_EVENTOS_RECIBIDO  (listado, paginación, hora_actualizacion)
- LISTADO_DE_EVENTOS_FALLIDO   (error)

Reductores:
- eventos: (estado_actual, acción) => nuevo_estado
    - SOLICITAR_LISTADO_DE_EVENTOS: Cambia estado_consulta a "en_proceso" y llamar al servicio
    - LISTADO_DE_EVENTOS_RECIBIDO: Actualiza listado, paginación, hora_actualizacion y cambia estado_consulta a "finalizada"
    - LISTADO_DE_EVENTOS_FALLIDO: Cambia estado_consulta a "error"

Dejaría esto así? NO. Por qué? DE NUEVO ESTOY GENERANDO ACOPLAMIENTO! La llamada al servicio... MAL ASUNTO!
Si mañana cambio el servicio, que necesitaré hacer, además de cambiar el servicio? Cambiar el REDUCTOR
Toco allí y se jode acá = ACOMPLAMIENTO!
Quiero esto? NO

Solución:
    - SOLICITAR_LISTADO_DE_EVENTOS: Cambia estado_consulta a "en_proceso" 
  
Mi problema (preopupación oh, yo, creador del recductor) no es llamar al servicio.
Tengo 2 opciones:
- Opción 1: Que el servicio se subscriba a "estado" -> "en_proceso" y se encargue de realizar la llamada cuando corresponda = RUINA!
- Opción2: Que el servicio configure un EFECTO COLATERAL Asociado al evento: "SOLICITAR_LISTADO_DE_EVENTOS" y cuando se lanza el evento:
  El servicio lanza la petición al backend... asíncronamente.
  Y deja preprogramada una función de callback que dice:(lo que escribe detreás del ticket de la tintorería)
    emite un evento de tipo: LISTADO_DE_EVENTOS_RECIBIDO(listado, paginación, hora_actualizacion) o LISTADO_DE_EVENTOS_FALLIDO(error) según corresponda.

Si cambio el servicio, el nuevo servicio será responsable de configurar los EFECTOS QUE EL NECESITE... ES SU PROBLEMA (RESPONSABILDIAD/PREOCUPACION) no la mia.

El dato: `eventos.listado` quien lo provee?    Servicio
Quien lo consume?                              Componentes: ListadoEventos,    Cabecera: (Total eventos actuales: 37, Eventos en curso: 14)

Todo queda desacoplado, es decir, NADIE SABE DE LA EXISTENCIA DE NADIE.
    - Los componentes NO SABEN DE LA EXISTENCIA DE LOS SERVICIOS
    - Los servicios NO SABEN DE LA EXISTENCIA DE LOS COMPONENTES 
    - Los servicios no saben de la existencia de otros servicios.
    - Nadie sabe de nadie. Cada uno hace lo que debe. Y cuando toca MANDAN NOTIFICACIONES/EVENTOS: A QUIEN PUEDA INTERESAR.

ESTO ES UNA ARQUITECTURA COJONUDA desde el punto de vista de MANTENIMIENTO... y por supuesto MAS COMPLEJA DE MONTAR EL DIA 1.

El estado, eso si, lo trato de forma INMUTABLE. CAMBIA ENTERO! No se edita!
Es esto ineficiente: SI. Me importa? NO
Mi app web se está ejecutando en un PC / TELEFONO con un SNAP DRAGON de 4 cores y 6 GBs de RAM... que está DUERMIENDO... editando un json.
3ns. PARA UN JUGADOR.. Otro Jugador tiene SU PROPIO SNAP DRGAON ... y así sucesivamente.

---

# Qué es una promesa? y qué leches es esto de la programación ASINCRONA?

Programación ASINCRONA: No tiene que ver con HILOS (Threads). De hecho en JS a priori, y si no la lio parda (WebWorkers) no tenemos HILOS, tenemos HILO ÚNICO (Single Thread).

La idea es que tengo una función que quiero ejecutar, pero de la que AHORA no necesito al respuest, y por end, no me quedo esperándola.
YA. Eso implica que en el entorno de ejecución, la ejecución de esa función puede postponerse hasta que sea necesario su resultado. O cuando tenga hueco (capacidad de procesamiento disponible).

En C# o Java, la asincronía se maneja con hilos (Threads) y tareas (Tasks).
En JS la asincronía se maneja principalmente con Promesas (Promise) y Observables (Observable.. pero aquí solo hay un hilo único - Single Thread).

La asincronía puede ser concurrente (cuando trabajo con hilos) o no concurrente (cuando trabajo con un solo hilo, como en JS).
Concurrencia es cuando ejecuto varias tareas al mismo tiempo. Esto en JS no ocurre!
En JS lo que pasa es que tenemos capacidad para que el trabajo que se está ejecutando en un hilo quede pausado y continuar con otro trabajo, y posteriormente retomar (en el mismo hilo de ejecución) el trabajo que había dejado pendiente.

Esto lo soportan otros lenguajes, no solo JS: Kotlin con sus corutinas.

Tenemos 2 formas principales de lidiar con asincronía en general:
- Esperas (waits, await)
- Función de callback (función que se pasa como argumento a otra función y se ejecuta cuando la operación asincrónica termina)

La cosa es que en JS (Y es lo lioso) los 2 modelos se implementan mediante la Promesa.

Dicho de otra forma, trabajando con asincronía en JS Siempre paso por una Promesa, que puedo usar con awaits o con funciones de callback, yo elijo... y son diferentes:
- Esperas (BLOQUEANTE). Dejan el hilo ocupado hasta que la operación asincrónica termina.
- Función de callback (NO BLOQUEANTE). Permiten que el hilo continúe ejecutando otras tareas hasta que el dato hace falta o hay capacidad para procesarlo.

> Ejemplo de lo que sería una tarea asíncrona en el mundo real:
> Voy a la tintorería a llevar una camisa.
> Me quedo esperando a que terminen y me devuelvan la camisa? NO me quedo esperando. Tengo mejores cosas que hacer en mi vida. Ir a tomar un cafecito! Pero me voy sin más de la tintorería? NO... antes de irme me dan un ticket... A ese ticket SI LE ESPERO!

> El ticket VALE POR UNA CAMISA? Por qué voy a cajear el ticket? Qué me dan a cambio del ticket? La camisa limpia? PUEDE QUE SI o PUEDE QUE NO.
> El ticket no vale por una camisa... Vale por una potencial camisa limpia, que me darán si no hay problemas.
> Si roban la tintorería y se llevan en el proceso mi camisa, me la devolverán al entregar el ticket? NO
> Si se quema la tintorería y mi camisa se pierde en el proceso, me la devolverán al entregar el ticket? NO

La PROMESA que me hacen es que harán su mejor esfuerzo por entregarme una camisa limpia, pero no garantizan que siempre lo conseguirán.

Concepto de Promesa = TICKET

Y yo ahora puedo ir a hacer mis cosas... tomarme mi cafecito.
Cuando termine de tomarme el café puedo ir a por mi camisa... si aún no han acabado... espero a que me la devuelvan! BLOQUEO! WAIT!

Otra opción que habría tenido es coger el ticket, y escribir en él MI TELEFONO, y una orden: Cuando acaben de limpiar la camisa, llámame.

Cuando acaben me llaman <- FUNCION DE CALLBACK
Ahora no espero. En automático, quien esté ejecutando la función ASINCRONA (El lavado de la camisa) me llamará cuando termine.

En este ejemplo, cuánta gente hay trabajando/haciendo cosas? 2
- El de la tintorería que limpia mi camisa
- Yo, que voy a hacer otras cosas mientras espero que me devuelvan la camisa.

Aquí tenemos programación CONCURRENTE: 2 hilos de ejecución trabajando al mismo tiempo.

En JS, por defecto y lo normal es que eso no ocurra. YO soy quien limpia la camisa y quien la lleva. Yo me meto en la tintoreria a limpiar mi camisa. El hecho es que ahora mismo no me hace falta hacerlo... y dejo la tarea pendiente. Cuando acabe mi café y me aburra, puedo volver y ocuparme de la limpieza de la camisa. O si voy a salir por la noche, antes de salir, me joderé y me tocará ir a la lavandería a limpiar la camisa. Y después ya me iré.

Esto es así.. aunque luego pasan cosita en JS. Cuando trabajamos no realmente todo es ejecutado por mi hilo, aunque esté en JS.

Yo hago una petición a un servidor. La petición la hago yo (mi hilo), pero una vez hecha, yo ya no tengo que hacer nada... esperar a que la petición sea procesada por el servidor y que me devuelvan la respuesta. Entre tanto puedo seguir haciendo otras cosas. Si es que no necesito la respuesta en ese momento. El procesador / ejecuto de JS en paralelo (CONCURRENTE) se encarga de obtener y almacenar en memoria la respuesta. Y ya me la pasará a mi cuando yo me ponga de nuevo con ello.

Hay ciertas tareas CIERTAS SOLO, que el navegador tiene oportunidad de ejecutar en paralelo a mi hilo. No todo.

Luego, existe un concepto que se llama PROGRAMACION REACTIVA. Es un modelo para trabajar con programación ASINCRONA y funciones de CALLBACK NO BLOQUEANTES.. que generaliza el concepto de PROMESA.
En JS su implementación la ofrece una librería llamada RxJS.
Ese modelo GENERICO DE PROGRAMACION REACTIVA se definió en un libro llamado "Reactive Streams". Hay implementaciones en muchos lenguajes de programación. Tiene muchas similitudes con otro modelo de programación Map-Reduce (LinQ).
Cuando trabajo con esto, en lugar de promesas uso: OBSERVABLES.
Una promesa devuelve un valor (esperamos).
Un observable puede devolver múltiples valores a lo largo del tiempo.
Es como si compro una subscripción a un periódico. Cada vez que sale una nueva edición, me llega a mi buzón (esperemos en cada vez que haya una nueva edición).


En el backend:
- getEventos (SINCRONA)
   Internamente llama ASINCRONAMENTE A BBDD
                                     MICROSERVICIO
                                     KAFKA
                                     Lee del HDD
                                     ....
                                     Y otras 80 tareas.
                                     Y ESPERA (AWAIT) a que terminen para contestar a quien me pidio.

Soy el fabricante de la bicicleta:
  COMPONENTE Sistema de freno.Pruebas unitaria:
    Cojo el commponente, lo monto en un bastidor, ejecuto apretarFrenos() y miro el sensor de presion entre las pinzas.

Soy el fabricante del Sistema de Frenos:
    Para mi el sistema de frenos es un COMPONENTE? ES EL SISTEMA.
    Y ese sistema tendrá miuchos componentes: Palancas, cables, pinzas, horquillas, capatas, discos.
    Que tewndrá sus pruebas unitarias.
    Y luego harán prueba de sistema al sistema de frenos:
        Cojo el commponente, lo monto en un bastidor, ejecuto apretarFrenos() y miro el sensor de presion entre las pinzas.

Desde mi punto de vista:
    Cojo el commponente, lo monto en un bastidor, ejecuto apretarFrenos() y miro el sensor de presion entre las pinzas.
es una prueba unitaria, desde el punto de vista del fabricante del sistema de frenos es una prueba de sistema.

Lo importante NO ES EL NOMBRE QUE LE DE... es el concepto que pruebo y como lo pruebo de acuerdo a mis intereses.