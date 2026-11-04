Nuestros compañeros de Backend (ALELUYA) han liberado el api para nuestro frontal WEB para los jugadores.De momento tenemos la parte de eventos, mercados y selecciones.

Qué pinta tendrá el API?

GET     /api/v1/consulta/events                          \  JUGADOR !!!!!!!
GET     /api/v1/consulta/events/:id                      /

Esto le da información básica sobre los eventos disponibles para los jugadores.
Descripcion, titulo, fecha, estado, cuota de la principal seleccion 2x1
Dentro tendrá cientos de mercados: Grupos de mercados:
- Goles
  - Goles de A
  - Goles de B
  - Goles totales
  - Diferencia de goles
    - Selecciones/cuota
- Tarjetas
- Corners


Qué es el v1? La versión del endpoint? La version del contrato? CASI!
El MAJOR de la versión del API REST

Por qué solo el major? Por que es el que me indica compatibilidad.
SRP. NO JUNTES MIERDAS DE DISTINTOS ACTORES. Estas respetando eso?

Hay una cosita aquí... las cuotas tienen una mala manía? CAMBIAN CON EL TIEMPO...
Websocket que nos informe de los cambios de las cuotas en tiempo real.


Tenemos un OPENAPI.YAML para el servicio REST.
Tenemos un ASYNCAPI.YAML para el servicio de Websocket.


Backed de mentirijilla! FAKE

Servicios para el backend (1 o 2)

    ServicioEventos API
        - eventosActuales(): EventoDelServicio[]
        Modelos
        Test

    ServicioEventos IMPL
        - eventosActuales(): EventoDelServicio[]
        Mappers    EventoDelBackend -> EventoDelServicio 

Modelos sacados de los swagger (OPENAPI.YAML) y del ASYNCAPI.YAML
    EventoDelBackend


            ServicioDeEventos ---> HTTP ---> Backend
                - eventosActuales()

              En que contextos puedo probar esa función?
              - Interceptando las llamas http que realiza y en lugar ponendo datos falsos(STUB)  -> UNITARIA
              - Probando contra un backend real con datos controlados (FAKE)-> INTEGRACION
              - Probando contra un backend real con datos reales -> E2E



Cual será el flujo de trabajo?
1. Empiezo por el API:
   - Modelos
     Los modelos hoy, que coy a comenzar el desarrollo, que pinta tendrán? Lo que diga el swagger
     Los genero a mano? Mejor automático

        Con el tiempo van a divergir los modelos de servicio de los modelos del backend... y en ese momento del tiempo que me gustaría tener?
        - Una tarea automática que me chive si ha cambiado o algo!
          - Eh! Han metido un campo nuevo para los eventos: Foto y tu no la tienes y no haces uso de ella
          - Deprecados, eliminados
          - Eh! Los cabroncetes del backend al campo nombre del evento le han dado 100 caracteres de largo y tu solo tenias 50!
   - Servicio 

    ```ts
    export interface ServicioDeEventos {

        getEventosActuales(): EventoDelServicio[]; // FIN... es un API..apI I= Interfaces

    }
    ```

FRONTAL ---> REST ---> BACKEND
Y mañana cambio protocolo de comunicación:
FRONTAL ---> GraphQL ---> BACKEND
Cambia el API? o la implementación?


   - Tests (en el API???) EVIDENTEMENTE QUE SI!
     - Validar el contrato, que no cambie! Lo cual es importante!
     - Pruebas de caja negra!
       Las pruebas de caja negra son las que definimos a nivel del API
       Solo tienen en cuenta el contrato del API, no la implementación interna.
        Luego, las implementaciones tendrán que psar las pruebas de caja negra y sus propias pruebas de caja blanca!

        LA PRUEBA SE DEFINE EN EL API... Se ejecuta evidentemente en la implementación del backend.
        Aqui no puedo ejecutarla
        AHORA BIEN: CUALQUIER IMPLEMENTACION DEL API debería superar estas pruebas.
        Es mi marca de progreso,, mi objetivo al implementar el API: CUMPLIR AL MENOS LAS PRUEBAS DE CAJA NEGRA DEFINIDAS EN EL API.

--- 
# Tipos de test

- Pruebas de caja negra

    SISTEMA

    Dado            Que tengo un backend de verdad, que tiene cargados 4 eventos de mierda : EventoA, EventoB, EventoC, EventoD
    Cuando          Llamo a getEventosActuales()
    Entonces        Debería devolver un array con los 4 eventos cargados de mierda : EventoA, EventoB, EventoC, EventoD

        getEventosActuales(): EventoDelServicio[]; // FIN... es un API..apI I= Interfaces

    INTEGRACION

    Dado            Que tengo un backend de mentira (FAKE), que tiene cargados 4 eventos de mierda : EventoA, EventoB, EventoC, EventoD
    Cuando          Llamo a getEventosActuales()
    Entonces        Debería devolver un array con los 4 eventos cargados de mierda : EventoA, EventoB, EventoC, EventoD

        getEventosActuales(): EventoDelServicio[]; // FIN... es un API..apI I= Interfaces

    UNITARIA

    Dado            que NO tengo un backend
                    Pero que tengo un servicio que cuando intenta llamarlo
                    Le trampeo (INTERCEPTO LA LLAMADA)y devuelvo  4 eventos de mierda : EventoA, EventoB, EventoC, EventoD
    Cuando          Llamo a getEventosActuales()
    Entonces        Debería devolver un array con los 4 eventos cargados de mierda : EventoA, EventoB, EventoC, EventoD

        getEventosActuales(): EventoDelServicio[]; // FIN... es un API..apI I= Interfaces


- Pruebas de caja blanca

    Ejemplo?
    Dado            Que tengo un backend, que tiene cargados 4 eventos de mierda : EventoA, EventoB, EventoC, EventoD
                    Y que tengo un servicio que cuando le llamo a getEventosActuales() consulta al backend
                    Y guarda los datos en cache durante 5 minutos para sucesivas respuestas
    Cuando          Llamo a getEventosActuales() 2 veces seguidas, 
    Entonces        La segunda llamada debería devolver los mismos 4 eventos de mierda leidos desde la cache
