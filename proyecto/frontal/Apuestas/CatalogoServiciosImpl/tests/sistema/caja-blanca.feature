# language: es
@controla-el-backend
Característica: Lo que solo se ve desde dentro de esta implementación
  Pruebas de caja blanca: miran el backend o fuerzan situaciones (cortar la conexión) que
  una prueba de caja negra no puede provocar. Las de caja negra son las del TCK, en
  CatalogoServiciosApiPruebas, y se ejecutan junto a estas.

  Antecedentes:
    Dado el catálogo de pruebas

  Escenario: Al dejar de ver el evento, el servidor deja de enviarme sus cambios
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando dejo de verlo
    Entonces el servidor ya no me envía sus cambios

  Escenario: Si se corta la conexión, al reconectar recibo lo que cambió mientras tanto
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando se corta la conexión y la cuota de "Gana el Madrid" pasa a 1.95 antes de reconectar
    Entonces veo que la cuota de "Gana el Madrid" es 1.95 y baja

  Escenario: Si el backend se cae y no vuelve, la suscripción termina
    Dado que estoy viendo el evento "Real Madrid - FC Barcelona"
    Cuando el backend se cae y no vuelve
    Entonces la suscripción termina porque el servicio no está disponible
