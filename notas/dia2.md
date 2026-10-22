Devops
Metodologías ágiles
Pruebas
Flujos de trabajo en git
Principios de desarrollo

---

Los cambios!
Deuda técnica

---

# Cuál es la característica clave / básica / diferencial de las metodologías ágiles?

Entregar el producto de forma incremental a mi cliente.
En las tradicionales (waterfall), el producto se entrega al final del ciclo de desarrollo.
El objetivo:obtener retroalimentación del cliente lo antes posible.

> Extraído del manifiesto ágil: 

El software funcionando es la MEDIDA principal de progreso. > Esta frase define un indicador para un cuadro de mando

La MEDIDA principal de progreso es el "software funcionando".

La FORMA EN LA QUE VOY A MEDIR que tal va el proyecto (prograso) es mediante el concepto "software funcionando".

Software funcionando... Quién dice que el software está funcionando?
- El cliente. Al cliente SIEMPRE le tiene que llegar un producto que funcione!
- Las PRUEBAS!
  Las pruebas verifican requisitos. Los rewuisitos dicen lo que el sistema debe hacer.

  Otra cosa es que los requisitos no encajen con mi cliente... o que el cliente me ayude a fijar requisitos.

Cuando uso una metodología AGIL, las pruebas es lo que uso como forma de medir qué tal va el proyecto!
Si no uso esto, no estoy siguiendo correctamente las metodologías ágiles.

- Cuántas pruebas se han definido esta semana?
- Cuántas pruebas han pasado esta semana?
- Cuántas pruebas que funcionaban se han jodido esta semana?

> Por qué se metió eso en el manifiesto ágil?

Cómo se media antes qué tal iba el proyecto? (metodologías en cascada)

JEFE DE PROYECTO. Día 1 hacía una planificacion de TODO EL PROYECTO...
    El 13 de Agosto del 2027 Menchu va a estar haciendo la pantalla del formulario de búsqueda
    Y es una tarea clave para Federico, que entrará el 15 de Agosto del 2027 a hacer la query a BBDD..

HITO 1 - Fecha 20-Junio -> **R1, R2, R3**
    > Qué pasaba si llegaba el día 20 de Junio y no tenía hecho el R3?
    - Hostias pa' to el mundo
    - Alarmas
    - Replanificación del hito -> Nueva fecha de control: 30-Junio 
    - VAMOS CON RETRASO
  
HITO 2 - Fecha 20-Julio -> **R4, R5, R6**
...
HITO N

SPRINT 1 - **Fecha 20-Junio** -> R1, R2, R3
    > Qué pasa día el día 20 de Junio no se han completado R3?
    - Hostias pa' to el mundo
    - Alarmas
    - INSTALAMOS EN PRODUCCION R1 y R2... y el R3, al siguiente SPRINT
    - VAMOS CON RETRASO

SPRINT 2 - Fecha 20-Julio -> R4, R5, R6
...
SPRINT N

Cuando trabajo con iteraciones, defino el proximo SPRINT. Cuando trabajabamos con hitos, el día 1 ya estaba definido TODO EL PROYECTO.
Los hitos eran de control interno. Las iteraciones (sprints) son puestas en producción. LIBERAR CODIGO.


---

# Pruebas 

## Vocabulario en el mundo del testing

- Error     Los humanos cometemos errores (errar es de humanos).
                > Error en la medición de una pata de mi mesa 60 cms en lugar de 70
                EVENTO atado a un momento pasado del tiempo.
- Defecto   Cuando cometemos un error, podemos introducir un defecto en nuestro producto.
            Es la cicatriz que queda en el producto debido a un error nuestro.
                > Mi producto tiene una pata más corta.
            Cómo llamamos en inglés a un defecto? BUG.. Y en software hacemos debuggin : QUITAR DEFECTOS DEL PRODUCTO
- Fallo     Un fallo es la manifestación de un defecto al usar un producto.
                > Llenar la mesa de comida, bebida... para probarla
                > A la que nos sentamos... y nos apoyamos. PUF!!!
                > La mesa a tomar vientos.. comida por el suelo, bebida desparramada, platos rotos.
                EVENTO atado a un momento pasado del tiempo.

## Para qué sirven las pruebas?

- Para asegurar el cumplimiento de unos requisitos (reequisitos funcionales, no funcionales). Hoy, mañana y pasado.
- Para tratar de cazar la mayor cantidad de defectos posibles antes de que el producto llegue al usuario.
  Cómo lo hacemos? Y hay 2 grandes estrategias:
    - Usar el producto para taratar de provocar FALLOS. Y posteriormente analizar esos fallos para encontrar los defectos que los causan. ESTO ES LO QUE LLAMAMOS PRUEBAS DINAMICAS: Pruebas que requieren poner el producto en funcionamiento para tratar de provocar fallos. Y cuando hago pruebas dinámicas, un objetivo de las pruebas es RECOPILAR TODA LA INFORMACION POSIBLE que permita una rápida localización y corrección de los defectos.
    - Pruebas estáticas: Pruebas que no requieren poner el producto en funcionamiento. Se basan en la revisión de documentos, código, diseños, etc., para detectar defectos de manera temprana. ESTO , QUE LO SOLEMOS PASAR POR ALTO, ES MUCHO MAS BARATO y en muchos casos mucho más EFICAZ que las pruebas dinámicas.
- Guiar el desarrollo
  - (TDD: Test-Driven Development). TDD es Diseñar test que falle, escribir mínimo código para que funcione y REFACTORIZAR en cada iteración: RED -> GREEN -> REFACTOR.
  - Las pruebas van validando y ayudando a definir la arquitectura del sistema
- Para saber que tal va el proyecto.
- ...

## Tipos de pruebas

Las pruebas se clasifican mediante diferentes taxonomías... paralelas entre si.

## Según el objeto de prueba (lo que estoy probando)

- Funcionales       (requisitos funcionales)
- No funcionales    (requisitos no funcionales)
  - De seguridad (requisitos de seguridad)
  - De rendimiento (requisitos de rendimiento)
  - De estrés (requisitos de estrés)
  - De carga (requisitos de carga)
  - De usabilidad (requisitos de usabilidad)
  - De HA (requisitos de alta disponibilidad)
  - ...

## Según el conocimiento que tengo del objeto de prueba

- Pruebas de caja negra (Black-box testing):  Cuando no tengo o no aplico el conocimiento que tengo del componente que pruebo al hacer la prueba. Me centro solo en la entrada y salida del sistema, sin considerar su estructura interna.
- Pruebas de caja blanca (White-box testing): Cuando utilizo el conocimiento que tengo del componente que pruebo (código, estructura interna) para diseñar y ejecutar las pruebas.

## Según el procedimiento de prueba

- Dinámicas: Pruebas que requieren poner el producto en funcionamiento para verificar su comportamiento y detectar defectos. Se basan en la ejecución del software y la observación de sus resultados.
- Estáticas: Pruebas que no requieren poner el producto en funcionamiento. Se basan en la revisión de documentos, código, diseños, etc., para detectar defectos de manera temprana.

## Según el contexto de la prueba

> EJEMPLO: FABRICACION DE BICICLETAS!
> Soy un fabricante de bicicletas: DECATHLON: BTWIN!
>
> Fabrico yo las ruedas? NO... las encargo a un proveedor especializado.
> Fabrico yo el sillín? NO... lo encargo a un proveedor especializado.
> Fabrico yo el sistema de frenos? NO... lo encargo a un proveedor especializado.
>
> Qué cojones pinto en todo esto? Diseño el sistema acorde a unos requisitos, especifico componentes y los INTEGRO!

> Encargo las ruedas a michelín.
> Encargo el sillín a otra empresa... y de hecho, me los manda rápido. Qué hago con los sillines? Los guardo en cajas hasta tener el reto? LOS PRUEBO

> Vamos a definir algunas pruebas
> - MONTO un bastidor (4 hierros ma soldaos), donde coloco el sillín. 
>   Y mediento encima... 4 horas, a ver si me duele el culo o no al levantarme.               
>   PRUEBA UNITARIA + DINÁMICA + DE EXPERIENCIA DE USUARIO
> - MONTO un bastidor (4 hierros ma soldaos), donde coloco el sillín. 
>   Y me siento encima y empiezo a bascular el bastidor hacia los alados, de forma pronunciada.. a ver si e sillín me sujeta el culo, o me resbalo!
>   PRUEBA UNITARIA + DINÁMICA + DE SEGURIDAD
> - MONTO un bastidor (4 hierros ma soldaos), donde coloco el sillín. 
>   Y me pongo a lijarlo , con una lija de grando 150, para simular el desgaste que sufrirá con el uso.
>   PRUEBA UNITARIA + DINÁMICA + DE ESTRES
> - MONTO un bastidor (4 hierros ma soldaos), donde coloco el sillín. 
>   Y subo a una persona de 150kgs... a ver si aguana o se parte.
>   PRUEBA UNITARIA + DINÁMICA + DE CARGA

> Le hago un montón de pruebas unitarias.
> Esas pruebas me garantizan que la bici va a funcionar? QUE BICI? SI NO HAY BICI!
> Entonces para qué las hago? CONFIANZA + 1
> Vamos bien... Al menos ya tengo un sillín que cumple con lo que esperaba

> Cojo el sistema de frenos, que me ha llegado:
> - Monto el sistema de frenos en un bastidor.
>   Aprieto la palanca de frenos...                  sistemaDeFrenos.apretarPalanca()
>   y miro si las pinzas cierran
>   y miro si cierran con la fuerza suficiente (coloco un sensor de presión entre las pinzas).

> Por cierto: Cómo se llama en software al bastidor y al sensor de presión? TEST-DOUBLES (mocks, spies, stubs, fakes, dummies)

- Unitaria              Se centra en una característica AISLADA de un componente del sistema.
- Integración           Se centra en la COMUNICACION entre 2 componentes del sistema.
                        2 componentes. Si junto 3 CACA!
                        Si falla la prueba que falla? La comunicación entre A y B o entre B y C? NPI, Averigua.

> Me llegan las ruedas
> Y quiero hacer la prueba de integración con el sistema de frenos.
> - Monto el sistema de frenos en un bastidor.
>   Coloco la rueda en el bastidor entre las pinzas de freno.
>   Le pego un viaje a la rueda, que gire rapidido
>   Aprieto la palanca de frenos...                  sistemaDeFrenos.apretarPalanca()
>   y miro si la rueda se para
>   Y RESULTA QUE LA RUEDA NO SE PARA!
> > La rueda es demasiado estrecha para ese sistema de frenos
> > El sistema de frenos cierra poco para esa rueda
> > Y tomo decisión. Cambio la rueda... por una más ancha.
> > Pero.. la más ancha ya no entra en la horquilla.
> > Necesito una horquilla más ancha
> > Que no entra en el cuadro que tenía previsto.
> > Menos mal que esto lo estoy probando ahora que no he montado aun la bici!

> Esas pruebas me garantizan que la bici va a funcionar? QUE BICI? SI NO HAY BICI!
> Entonces para qué las hago? CONFIANZA + 1
> Vamos bien... Al menos ya tengo un sillín, unas ruedas y un sistema de frenos  que cumple con lo que esperaba y se llevan bien

- Sistema (end2end)      Se centran en el COMPORTAMIENTO del sistema en su conjunto

> Cojo la BICI, LA BICI ENTERA.
> Subo a un tio. Mochila en la espalda ybocata de chorizo dentro... a Cuenta... 300kms.. a ver si llega
>
> Cojo a un tio... que de pedales hasta poner la bici a 50kms hora.
> Y en ese momento... TACCHAN!!!!!!
>   Aprieto la palanca de frenos...                  sistemaDeFrenos.apretarPalanca()
> Y miro si la bici para en menos de 5 segundos o avanzando menos de 10 metros.

> Esas pruebas me garantizan que la bici va a funcionar? CLARO !!! PARA ESO LAS HAGO!
> De las pruebas de sistema debe salir un sistema que funcione guay! Es lo que llega a mi cliente

- Aceptación             Se centran en si el producto (QUE FUNCIONA GUAY YA) cumple con los requisitos y expectativas del cliente.

> Cojo a mi cliente... que de pedales hasta poner la bici a 50kms hora.
> Y en ese momento... TACCHAN!!!!!!
>   Aprieto la palanca de frenos...                  sistemaDeFrenos.apretarPalanca()
> Y que me diga si le gusta el tacto del freno y la sensación general de la bici.
> UY!!! Esta muy duro esta palanca de frenos. NO ME GUSTA.. otra bici!


Para poder hacer pruebas de esta forma, es IMPRSCINDIBLE tener una arquitectura de componentes desacoplados.
Si no hay arquitectura de componentes desacoplados no hay forma humana de hacer pruebas unitarias ni de integración.
Ni de saber cómo va el proyecto.
Ni de seguir una metodología ágil.

> Qué hace DECATHLON? 
> Lo primero que hace es ESPECIFICAR LOS COMPONENTES QUE NECESITA, Y PARA QUE SIRVE CADA UNO.
> Ruedas:               Rueda de 21 pulgadas, con un ancho de 2.1 pulgadas. Neumático tipo todo terreno.
> Sistema de frenos:    Frenos de disco hidráulicos, con palanca de freno ajustable y pastillas de freno de alto rendimiento....
>
>                       ^^^^^^^^
>                       Cómo llamamos a eso en software? API! CONTRATOS! INTERFACES!
> 
> Después elijo un COMPONENTE CONCRETO que cumpla con ese contrato o API.
> Michelin XJ278u... que es una rueda que cumple con esa especificación
> Shimano XJPP13... que es un sistema de frenos que cumple con esa especificación
>
> Eso si.. como mi sistema no lo he diseñado con implementaciones concretas, sino en base a especificaciones y contratos, podré el día de mañana cambiar un componente por otro que cumpla con la misma especificación sin afectar al resto del sistema.
> El día de mañana Paso de Michelín, que se ha puesto muy caro y monto la FIRESTORE KÑP99# que cumple con la misma especificación y todo sigue funcionando sin problemas.
>
> Michelín: Mongo
> FIRESTORE: Postgres
> Especificación de la rueda: API del componente REPOSITORIO!

Ahora bien... una bicicleta se monta con ESPECIFICACIONES?
NO.. se monta con COMPONENTES CONCRETOS: IMPLEMENTACIONES DE ESAS ESPECIFICACIONES.


Y vamos a pintar un diagrama de componentes de nuestra bicicleta:



        MICHELIN -> API RUEDA <---------+
                        ^               |
                        |             SHIMANO                       Sillín Casa Paco
                        |               v                               v
                        +------- API SISTEMA DE FRENOS              API SILLIN
                                            ^                             |
                                            +------- API CUADRO <v>-------+
                                                            ^
                                                            Cuadro ORBEA XLOP Super proULTRA

                                                                            ESPECIFICACIONES (API)

        Y luego tengo MI BICICLETA                          v.1.0.0
         -> MICHELIN                                        v.1.0.0    ->     v.1.0.0
         -> SHIMANO                                         v.1.0.0    ->     v.1.0.0
         -> Sillín Casa Paco                                v.1.0.0    ->     v.1.0.0
         -> Cuadro ORBEA XLOP Super proULTRA                v.1.0.0    ->     v.1.0.0

            vvvvv

        Y luego tengo MI BICICLETA                          v.1.0.1
         -> MICHELIN                                        v.1.0.0    ->     v.1.0.0
         -> SHIMANO                                         v.1.0.1    ->     v.1.0.0
         -> Sillín Casa Paco                                v.1.0.0    ->     v.1.0.0
         -> Cuadro ORBEA XLOP Super proULTRA                v.1.0.0    ->     v.1.0.0

> Sillín más amplio: Quiero tener 2 versiones de la bici, una con el sillín deportivo estrecho y otra más cómoda (grande)

Cómo empiezo a trabajar? 
API NUEVO DE SILLIN                (si lo que fuera a hacer es cambiar mi siilín por uno más ancho...)
    Qué versión de la espec del sillín genero? Y TENGO 2 opciones: ES MI DECISION!
         v.1.1.0    En esta defino un sillín más ancho, pero con el mismo tamaño de tubo para conectar al cuadro
         v.2.0.0    En esta defino un sillín más ancho y además cambio el tamaño del tubo para conectar al cuadro
    Si quiero montarlo en el mismo cuadro, más me vale, no geenrar breaking changes v2.0.0... Y hacer mi mayor esfuerzo por generar una v1.1.0

Y libero esa versión de mi especficación de sillín.
Habrá otro equipo que contacte con 50 empreas a pedir presupuestos, ver que modelos tienen ... 
Y GRACIAS A QUE ESA SPEC YA ESTA LIBERADA (APROBADA, EN PRODUCCION!), pueden hacer su trabajo.

Y encuentran el CASA LOLES v.1.8.9, que cumple mi especificación de sillín v1.1.0

Y saco la nueva verisón de la bicicleta: v1.1.0 (Mi bicicleta ha ganado en funcionalidad, con un sillín más ancho)

        Y luego tengo MI BICICLETA                          v.1.1.0
         -> MICHELIN                                        v.1.0.0    ->     v.1.0.0
         -> SHIMANO                                         v.1.0.1    ->     v.1.0.0
         -> Sillín CASA LOLES                               v.1.8.9    ->     v.1.1.0
         -> Cuadro ORBEA XLOP Super proULTRA                v.1.0.0    ->     v.1.0.0

Esto es producir software en serio!

A ESTO SE LE LLAMA CONTROL DE CONFIGURACION!
- Se hace en las bicicletas
- Se hace en los coches
- Se hace en los buques
- Se hace en la aviación
- Se hace cuando monto software en serio!


La spec del sillín ES UN PRODUCTO EN SI MISMO... que quizás usaré en otra bici!
HTML o CSS o XML son especificacione, con sus propias versiones.

Monto mi backend C#
- Quiero guardar Apuestas! en un REPOSITORIO DE APUESTAS
  Lo hago postrgres o mongo? ME DA IGUAL! QUIERO QUE SEAN REEMPLAZABLES

    Y defino una spec de mi REPOSITORIO DE APUESTAS Y esto tendrá una versión: v1.0.0
        - crearApuesta
        - obtenerApuesta
        - actualizarApuesta
        - listarApuestas
    Y creo una implementación concreta de mi REPOSITORIO DE APUESTAS, por ejemplo usando Postgres 
        v1.0.0 del repoPostgres -> v1.0.0 del REPOSITORIO DE APUESTAS

    Y ese repoPostgres lo uso para montar mi SERVICIO.
    Pero dentro de 6 meses quiero montar OTRO SISTEMA TOTALMENTE DISTINTO: ETL

    ETL: Extract, Transform, Load (Proceso de extracción, transformación y carga de datos)
    Son procesos de manipulación y transformación de datos, que permiten extraer información de diversas fuentes, transformarla según las necesidades del negocio y cargarla en un sistema de destino.

    Por ejemplo, un proveedor, me manda información de apuestas en un archivo CSV -> EN MI SISTEMA

    Esto es un proyecto independiente, que tiene su propia especificación y versión, y que puede evolucionar de manera separada de mi servicio principal.
        Ahora bien... este proyecto debe guardar los datos en el mismo REPOSITORIO DE APUESTAS que definí anteriormente, asegurando que la implementación concreta (por ejemplo, Postgres) pueda ser reutilizada y manteniendo la consistencia de la versión del repositorio.
    Y el día de mañana, puede ser que quiera añadir funcionaldiades nuevas en el repo... para mi SISTEMA.
    Y genere una v1.1.0 del REPOSITORIO DE APUESTAS.
    Si genero esa , no pasa nada... Mi ETL seguirá funcionando correctamente ... no es breaking change
    Es más, mi ETL podría seguir funcionando con la spec v1.0.0 del REPOSITORIO DE APUESTAS,
    Y el sistema irlo migrando a la nueva versión v1.1.0
    Y el año que viene, con tiempo, migraré la ETL a la nueva versión del REPOSITORIO DE APUESTAS.
        O EN SPRINT QUE TOQUE
        Pero necesito ir liberando COMPONENTES en cada iteración
    Cuando creo software aí, el MANTENIMIENTO SE HACE INCREIBLEMENTE SENCILLO!

    Cuando hay problemas con el tiempo en un proyecto ES POR MALAS DECISIONES:
    - Decisiones de arquitectura incorrectas
    - Flujo de trabajo!
    Todo eso va junto

---

# GIT

REGLA DE ORO EN LA RAMA: main:
    - No se pueden crear commits en main directamente
    - Lo que hay en main se considera apto para producción

REGLAS DE ORO EN LA RAMA develop:
    - No se pueden crear commits en main directamente
    - Lo que hay en develop es lo que está aprobado para el siguiente sprint


                                    ----- main --C4 tag(v1.0.0)
                                                 /
                                ----- release --C4 tag(v1.0.0-rc1)
                                                / ^^^^3
----- develop --- C1 -------- C2 ------------- C4 
                    \       / me\rge (ff)     / tag(v1.0.0-desa)
          ---suma----C1 -> C2    \           /
                      \           \ merge   /
            ---rest--- C1 -> C3 ---C4 -----+
                         \      ^^^ 1.  ^^^ 2
       ---multiplicar--- C1 -> C5 ---...

Qué debe ocurrir para poder subir de una rama feature a rama develop? Que pase las pruebas... qué pruebas? UNITARIAS + INTEGRACION

    ^^^ 1 En este punto, antes de tgraerme lo de develpp, necesito que mis pruebas UNITARIAS pasen.
    ^^^ 2 Cuando junto con el resto APROBADO YA PARA SIGUIENTE PASO A PRODUCCION, tendrán que pasar las pruebas de INTEGRACION.
    ^^^ 3. Para plantearme sacar RELEASE, necesito que pasen las PRUEBAS DE SISTEMA
    ^^^ 4. Subiré a producción cuando MI CLIENTE ACEPTE EL PRODUCTO: PRUEBAS DE ACEPTACION!

    TODO ESTA RELACIONADO!

Si trabajo de esta forma, tendré CERO PROBLEMAS!

Por cierto... si tengo un repo con TODO, y lo que quiero es generar una versión nueva de un componente, que se usa en 2 sitios (MICROSERVICIO + ETL), cómo lo hago? Qué etiqueta pongo? Si solo quiero sacar un componente!

TENGO BACKEND -> API REST (API = INTERFACES!, sin código!) -> OPENAPI, SWAGGER, SIN CODIGO!

Y tengo un API v1.0.0
Y ahora backend trabaja por su lado, IMPLEMENTANDO ESE API.

Y frontal trabaja por el suyo... CONSUMIENDO ESE API.
Y monto un proyecto en FRONTAL que contenga representaciones de las DTOs del API DEL BACKEND pero de forma AUTOMATIZADA.

Desde el swagger genero las clases TS.

Y cada versión del API DE BACKEND dara lugar a una versión nueva en la parte de frontal... con los modelos correspondientes generados automáticamente.

    Y si en backend han generado una versión nueva MINOR o PATCH del API, esas clases que se generen en FRONTAL en automatico NO IMPACTARAN AL SISTEMA (FRONTAL)

    Pero si me generan un MAJOR, eso sí impactará al sistema (FRONTAL) y tendré que adaptarlo.

    Sistema FRONTAL
        Componentes REACT           v1.1.0
        Servicios
        MODELOS PROPIOS             v1.1.0 
            ^^
            mappers                 v1.2.0 
            ^^
        MODELOS DE BACKEND (en TS)  v1.1.0

Querré definir mis propios pipelines de CI/CD... para cada componente.

Cuando cambie el API de backend, quiero un proceso de CD que genere una nueva versión de un componente del proyecto de FRONTAL.
NADIE HACE NADA, SE HACE SOLO!

Pero para montar eso necesito saber si se ha hecho un cambio en el API de backend.
Y si el API De backend no tiene su propio REPO, como distingo si ha habido cambios en él o en otro componente del BACKEND.

---

# Esquema semántico de versionado de software: SEMVER

v a.b.c
            Cuánto suben?
a MAJOR     Breaking changes: Cambio que rompe compatibilidad
            BASICAMENTE CUANDO QUITO ALGO... con o sin reemplazo
b MINOR     Nueva funcionalidad
            Funcionalidad marcada como obsoleta: Deprecated
c PATCH     Arreglos de bugs








Mutación
Regresión



---

Refactorizar? La refactorización es el proceso de mejorar la estructura interna del código fuente sin alterar su comportamiento externo. Su objetivo principal es hacer que el software sea más limpio, legible y fácil de mantener, eliminando la DEUDA TECNICA sin añadir nuevas funciones ni corregir errores.

---

Que un producto funcione se da por descontado!
Porque un producto de software por definición es un producto sujeto a cambios y mantenimiento.
El trabajo no es hacer un software que funcione.
Si tu software no funciona ... no es un software... es un conjunto de archivos de texto con pretensiones!

Igual que un coche que no anda no es un coche... es una escultura de hierro con ruedas.
Un coche por definición anda.
Y un software por definición funciona.

Pero el punto es que sea capaz de BAJAR AL MINIMO POSIBLE el LCO: Coste de propiedad del software.
Y eso incluye: Desarrollo + Mantenimientos + Operación...

ESTO DONDE ESTAMOS ES INGENIERIA DE SOFTWARE:
Tratar de crear un software CON RESTRICCIONES DE TIEMPO, RECURSOS, DINERO.

GRAN CRISIS DEL SOFTWARE: Finales de los años 60... ahí ya llevábamos más de 2 décadas desarrollando software y colapso el sistema.
La ingeniería de software como disciplina surge como respuesta a esta crisis, buscando métodos, técnicas y herramientas para desarrollar software de manera más controlada, con un objetivo: FACILITAR LA EVOLUCION Y MANTENIMIENTO DEL SOFTWARE.

---

SoC (Separation of Concerns)
Edger Djikstra


git?                    Linus Torvalds

submodulos de git!      
