# language: es
Característica: Lo que sale mal
  Como frontal
  quiero saber qué ha fallado, y si sirve de algo reintentar
  para decírselo bien al jugador

  Antecedentes:
    Dado el catálogo de pruebas

  Escenario: Una página fuera de rango se rechaza
    Cuando intento pedir la lista de eventos con tamaño 0
    Entonces me dice que la petición no es válida por "tamano"

  @controla-el-backend
  Escenario: Una clave de grupo mal formada se rechaza
    Cuando intento abrir el grupo "Goles!" del evento "Real Madrid - FC Barcelona"
    Entonces me dice que la petición no es válida por "grupo"

  Escenario: Los mercados de un evento que no existe
    Cuando intento abrir el grupo "goles" de un evento que no existe
    Entonces me dice que el evento no se encuentra

  Escenario: Suscribirse a un evento que no existe
    Cuando me suscribo a los cambios de un evento que no existe
    Entonces la suscripción termina porque el evento no se encuentra

  @controla-el-backend
  Escenario: Una suscripción a demasiados mercados se rechaza
    Cuando me suscribo a 101 mercados del evento "Real Madrid - FC Barcelona"
    Entonces la suscripción termina porque la petición no es válida

  @controla-el-backend
  Escenario: Una segunda suscripción al mismo evento se rechaza, y la primera sigue
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando me suscribo otra vez a sus cambios
    Entonces esa segunda suscripción termina porque ya había una abierta
    Cuando la cuota de "Gana el Madrid" pasa a 1.95
    Entonces veo que la cuota de "Gana el Madrid" es 1.95 y baja

  Escenario: Si el backend no responde
    Dado que el backend no responde
    Cuando intento pedir la lista de eventos
    Entonces me dice que el servicio no está disponible

  Escenario: Si la URL no es la del backend, no se confunde con un evento que no existe
    Dado que el servicio apunta a una URL que no es la del backend
    Cuando abro un evento que no existe
    Entonces me dice que el servicio no está disponible
