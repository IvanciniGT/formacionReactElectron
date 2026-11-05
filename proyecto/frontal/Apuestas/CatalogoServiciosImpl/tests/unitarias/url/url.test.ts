import { expect } from "chai";
import { sinBarrasFinales } from "../../../src/url/url.js";

describe("sinBarrasFinales", () => {
  it("quita todas las barras del final, y solo esas", () => {
    expect(sinBarrasFinales("http://h/api///")).to.equal("http://h/api");
    expect(sinBarrasFinales("http://h/api")).to.equal("http://h/api");
  });

  it("una URL que es todo barras se queda vacía", () => {
    expect(sinBarrasFinales("///")).to.equal("");
  });

  it("con muchas barras que no están al final, no se atasca", () => {
    const larga = `${"/".repeat(100_000)}x`;
    expect(sinBarrasFinales(larga)).to.equal(larga);
  });
});
