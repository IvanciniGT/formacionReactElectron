import { expect } from "chai";
import {
  cambioRecibido,
  evento,
  eventoCargado,
  eventoPedido,
  grupoAbierto,
  mercadosCargados,
} from "../../src/evento/evento.js";
import type { EstadoEvento } from "../../src/estado.js";
import { detalle, mercado } from "./datos.js";

// Un reducer es una función: estado y evento entran, estado nuevo sale. Sin store.
const tras = (...acciones: Parameters<typeof evento.reducer>[1][]) =>
  acciones.reduce<EstadoEvento>(
    evento.reducer,
    evento.reducer(undefined, { type: "" }),
  );

describe("evento", () => {
  const abierto = [
    eventoPedido("e1"),
    eventoCargado(detalle()),
    grupoAbierto("principales"),
    mercadosCargados([mercado("m1"), mercado("m2")]),
  ];

  it("al pedirlo se marca que se carga; al llegar, queda el detalle", () => {
    expect(tras(eventoPedido("e1")).carga).to.equal("cargando");
    const estado = tras(eventoPedido("e1"), eventoCargado(detalle()));
    expect(estado.carga).to.equal("listo");
    expect(estado.detalle?.nombre).to.equal("Evento e1");
  });

  it("un cambio de cuota llega al principal y al mismo mercado en el grupo", () => {
    const estado = tras(
      ...abierto,
      cambioRecibido({
        tipo: "cuotas",
        marca: "11",
        cuotas: [
          {
            mercadoId: "m1",
            seleccionId: "m1-1",
            cuota: 1.5,
            tendencia: "baja",
          },
        ],
        mercados: [],
      }),
    );
    expect(estado.detalle?.mercadoPrincipal?.selecciones[0]).to.include({
      cuota: 1.5,
      tendencia: "baja",
    });
    expect(estado.mercados[0]?.selecciones[0]).to.include({
      cuota: 1.5,
      tendencia: "baja",
    });
    expect(estado.mercados[1]?.selecciones[0]?.cuota).to.equal(2);
    expect(estado.detalle?.marca).to.equal("11");
  });

  it("un mercado suspendido no admite apuestas; uno que ya no se ve, desaparece", () => {
    const estado = tras(
      ...abierto,
      cambioRecibido({
        tipo: "cuotas",
        marca: "11",
        cuotas: [],
        mercados: [
          { mercadoId: "m2", estado: "suspendido" },
          { mercadoId: "m1", estado: null },
        ],
      }),
    );
    expect(
      estado.mercados.map((m) => [m.id, m.seAdmitenApuestas]),
    ).to.deep.equal([["m2", false]]);
    expect(estado.detalle?.mercadoPrincipal).to.equal(null);
  });

  it("el estado del evento: en juego está en directo; uno final se apunta aparte", () => {
    const enJuego = tras(
      ...abierto,
      cambioRecibido({ tipo: "estado", marca: "11", estado: "enJuego" }),
    );
    expect(enJuego.detalle).to.include({ estado: "enJuego", enDirecto: true });

    const final = tras(
      ...abierto,
      cambioRecibido({ tipo: "estado", marca: "12", estado: "finalizado" }),
    );
    expect(final.final).to.equal("finalizado");
    expect(final.detalle?.estado).to.equal("programado");
  });

  it("al volver a pedir el mismo evento (recarga) se conserva el grupo; otro, no", () => {
    expect(tras(...abierto, eventoPedido("e1")).grupo).to.equal("principales");
    expect(tras(...abierto, eventoPedido("e2")).grupo).to.equal(undefined);
  });

  it("un cambio sin evento cargado no hace nada", () => {
    const estado = tras(
      cambioRecibido({ tipo: "estado", marca: "1", estado: "enJuego" }),
    );
    expect(estado.detalle).to.equal(undefined);
  });

  it("sin mercado principal, los cambios llegan igual a los del grupo", () => {
    const estado = tras(
      eventoPedido("e1"),
      eventoCargado({ ...detalle(), mercadoPrincipal: null }),
      grupoAbierto("principales"),
      mercadosCargados([mercado("m1")]),
      cambioRecibido({
        tipo: "cuotas",
        marca: "11",
        cuotas: [
          { mercadoId: "m1", seleccionId: "m1-2", cuota: 4, tendencia: "sube" },
        ],
        mercados: [],
      }),
    );
    expect(estado.mercados[0]?.selecciones[1]?.cuota).to.equal(4);
  });
});
