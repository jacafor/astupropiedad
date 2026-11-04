import { describe, expect, it } from "vitest";
import { obtenerPropiedades } from "./inventario";
import { MONEDA_POR_OPERACION } from "./properties";

describe("inventario de propiedades", () => {
  it("publica la venta en dólares y el alquiler en soles (D-28)", async () => {
    expect(MONEDA_POR_OPERACION).toEqual({ venta: "USD", alquiler: "PEN" });
    for (const p of await obtenerPropiedades()) {
      expect(p.moneda, `${p.id}: ${p.operacion} debe ir en ${MONEDA_POR_OPERACION[p.operacion]}`).toBe(
        MONEDA_POR_OPERACION[p.operacion]
      );
    }
  });

  it("no repite id ni slug", async () => {
    const lista = await obtenerPropiedades();
    expect(new Set(lista.map((p) => p.id)).size).toBe(lista.length);
    expect(new Set(lista.map((p) => p.slug)).size).toBe(lista.length);
  });
});
