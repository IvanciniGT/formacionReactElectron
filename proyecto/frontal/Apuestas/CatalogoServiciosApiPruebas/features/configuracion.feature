# language: es
Característica: Configurar el servicio
  Como aplicación que ensambla el servicio
  quiero que una configuración imposible se rechace al crearlo
  para enterarme al arrancar, y no en la primera petición

  Esquema del escenario: Una configuración no válida se rechaza al crear el servicio
    Cuando creo el servicio con <campo> = <valor>
    Entonces se rechaza porque la configuración no es válida

    Ejemplos:
      | campo                  | valor                    |
      | urlBase                | "no es una url"          |
      | urlBase                | "ftp://apuestas.ejemplo" |
      | tiempoMaximoPeticionMs | 0                        |
      | tiempoMaximoPeticionMs | -100                     |
      | esperasReconexionMs    | [0, -1]                  |
