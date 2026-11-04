# language: es
Característica: Ver el catálogo
  Como jugador
  quiero ver los eventos, sus mercados y sus cuotas
  para decidir a qué apostar

  Antecedentes:
    Dado el catálogo de pruebas

  @controla-el-backend
  Escenario: Los eventos salen por orden de comienzo, sin los que ya no se ven
    Cuando pido la lista de eventos
    Entonces veo estos eventos, en este orden:
      | Atlético de Madrid - Sevilla FC              |
      | Real Madrid - FC Barcelona                   |
      | Real Madrid Baloncesto - FC Barcelona Basket |
    Y "Atlético de Madrid - Sevilla FC" está en directo
    Y "Real Madrid - FC Barcelona" no está en directo

  @controla-el-backend
  Escenario: Cada evento trae su mercado principal con sus cuotas
    Cuando pido la lista de eventos
    Entonces el mercado principal de "Real Madrid - FC Barcelona" es "Quién gana", con estas cuotas:
      | Gana el Madrid | 2.10 |
      | Empate         | 3.40 |
      | Gana el Barça  | 3.20 |

  @controla-el-backend
  Escenario: El detalle de un evento trae sus grupos de mercados, sin los cerrados
    Cuando abro el evento "Real Madrid - FC Barcelona"
    Entonces veo estos grupos de mercados:
      | Principales | 2 |
      | Goles       | 2 |
      | Goleadores  | 1 |

  @controla-el-backend
  Escenario: En un mercado suspendido no se puede apostar
    Cuando abro el grupo "goles" del evento "Atlético de Madrid - Sevilla FC"
    Entonces veo el mercado "Más/menos de 1,5 goles" sin poder apostar en él

  Escenario: Un evento que no existe
    Cuando abro un evento que no existe
    Entonces me dice que el evento no se encuentra
