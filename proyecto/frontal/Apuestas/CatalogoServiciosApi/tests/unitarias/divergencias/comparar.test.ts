import { expect } from "chai";
import {
  compararCampos,
  compararLimites,
  modelosSinCorrespondencia,
  nombreDe,
  type Aviso,
  type Correspondencia,
} from "../../../scripts/divergencias/comparar.js";

const mensajes = (avisos: readonly Aviso[]) =>
  avisos.map((a) => `${a.donde}: ${a.mensaje}`);

describe("compararCampos", () => {
  const PAR: Correspondencia = {
    frontal: "Evento",
    servidor: "EventoServidor",
  };

  it("si coinciden los nombres, no hay nada que avisar, aunque los tipos difieran", () => {
    expect(
      compararCampos(PAR, { id: {}, fecha: {} }, { id: {}, fecha: {} }),
    ).to.deep.equal([]);
  });

  it("avisa de lo que el servidor manda y el frontal no recoge", () => {
    expect(
      mensajes(compararCampos(PAR, { id: {} }, { id: {}, extra: {} })),
    ).to.deep.equal([
      "Evento ↔ EventoServidor: el servidor manda «extra» y el frontal no lo recoge.",
    ]);
  });

  it("avisa de lo que el frontal tiene sin equivalente", () => {
    expect(
      mensajes(compararCampos(PAR, { id: {}, propio: {} }, { id: {} })),
    ).to.deep.equal([
      "Evento ↔ EventoServidor: el frontal tiene «propio» y no tiene equivalente en el servidor.",
    ]);
  });

  it("lo declarado en la tabla no avisa", () => {
    const par: Correspondencia = {
      ...PAR,
      renombrados: { comienzo: "fechaHora" },
      soloFrontal: { enDirecto: "calculado" },
      ignorados: { eventoId: "ya se sabe" },
    };
    expect(
      compararCampos(
        par,
        { comienzo: {}, enDirecto: {} },
        { fechaHora: {}, eventoId: {} },
      ),
    ).to.deep.equal([]);
  });

  it("avisa de los valores que solo tiene uno de los dos", () => {
    expect(
      mensajes(
        compararCampos(
          PAR,
          { estado: { valores: ["programado", "aplazado"] } },
          { estado: { valores: ["programado", "enJuego"] } },
        ),
      ),
    ).to.deep.equal([
      "Evento ↔ EventoServidor · estado: el servidor puede mandar «enJuego» y el frontal no lo contempla.",
      "Evento ↔ EventoServidor · estado: el frontal contempla «aplazado» y el servidor no lo manda nunca.",
    ]);
  });

  it("si solo un lado tiene valores (literales frente a string), no compara valores", () => {
    expect(
      compararCampos(PAR, { estado: { valores: ["a"] } }, { estado: {} }),
    ).to.deep.equal([]);
  });

  it("avisa cuando la tabla ya no dice la verdad", () => {
    const par: Correspondencia = {
      ...PAR,
      renombrados: { comienzo: "fechaHora" },
      soloFrontal: { enDirecto: "calculado", id: "calculado" },
      ignorados: { borrado: "ya no está" },
    };
    expect(
      mensajes(compararCampos(par, { comienzo: {}, id: {} }, { id: {} })),
    ).to.deep.equal([
      "Evento ↔ EventoServidor: «comienzo» se corresponde con «fechaHora», que el servidor no tiene.",
      "Evento ↔ EventoServidor: «id» está como solo del frontal, pero el servidor lo manda.",
      "Evento ↔ EventoServidor: la tabla dice que «enDirecto» es solo del frontal, pero el frontal no lo tiene.",
      "Evento ↔ EventoServidor: la tabla ignora «borrado», pero el servidor no lo manda.",
    ]);
  });

  it("el nombre de un par con variante la incluye", () => {
    expect(
      nombreDe({ frontal: "Cambio", variante: "cuotas", servidor: "S" }),
    ).to.equal("Cambio<cuotas> ↔ S");
  });
});

describe("compararLimites", () => {
  const PAR: Correspondencia = {
    frontal: "Evento",
    servidor: "EventoServidor",
    esquema: "EventoResumen",
    renombrados: { titulo: "nombre" },
  };
  const SERVIDOR = {
    EventoResumen: {
      nombre: { longitudMinima: 3, longitudMaxima: 100 },
      marca: { longitudMaxima: 100 },
    },
  };

  it("si coinciden, no avisa, aunque el campo se llame distinto", () => {
    expect(
      compararLimites(
        [{ ...PAR, sinLimites: { marca: "opaca" } }],
        { Evento: { titulo: { longitudMinima: 3, longitudMaxima: 100 } } },
        SERVIDOR,
      ),
    ).to.deep.equal([]);
  });

  it("avisa de cada valor distinto, del que falta en un lado y de lo no recogido", () => {
    expect(
      mensajes(
        compararLimites(
          [PAR],
          { Evento: { titulo: { longitudMaxima: 80, patron: "^.+$" } } },
          SERVIDOR,
        ),
      ),
    ).to.deep.equal([
      "LIMITES.Evento.titulo.longitudMaxima: el frontal dice 80 y el servidor (EventoResumen.nombre) 100.",
      'LIMITES.Evento.titulo.patron: el frontal dice "^.+$" y el servidor (EventoResumen.nombre) no lo fija.',
      "LIMITES.Evento.titulo.longitudMinima: el frontal no lo fija y el servidor (EventoResumen.nombre) dice 3.",
      "LIMITES.Evento: el servidor limita «EventoResumen.marca» y el frontal no lo recoge.",
    ]);
  });

  it("avisa de límites del frontal que el servidor no tiene", () => {
    expect(
      mensajes(
        compararLimites(
          [{ ...PAR, sinLimites: { titulo: "-", marca: "-" } }],
          { Evento: { otro: { longitudMaxima: 5 } } },
          SERVIDOR,
        ),
      ),
    ).to.deep.equal([
      "LIMITES.Evento.otro: el servidor no tiene límites para «EventoResumen.otro».",
    ]);
  });

  it("usa la clave de LIMITES que diga la tabla, y sin esquema no compara", () => {
    expect(
      compararLimites(
        [
          {
            ...PAR,
            frontal: "EventoDetalle",
            limites: "Evento",
            sinLimites: { marca: "-" },
          },
          { frontal: "Filtro", servidor: "FiltroServidor" },
        ],
        { Evento: { titulo: { longitudMinima: 3, longitudMaxima: 100 } } },
        SERVIDOR,
      ),
    ).to.deep.equal([]);
  });

  it("un esquema sin límites en el servidor y sin LIMITES en el frontal no avisa", () => {
    expect(
      compararLimites([{ ...PAR, esquema: "Otro" }], {}, SERVIDOR),
    ).to.deep.equal([]);
  });

  it("avisa de las claves de LIMITES que no son de ningún modelo de la tabla", () => {
    expect(mensajes(compararLimites([], { Suelto: {} }, {}))).to.deep.equal([
      "LIMITES.Suelto: no se corresponde con ningún modelo de la tabla.",
    ]);
  });
});

describe("modelosSinCorrespondencia", () => {
  it("avisa de los modelos que no están en la tabla ni como sin equivalente", () => {
    expect(
      mensajes(
        modelosSinCorrespondencia(
          ["Evento", "Filtro", "Propio"],
          [{ frontal: "Evento", servidor: "S" }],
          { Filtro: "solo de la pantalla" },
        ),
      ),
    ).to.deep.equal([
      "Propio: es un modelo del frontal y no está en la tabla de correspondencias.",
    ]);
  });
});
