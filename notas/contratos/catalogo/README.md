# Apuestas · contrato del catálogo

Lo que un **jugador** puede ver del catálogo de apuestas: los eventos, sus mercados, sus
selecciones y las cuotas vigentes, y los cambios en tiempo real. Es el contrato entre el
microservicio de apuestas y los frontales (la web React y la consola Electron).

Es el único componente que se libera **antes** que su implementación (*contract-first*):
los frontales trabajan contra él, con datos simulados, mientras el backend lo implementa.

| Fichero | Qué describe |
|---|---|
| [`openapi.yaml`](openapi.yaml) | El API REST: cargar tipos, eventos, mercados y cuotas |
| [`asyncapi.yaml`](asyncapi.yaml) | El canal en tiempo real (SignalR, sobre WebSocket): suscribirse a un evento y recibir sus cambios |

Los mensajes del canal en tiempo real **reutilizan los esquemas de `openapi.yaml`**: REST
y WebSocket no pueden describir lo mismo de dos formas.

**Aquí no hay código**, solo los dos YAML, que no son de ningún lenguaje. Los tipos de cada
uno se generan aparte: los de TypeScript, en `@apuestas-deportivas/catalogo-modelos-servidor`;
los de C#, cuando toque, en el backend.

**Solo lectura.** Lo que hace el operador (dar de alta eventos, cambiar cuotas, suspender
mercados) atiende a otro actor y va en otro contrato. Apostar, también.

## Cómo se usa

```text
1. GET /v1/eventos/{id}                 el evento, su mercado principal y sus grupos, y una marca
2. Suscribir { eventoId, desde: marca } por el hub: a partir de ahí, solo cambios
3. GET /v1/eventos/{id}/mercados?grupo= al abrir una pestaña, otra marca
4. Suscribir { eventoId, desde, mercados } para seguir solo los mercados de esa pestaña
```

- **La marca evita perder cambios.** Es un contador de todo el catálogo que solo avanza.
  Cada respuesta REST trae la suya, y la suscripción empieza justo ahí.
- **Al reconectar** (el móvil pierde la red, se reinicia el servidor) hay que volver a
  suscribirse a cada evento con la última marca recibida de él. El servidor manda lo
  perdido o, si la marca es demasiado antigua, `Recargar`: hay que volver al paso 1.
- **Sin WebSocket**, `GET /v1/eventos/{id}/cuotas?desde=` da los mismos cambios por REST.

## Diseño

**Nada trae el evento entero.** Un partido grande tiene cientos de mercados y más de mil
selecciones. La lista de eventos trae solo el mercado principal (el 1X2); el detalle
añade los grupos de mercados (las pestañas), con cuántos hay en cada uno; y cada grupo se
pide al abrirlo.

**Cada selección lleva tres datos de cuota:**

| Campo | Qué es |
|---|---|
| `cuota` | La vigente: la que se acepta si se apuesta ahora |
| `cuotaInicial` | La de apertura del mercado. No cambia nunca |
| `tendencia` | Hacia dónde se movió en su último cambio: `sube`, `baja` o `igual` |

El histórico completo de cuotas no se expone. Se puede añadir más adelante sin romper
nada (es un cambio MINOR).

**Las cuotas son decimales, no `double`** (`format: decimal`). En `double`, 2,10 no se
representa exacto, y cuando el jugador apueste devolverá la cuota que vio para que el
dominio la compare con la vigente. El generador de C# tiene que producir `decimal`.

**Los errores siguen el RFC 9457** (`application/problem+json`), que es lo que ASP.NET
produce de serie.

**Es público.** El catálogo se puede ver sin haber iniciado sesión.

## Validaciones

Cada campo lleva las restricciones que JSON Schema sabe expresar, para que los
generadores y los validadores de peticiones las apliquen sin más. Las que salen de una
invariante del dominio llevan `x-invariante` con el nombre de la anotación y el componente
donde se define.

> **⚠️ Las cifras de esta tabla y las del contrato son una copia** de los `Limites.cs` de
> cada componente de invariantes, y **tienen que coincidir con ellos**. A diferencia de un
> README, aquí la copia es a propósito: el contrato es lo que se publica a los frontales y
> no puede depender del código del backend. Si una invariante cambia, el contrato cambia
> con ella, y eso es una versión nueva del contrato.

| Campo | Restricción | Invariante |
|---|---|---|
| Todos los `id` | UUID, distinto de `00000000-…` | `[Identificador]` · Comun.Invariantes |
| `TipoEvento.nombre` | 2 a 50 caracteres | `[NombreTipo]` · Apuestas.Invariantes |
| `Evento.nombre` | 3 a 100 caracteres | `[NombreEvento]` · Apuestas.Invariantes |
| `Evento.fechaHora` | Fecha y hora, en UTC | `[FechaHora]` · Comun.Invariantes |
| `Evento.estado` | `programado`, `enJuego`, `interrumpido` (y en tiempo real, además, `finalizado`, `aplazado`, `cancelado`) | `[Estado<T>]` · Comun.Invariantes |
| `Mercado.descripcion`, `Seleccion.descripcion` | 3 a 500 caracteres | `[Descripcion]` · Apuestas.Invariantes |
| `Mercado.estado` | `abierto`, `suspendido` | `[Estado<T>]` · Comun.Invariantes |
| `cuota`, `cuotaInicial` | Mayor que 1, múltiplo de 0,01, sin máximo | `[Cuota]` · Apuestas.Invariantes |
| `Mercado.tipo` | 1 a 50 caracteres | Ninguna todavía |
| `GrupoMercados.clave` | Minúsculas, dígitos y guiones; hasta 50 | Ninguna: es del contrato |
| Paginación | `pagina` ≥ 1; `tamano` de 1 a 100 | Ninguna: es del contrato |
| Filtros por mercados | Hasta 100 ids | Ninguna: es del contrato |

## Validar los ficheros

```bash
npm install
npm run validar      # openapi.yaml con Redocly; asyncapi.yaml con el parser de AsyncAPI
```

Se valida `asyncapi.yaml` con `@asyncapi/parser`, no con `@asyncapi/cli`: el CLI arrastra
React, y aquí no pinta nada.

`openapi.yaml` da dos avisos que se mantienen a propósito: no tiene licencia (es un
contrato privado) y `GET /v1/tipos` no tiene ninguna respuesta 4xx (no hay error posible
del cliente).

## Pendiente

- **Generar los DTO de C#** del controlador desde el contrato. Los de TypeScript ya se
  generan, en su propio paquete:
  [`catalogo-modelos-servidor`](../../../frontal/Apuestas/CatalogoModelosServidor/README.md).
- **Comprobar automáticamente que el contrato y los `Limites.cs` coinciden**, para que una
  invariante no pueda cambiar sin que cambie el contrato.
- **Pipeline y publicación** del contrato, con su propia versión, como el resto de
  componentes.
- **El tipo de mercado** no tiene invariante en el dominio: el dominio del catálogo
  todavía no existe.
