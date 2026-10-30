import { describe, expect, it } from "vitest";
import { MONEDA_POR_OPERACION, obtenerPropiedades } from "./properties";

describe("inventario de propiedades", () => {
  it("publica la venta en dólares y el alquiler en soles (D-28)", () => {
    expect(MONEDA_POR_OPERACION).toEqual({ venta: "USD", alquiler: "PEN" });
    for (const p of obtenerPropiedades()) {
      expect(p.moneda, `${p.id}: ${p.operacion} debe ir en ${MONEDA_POR_OPERACION[p.operacion]}`).toBe(
        MONEDA_POR_OPERACION[p.operacion]
      );
    }
  });

  it("no repite id ni slug", () => {
    const lista = obtenerPropiedades();
    expect(new Set(lista.map((p) => p.id)).size).toBe(lista.length);
    expect(new Set(lista.map((p) => p.slug)).size).toBe(lista.length);
  });
});
