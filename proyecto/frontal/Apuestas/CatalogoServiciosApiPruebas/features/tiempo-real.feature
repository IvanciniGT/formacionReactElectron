# language: es
Característica: Cuotas en tiempo real
  Como jugador
  quiero ver cómo cambian las cuotas mientras miro un evento
  para apostar con la cuota que hay de verdad

  Antecedentes:
    Dado el catálogo de pruebas

  @controla-el-backend
  Escenario: Veo cambiar una cuota mientras miro el evento
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando la cuota de "Gana el Madrid" pasa a 1.95
    Entonces veo que la cuota de "Gana el Madrid" es 1.95 y baja

  @controla-el-backend
  Escenario: No pierdo lo que cambia entre cargar el evento y suscribirme
    Dado que he cargado el evento "Real Madrid - FC Barcelona"
    Y la cuota de "Empate" pasa a 3.60
    Cuando me suscribo a sus cambios
    Entonces veo que la cuota de "Empate" es 3.60 y sube

  @controla-el-backend
  Escenario: Veo cuándo se suspende un mercado
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando se suspende el mercado "Quién gana"
    Entonces veo que el mercado "Quién gana" está suspendido

  @controla-el-backend
  Escenario: Solo recibo los mercados que tengo en pantalla
    Dado que estoy viendo solo el grupo "goles" del evento "Real Madrid - FC Barcelona"
    Cuando la cuota de "Gana el Madrid" pasa a 1.95
    Y la cuota de "Sí" pasa a 1.70
    Entonces veo que la cuota de "Sí" es 1.70 y sube
    Y no veo ningún cambio de "Gana el Madrid"

  @controla-el-backend
  Escenario: Cuando el evento termina, la suscripción termina
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando el evento pasa a "finalizado"
    Entonces veo que el evento pasa a "finalizado"
    Y la suscripción ha terminado

  @controla-el-backend
  Escenario: Al dejar de ver el evento, dejo de recibir sus cambios
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando dejo de verlo
    Y la cuota de "Gana el Madrid" pasa a 1.95
    Entonces no recibo nada más
