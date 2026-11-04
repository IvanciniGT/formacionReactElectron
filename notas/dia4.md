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

