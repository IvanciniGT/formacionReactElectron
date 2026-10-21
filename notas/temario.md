# Arquitectura frontend profesional con TypeScript, React y Electron

## Datos del curso

| Dato       | Valor                                                    |
|------------|----------------------------------------------------------|
| Fechas     | Del 21 de octubre al 23 de diciembre de 2026             |
| Horario    | De 15:00 a 17:30 (el 13 de noviembre, de 9:00 a 13:00)   |
| Duración   | 39 horas: 15 sesiones                                    |
| Modalidad  | Remoto                                                   |
| Calendario | En el [README](../README.md#calendario)                  |

## Objetivo

Formación dirigida a equipos de desarrollo que trabajan con Angular, React,
TypeScript y Electron, y que necesitan elevar el nivel de ingeniería en todo el
ciclo de desarrollo frontend: diseño y arquitectura de código compartido entre
aplicaciones, calidad medible, rendimiento, pruebas y proceso de entrega.

El recorrido se apoya en un caso práctico completo: la construcción de una
librería compartida, su publicación y su consumo desde dos aplicaciones
distintas —una consola Electron y una aplicación web React—. No es un fin en sí
mismo: es el hilo conductor que hace que los conceptos aparezcan donde importan
y se apliquen sobre código real.

## Cómo se imparte

**El curso se desarrolla como un proyecto, no como una secuencia de temas.**

Desde la primera sesión se construye una aplicación real sobre un entorno de
trabajo profesional completo, proporcionado y operado por el formador.

Los conceptos se introducen cuando el proyecto los reclama: un problema de
diseño trae SOLID, una dependencia incómoda trae la inyección de dependencias,
un componente con estados contradictorios trae las máquinas de estados, un
cambio del contrato trae los *mappers*. Se explican en el momento en que el
equipo entiende por qué los necesita, se aplican sobre el código que se está
escribiendo y se discuten las alternativas descartadas.

El apartado siguiente recoge qué se ve a lo largo del curso. El orden en que
aparece lo marca el proyecto.

## Contenidos

### Diseño y arquitectura

- Principios SOLID aplicados a TypeScript y a componentes.
- Separación de responsabilidades entre librería y aplicaciones.
- Diseño de código compartido entre aplicaciones distintas: qué entra y qué no.
- Inversión de control e inyección de dependencias: qué ofrece TypeScript, en
  qué se diferencia del modelo de Angular, y qué patrones aplican
  —contenedores, factorías, composición, contexto—.
- Patrones de diseño aplicados: fachada, adaptador, estrategia, repositorio.
- Arquitectura por capas en el frontal: dominio, servicios, presentación.
- Componentes desacoplados y reutilizables.

### TypeScript avanzado

- Genéricos y restricciones.
- Uniones discriminadas y comprobación de exhaustividad.
- Inferencia: diseñar tipos que no obliguen a anotar a quien los consume.
- Programación funcional: inmutabilidad, composición, manejo de errores sin
  excepciones.
- Técnicas de asincronía: promesas, `async`/`await`, iteradores y generadores
  asíncronos, control de concurrencia, cancelación y tipado de operaciones
  asíncronas.

### El contrato con el backend

- OpenAPI como fuente de verdad.
- Generación automática de DTOs y cliente HTTP.
- Integración del generador en el proceso de *build*.
- Modelos de dominio frente a DTOs: por qué no son lo mismo.
- *Mappers*: diseño, implementación, pruebas y mantenimiento.
- Validación en la frontera y tratamiento de errores.

### React avanzado

- Gestión de estado: cliente frente a servidor.
- Máquinas de estados para el estado de componentes: estados, transiciones,
  guardas y el problema de los estados imposibles.
- Implementación tipada de máquinas de estados con exhaustividad comprobada
  por el compilador.
- Redux más allá de lo básico: organización del estado, efectos y asincronía,
  control de flujo, cancelación y condiciones de carrera.
- Selectores, memoización y normalización.
- Qué no debería estar nunca en el *store*.
- Patrones de composición de componentes.

### Electron

- Arquitectura de una aplicación Electron: procesos, comunicación y seguridad.
- Consumo de la librería compartida desde la consola.
- Qué código puede compartirse con la web y qué no.

### Rendimiento

- Renderizados innecesarios: causas reales y detección.
- Perfilado: medir antes de optimizar.
- Memoización con criterio.

### Calidad y pruebas

- Estrategia de pruebas: qué se prueba en la librería y qué en cada
  aplicación.
- Pruebas unitarias de *mappers*, servicios y máquinas de estados.
- Dobles de prueba aprovechando la inyección de dependencias: *dummies*,
  *fakes*, *stubs*, *spies* y *mocks*. Cuándo usar cada uno y por qué
  confundirlos hace las pruebas frágiles.
- Pruebas de componentes.
- Análisis estático y métricas con SonarQube: *quality gates*, deuda técnica,
  cobertura.

### Repositorios, entrega y despliegue

- Monorepo frente a repositorios separados: criterios reales.
- Versionado semántico y su disciplina.
- Integración continua en GitLab: qué se comprueba y qué rompe a los
  consumidores.
- Publicación de la librería en registro privado.
- Despliegue sobre Kubernetes.

## Qué se lleva el equipo

- Una librería compartida en TypeScript construida durante el curso: modelos,
  *mappers*, cliente generado desde OpenAPI y capa de servicios desacoplada.
- Los dos frontales consumiéndola: consola Electron y aplicación web React.
- La generación automática desde el contrato OpenAPI, integrada en el proceso
  de *build*.
- El proceso completo de entrega: integración continua, control de calidad,
  publicación en registro y despliegue.
- La batería de pruebas de la librería, los componentes y las máquinas de
  estados.

## Entorno de trabajo

Proporcionado y operado por el formador durante toda la formación:

- *Backend* de ejemplo, con su contrato OpenAPI.
- GitLab con integración continua configurada.
- SonarQube para análisis estático y métricas de calidad.
- Registro de artefactos para la publicación de la librería.
- Clúster de Kubernetes para el despliegue de las aplicaciones.

No hay que provisionar ni administrar infraestructura: basta con el entorno de
desarrollo habitual de cada asistente.

## Perfil recomendado

Desarrolladores con experiencia previa en React o Angular y TypeScript en uso
habitual. No es una formación de iniciación: se parte de que el equipo conoce
el lenguaje y los *frameworks*, y se trabaja sobre diseño, arquitectura,
calidad y entrega.

## Alcance

La formación cubre el diseño y la construcción del proyecto del curso. El
análisis, diagnóstico o refactorización del código propio del cliente queda
fuera de su alcance.
