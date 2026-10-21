# Arquitectura frontend profesional con TypeScript, React y Electron

## Bienvenida

Hola, bienvenido o bienvenida al curso. Soy Iván Osuna y voy a ser tu formador
durante las próximas semanas.

No es un curso de iniciación: das por sabidos TypeScript y React o Angular, y
aquí trabajamos lo que viene después —diseño, arquitectura, calidad y
entrega—. Y no lo hacemos tema a tema, sino construyendo un proyecto: una
librería compartida en TypeScript que publicamos y consumimos desde dos
aplicaciones, una consola **Electron** y una aplicación web **React**. Los
conceptos aparecen cuando el proyecto los pide.

En este repositorio tienes todo lo del curso: el temario, el código que vayamos
escribiendo y las notas de cada sesión.

| Dato           | Valor                                            |
|----------------|--------------------------------------------------|
| Fechas         | Del 26 de octubre al 23 de diciembre de 2026     |
| Horario        | De 15:00 a 17:30 (en octubre, de 15:00 a 17:15)  |
| Duración       | 39 horas en 16 sesiones                          |
| Modalidad      | Remoto                                           |
| Temario        | [notas/temario.md](notas/temario.md)             |
| Notas de clase | [notas/](notas/), un fichero por día             |

## Calendario

| Sesión | Día                       | Horario       |
|-------:|---------------------------|---------------|
|      1 | Lunes 26 de octubre       | 15:00 a 17:15 |
|      2 | Martes 27 de octubre      | 15:00 a 17:15 |
|      3 | Miércoles 28 de octubre   | 15:00 a 17:15 |
|      4 | Jueves 29 de octubre      | 15:00 a 17:15 |
|      5 | Martes 3 de noviembre     | 15:00 a 17:30 |
|      6 | Miércoles 4 de noviembre  | 15:00 a 17:30 |
|      7 | Jueves 5 de noviembre     | 15:00 a 17:30 |
|      8 | Lunes 16 de noviembre     | 15:00 a 17:30 |
|      9 | Jueves 26 de noviembre    | 15:00 a 17:30 |
|     10 | Jueves 3 de diciembre     | 15:00 a 17:30 |
|     11 | Miércoles 9 de diciembre  | 15:00 a 17:30 |
|     12 | Jueves 10 de diciembre    | 15:00 a 17:30 |
|     13 | Jueves 17 de diciembre    | 15:00 a 17:30 |
|     14 | Lunes 21 de diciembre     | 15:00 a 17:30 |
|     15 | Martes 22 de diciembre    | 15:00 a 17:30 |
|     16 | Miércoles 23 de diciembre | 15:00 a 17:30 |

Las sesiones están repartidas en el tiempo. Entre una y otra puede pasar una
semana o más, así que las notas de cada día están para eso: para retomar el
hilo sin tener que recordarlo todo.

## El entorno de trabajo

Lo pongo yo y lo mantengo yo durante todo el curso. No tienes que montar
ninguna infraestructura:

- Un ***backend*** de ejemplo, con su contrato OpenAPI.
- **GitLab** con integración continua.
- **SonarQube** para el análisis estático y las métricas de calidad.
- Un **registro de artefactos** donde publicar la librería.
- Un **clúster de Kubernetes** donde desplegar las aplicaciones.

Cómo se entra en cada cosa te lo cuento en clase. Las contraseñas no están
escritas en este repositorio.

### Lo que necesitas en tu portátil

- **Node.js** en una versión LTS, con `npm`.
- **Git**.
- **Un editor**: VS Code va bien.
- **Un navegador**.

## Qué hay en cada carpeta

```
notas/
  temario.md      el temario del curso
  dia1.md ...     los apuntes de clase, sesión a sesión
```

Iremos añadiendo el código del proyecto a medida que lo construyamos.

## Al terminar el curso

El entorno de trabajo se desmonta. **Este repositorio se queda**, con todo lo
que hayamos escrito en él.
