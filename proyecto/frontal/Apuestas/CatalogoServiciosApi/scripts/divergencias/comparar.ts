// La comparación en sí, sin TypeScript ni ficheros: recibe los campos de cada lado ya
// extraídos y devuelve los avisos. Que los tipos difieran no es un aviso (para eso están
// los mappers); lo es lo que se pierde, lo que no tiene de dónde salir y las constantes que
// no coinciden.

// Un campo, visto desde fuera: su nombre y, si su tipo es una unión de literales de texto
// (un estado, una tendencia), sus valores posibles.
export interface Campo {
  readonly valores?: readonly string[];
}

export type Campos = Readonly<Record<string, Campo>>;

// Qué modelo del frontal se corresponde con cuál del servidor, y por qué difieren donde
// difieren. Cada porqué es un texto: queda escrito para quien venga detrás.
export interface Correspondencia {
  // El modelo del frontal y, si es una unión discriminada por «tipo», la variante.
  readonly frontal: string;
  readonly variante?: string;
  // El tipo del servidor, como expresión sobre lo que exporta catalogo-modelos-servidor.
  readonly servidor: string;
  // El esquema del contrato del que salen sus límites (LIMITES_SERVIDOR), si tiene.
  readonly esquema?: string;
  // La clave de LIMITES del frontal que le aplica, si no es la del propio modelo
  // (EventoDetalle usa los de Evento, del que hereda).
  readonly limites?: string;
  // Campo del frontal → campo del servidor, cuando se llaman distinto.
  readonly renombrados?: Readonly<Record<string, string>>;
  // Campos del frontal sin equivalente en el servidor, con el porqué (se calculan…).
  readonly soloFrontal?: Readonly<Record<string, string>>;
  // Campos del servidor que el frontal no recoge, con el porqué.
  readonly ignorados?: Readonly<Record<string, string>>;
  // Campos con límites en el servidor que el frontal no necesita, con el porqué.
  readonly sinLimites?: Readonly<Record<string, string>>; // Por el nombre en el frontal.
}

export type Limite = Readonly<Record<string, unknown>>;
export type Limites = Readonly<
  Record<string, Readonly<Record<string, Limite>>>
>;

export interface Aviso {
  // Dónde: «Evento ↔ EventoResumenServidor», «LIMITES.Evento.nombre»…
  readonly donde: string;
  readonly mensaje: string;
}

export function nombreDe(c: Correspondencia): string {
  const frontal = c.variante ? `${c.frontal}<${c.variante}>` : c.frontal;
  return `${frontal} ↔ ${c.servidor}`;
}

const lista = (valores: readonly string[]) =>
  valores.map((v) => `«${v}»`).join(", ");

function compararValores(
  donde: string,
  frontal: Campo,
  servidor: Campo,
): Aviso[] {
  if (!frontal.valores || !servidor.valores) return [];
  const delFrontal = new Set(frontal.valores);
  const delServidor = new Set(servidor.valores);
  const soloServidor = servidor.valores.filter((v) => !delFrontal.has(v));
  const soloFrontal = frontal.valores.filter((v) => !delServidor.has(v));
  const avisos: Aviso[] = [];
  if (soloServidor.length > 0)
    avisos.push({
      donde,
      mensaje: `el servidor puede mandar ${lista(soloServidor)} y el frontal no lo contempla.`,
    });
  if (soloFrontal.length > 0)
    avisos.push({
      donde,
      mensaje: `el frontal contempla ${lista(soloFrontal)} y el servidor no lo manda nunca.`,
    });
  return avisos;
}

// Los campos de un par de modelos.
export function compararCampos(
  c: Correspondencia,
  frontal: Campos,
  servidor: Campos,
): Aviso[] {
  const donde = nombreDe(c);
  const avisos: Aviso[] = [];
  const renombrados = c.renombrados ?? {};
  const recogidos = new Set<string>();

  for (const [campo, deFrontal] of Object.entries(frontal)) {
    const enServidor = renombrados[campo] ?? campo;
    const deServidor = servidor[enServidor];
    if (deServidor) {
      recogidos.add(enServidor);
      avisos.push(
        ...compararValores(`${donde} · ${campo}`, deFrontal, deServidor),
      );
      if (c.soloFrontal?.[campo] !== undefined)
        avisos.push({
          donde,
          mensaje: `«${campo}» está como solo del frontal, pero el servidor lo manda.`,
        });
    } else if (renombrados[campo] !== undefined)
      avisos.push({
        donde,
        mensaje: `«${campo}» se corresponde con «${enServidor}», que el servidor no tiene.`,
      });
    else if (c.soloFrontal?.[campo] === undefined)
      avisos.push({
        donde,
        mensaje: `el frontal tiene «${campo}» y no tiene equivalente en el servidor.`,
      });
  }

  for (const campo of Object.keys(servidor))
    if (!recogidos.has(campo) && c.ignorados?.[campo] === undefined)
      avisos.push({
        donde,
        mensaje: `el servidor manda «${campo}» y el frontal no lo recoge.`,
      });

  // Lo que la tabla dice y ya no es verdad: si no, la tabla se pudre sin que nadie lo vea.
  for (const campo of Object.keys(c.soloFrontal ?? {}))
    if (!(campo in frontal))
      avisos.push({
        donde,
        mensaje: `la tabla dice que «${campo}» es solo del frontal, pero el frontal no lo tiene.`,
      });
  for (const campo of Object.keys(c.ignorados ?? {}))
    if (!(campo in servidor))
      avisos.push({
        donde,
        mensaje: `la tabla ignora «${campo}», pero el servidor no lo manda.`,
      });

  return avisos;
}

function diferencia(
  frontal: unknown,
  servidor: unknown,
  enServidor: string,
): string {
  if (frontal === undefined)
    return `el frontal no lo fija y el servidor (${enServidor}) dice ${JSON.stringify(servidor)}.`;
  if (servidor === undefined)
    return `el frontal dice ${JSON.stringify(frontal)} y el servidor (${enServidor}) no lo fija.`;
  return `el frontal dice ${JSON.stringify(frontal)} y el servidor (${enServidor}) ${JSON.stringify(servidor)}.`;
}

// Las constantes: LIMITES del frontal contra LIMITES_SERVIDOR.
export function compararLimites(
  correspondencias: readonly Correspondencia[],
  frontal: Limites,
  servidor: Limites,
): Aviso[] {
  const avisos: Aviso[] = [];
  const usadas = new Set<string>();

  for (const c of correspondencias) {
    if (c.esquema === undefined) continue;
    const clave = c.limites ?? c.frontal;
    usadas.add(clave);
    const deFrontal = frontal[clave] ?? {};
    const deServidor = servidor[c.esquema] ?? {};
    const renombrados = c.renombrados ?? {};
    const comoEnFrontal = new Map(
      Object.keys(deServidor).map((campo) => [
        Object.entries(renombrados).find(([, s]) => s === campo)?.[0] ?? campo,
        campo,
      ]),
    );

    for (const [campo, limite] of Object.entries(deFrontal)) {
      const enServidor = renombrados[campo] ?? campo;
      const donde = `LIMITES.${clave}.${campo}`;
      const otro = deServidor[enServidor];
      if (!otro) {
        avisos.push({
          donde,
          mensaje: `el servidor no tiene límites para «${c.esquema}.${enServidor}».`,
        });
        continue;
      }
      for (const propiedad of new Set([
        ...Object.keys(limite),
        ...Object.keys(otro),
      ]))
        if (
          JSON.stringify(limite[propiedad]) !== JSON.stringify(otro[propiedad])
        )
          avisos.push({
            donde: `${donde}.${propiedad}`,
            mensaje: diferencia(
              limite[propiedad],
              otro[propiedad],
              `${c.esquema}.${enServidor}`,
            ),
          });
    }

    for (const [campo, enServidor] of comoEnFrontal)
      if (!(campo in deFrontal) && c.sinLimites?.[campo] === undefined)
        avisos.push({
          donde: `LIMITES.${clave}`,
          mensaje: `el servidor limita «${c.esquema}.${enServidor}» y el frontal no lo recoge.`,
        });
  }

  for (const clave of Object.keys(frontal))
    if (!usadas.has(clave))
      avisos.push({
        donde: `LIMITES.${clave}`,
        mensaje: "no se corresponde con ningún modelo de la tabla.",
      });

  return avisos;
}

// Los modelos del frontal que no aparecen en la tabla: nadie ha dicho con qué se
// corresponden, o que no se corresponden con nada.
export function modelosSinCorrespondencia(
  modelos: readonly string[],
  correspondencias: readonly Correspondencia[],
  sinEquivalente: Readonly<Record<string, string>>,
): Aviso[] {
  const cubiertos = new Set(correspondencias.map((c) => c.frontal));
  return modelos
    .filter((m) => !cubiertos.has(m) && sinEquivalente[m] === undefined)
    .map((m) => ({
      donde: m,
      mensaje:
        "es un modelo del frontal y no está en la tabla de correspondencias.",
    }));
}
