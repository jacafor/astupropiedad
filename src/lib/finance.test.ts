import { describe, expect, it } from "vitest";
import {
  convertirMoneda,
  cronogramaFrances,
  cuotaFrancesa,
  ingresoMinimoRequerido,
  inversionTotal,
  mensajeDe,
  mesesDesdeAnios,
  montoFinanciado,
  proyeccionPlusvalia,
  relacionCuotaIngreso,
  rentabilidadBruta,
  rentabilidadNeta,
  tasaMensualDesdeTEA,
  type Resultado,
} from "./finance";

/** Extrae el valor o falla la prueba con los errores. */
const valor = <T,>(r: Resultado<T>): T => {
  if (!r.ok) throw new Error(`Se esperaba ok: ${JSON.stringify(r.errores)}`);
  return r.valor;
};
const campos = <T,>(r: Resultado<T>): string[] => (r.ok ? [] : r.errores.map((e) => e.campo));

/** Ningún número del resultado puede ser NaN, Infinity ni negativo. */
const todosLimpios = (o: unknown): boolean => {
  if (typeof o === "number") return Number.isFinite(o) && o >= 0;
  if (Array.isArray(o)) return o.every(todosLimpios);
  if (o && typeof o === "object") return Object.values(o).every(todosLimpios);
  return true;
};

describe("tasaMensualDesdeTEA", () => {
  it("TEA 12.6825030132 % equivale a 1 % mensual (1.01^12 − 1)", () => {
    expect(valor(tasaMensualDesdeTEA(12.682503013196978))).toBeCloseTo(0.01, 10);
  });
  it("TEA 10 % → 0.797414 % mensual: 1.1^(1/12) − 1 (distinto de 10/12 = 0.8333 %)", () => {
    // Referencia: ln(1.1)/12 = 0.0079425; e^0.0079425 − 1 = 0.0079741.
    expect(valor(tasaMensualDesdeTEA(10))).toBeCloseTo(0.0079741404, 9);
  });
  it("TEA 0 → 0", () => {
    expect(valor(tasaMensualDesdeTEA(0))).toBe(0);
  });
  it("rechaza negativa, NaN, Infinity y valores enormes", () => {
    for (const x of [-1, NaN, Infinity, -Infinity, 101, 1e9]) {
      expect(campos(tasaMensualDesdeTEA(x))).toEqual(["tea"]);
    }
  });
});

describe("mesesDesdeAnios", () => {
  it("convierte años a meses", () => {
    expect(valor(mesesDesdeAnios(20))).toBe(240);
    expect(valor(mesesDesdeAnios(1.5))).toBe(18);
  });
  it("plazo 0, negativo, menor a 1 año, mayor a 40 o inválido → error", () => {
    for (const x of [0, -5, 0.5, 41, NaN, Infinity]) {
      expect(campos(mesesDesdeAnios(x))).toEqual(["plazoAnios"]);
    }
  });
});

describe("cuotaFrancesa", () => {
  // Caso 1 (calculado a mano con la fórmula cerrada): 12 000 a 12 meses, TEM 1 % (TEA = 1.01^12 − 1).
  // 12000 · 0.01 / (1 − 1.01^−12) = 120 / 0.11255 = 1 066.19. Valor clásico de tabla de amortización.
  it("12 000 a 12 meses con TEM 1 % → 1 066.19", () => {
    const cuota = valor(cuotaFrancesa({ capital: 12000, teaPct: 12.682503013196978, plazoMeses: 12 }));
    expect(cuota).toBeCloseTo(1066.19, 2);
  });
  // Caso 2 (calculado con un script aparte, aritmética directa sin expm1/log1p; NO es una hoja de cálculo
  // ni un simulador bancario): 100 000, TEA 10 %, 120 meses → 1 297.7546.
  it("100 000 a 10 años con TEA 10 % → 1 297.75", () => {
    expect(valor(cuotaFrancesa({ capital: 100000, teaPct: 10, plazoMeses: 120 }))).toBeCloseTo(1297.7546, 3);
  });
  // Caso 3: el ejemplo por defecto del simulador (200 000, 8.5 %, 20 años) → 1 696.08,
  // no 1 735.65 que daba tratar la TEA como nominal (error C7, +2.3 %).
  it("200 000 a 20 años con TEA 8.5 % → 1 696.08", () => {
    expect(valor(cuotaFrancesa({ capital: 200000, teaPct: 8.5, plazoMeses: 240 }))).toBeCloseTo(1696.0796, 3);
  });
  it("TEA 0 → capital / n", () => {
    expect(valor(cuotaFrancesa({ capital: 120000, teaPct: 0, plazoMeses: 120 }))).toBe(1000);
  });
  it("acepta decimales en el capital", () => {
    expect(valor(cuotaFrancesa({ capital: 1000.5, teaPct: 0, plazoMeses: 10 }))).toBeCloseTo(100.05, 10);
  });
  it("plazo 0 → error, nunca Infinity", () => {
    const r = cuotaFrancesa({ capital: 200000, teaPct: 8.5, plazoMeses: 0 });
    expect(r.ok).toBe(false);
    expect(campos(r)).toEqual(["plazoMeses"]);
  });
  it("monto 0, negativo, NaN o Infinity → error en 'capital'", () => {
    for (const c of [0, -1000, NaN, Infinity]) {
      expect(campos(cuotaFrancesa({ capital: c, teaPct: 8.5, plazoMeses: 240 }))).toEqual(["capital"]);
    }
  });
  it("devuelve todos los errores a la vez", () => {
    expect(campos(cuotaFrancesa({ capital: -1, teaPct: -2, plazoMeses: 0 })).sort()).toEqual(["capital", "plazoMeses", "tea"]);
  });
  it("plazo fraccionario, negativo o mayor a 40 años → error", () => {
    for (const n of [-12, 1.5, 481]) {
      expect(campos(cuotaFrancesa({ capital: 1000, teaPct: 5, plazoMeses: n }))).toEqual(["plazoMeses"]);
    }
  });
  it("monto enorme (más de 1 000 millones) → error", () => {
    expect(campos(cuotaFrancesa({ capital: 1e15, teaPct: 8.5, plazoMeses: 240 }))).toEqual(["capital"]);
  });
  it("en el límite máximo el resultado sigue siendo finito y positivo", () => {
    const c = valor(cuotaFrancesa({ capital: 1e9, teaPct: 100, plazoMeses: 480 }));
    expect(Number.isFinite(c) && c > 0).toBe(true);
  });
  it("TEA diminuta no pierde precisión ni da NaN", () => {
    const c = valor(cuotaFrancesa({ capital: 120000, teaPct: 1e-9, plazoMeses: 120 }));
    expect(c).toBeCloseTo(1000, 3);
  });
});

describe("cronogramaFrances", () => {
  const entrada = { capital: 12000, teaPct: 12.682503013196978, plazoMeses: 12 };
  it("tiene n filas, el saldo termina en 0 y la amortización suma el capital", () => {
    const c = valor(cronogramaFrances(entrada));
    expect(c.filas).toHaveLength(12);
    expect(c.filas[11].saldo).toBe(0);
    expect(c.filas.reduce((s, f) => s + f.amortizacion, 0)).toBeCloseTo(12000, 6);
  });
  it("primera fila: interés = 1 % de 12 000 = 120 y amortización = 946.19", () => {
    const f = valor(cronogramaFrances(entrada)).filas[0];
    expect(f.interes).toBeCloseTo(120, 6);
    expect(f.amortizacion).toBeCloseTo(946.19, 2);
    expect(f.saldo).toBeCloseTo(12000 - 946.19, 2);
  });
  it("total de intereses = cuota · n − capital", () => {
    const c = valor(cronogramaFrances(entrada));
    expect(c.totalIntereses).toBeCloseTo(1066.1855 * 12 - 12000, 2);
    expect(c.totalPagado).toBeCloseTo(12000 + c.totalIntereses, 6);
  });
  it("TEA 0: sin intereses", () => {
    const c = valor(cronogramaFrances({ capital: 1200, teaPct: 0, plazoMeses: 12 }));
    expect(c.totalIntereses).toBe(0);
    expect(c.filas.every((f) => f.interes === 0 && f.cuota === 100)).toBe(true);
  });
  it("30 años (360 filas) sin valores sucios", () => {
    const c = valor(cronogramaFrances({ capital: 500000, teaPct: 9, plazoMeses: 360 }));
    expect(c.filas).toHaveLength(360);
    expect(todosLimpios(c)).toBe(true);
  });
  it("entradas inválidas → error", () => {
    expect(cronogramaFrances({ capital: 0, teaPct: 8, plazoMeses: 12 }).ok).toBe(false);
    expect(cronogramaFrances({ capital: 1000, teaPct: 8, plazoMeses: 0 }).ok).toBe(false);
  });
});

describe("montoFinanciado", () => {
  it("250 000 con 20 % de cuota inicial → 200 000", () => {
    expect(valor(montoFinanciado(250000, 20))).toBe(200000);
  });
  it("cuota inicial 0 % → todo el precio", () => {
    expect(valor(montoFinanciado(250000, 0))).toBe(250000);
  });
  it("cuota inicial 100 %, 150 %, negativa o NaN → error (no cuotas negativas)", () => {
    for (const p of [100, 150, -5, NaN]) {
      expect(campos(montoFinanciado(250000, p))).toEqual(["cuotaInicial"]);
    }
  });
  it("precio 0 o negativo → error", () => {
    expect(campos(montoFinanciado(0, 20))).toEqual(["precio"]);
    expect(campos(montoFinanciado(-10, 20))).toEqual(["precio"]);
  });
});

describe("relacionCuotaIngreso e ingresoMinimoRequerido", () => {
  it("cuota 1 000 con ingreso 4 000 → 25 %", () => {
    expect(valor(relacionCuotaIngreso(1000, 4000))).toBe(25);
  });
  it("cuota 1 000 con tope de 40 % → ingreso mínimo 2 500", () => {
    expect(valor(ingresoMinimoRequerido(1000, 40))).toBe(2500);
  });
  it("ingreso 0 o negativo → error (no divide entre 0)", () => {
    expect(campos(relacionCuotaIngreso(1000, 0))).toEqual(["ingreso"]);
    expect(campos(relacionCuotaIngreso(1000, -5))).toEqual(["ingreso"]);
  });
  it("tope 0, negativo o mayor a 100 → error", () => {
    for (const p of [0, -10, 101, NaN]) {
      expect(campos(ingresoMinimoRequerido(1000, p))).toEqual(["ratioMaximo"]);
    }
  });
  it("cuota negativa o NaN → error", () => {
    expect(campos(ingresoMinimoRequerido(-1, 40))).toEqual(["cuota"]);
    expect(campos(relacionCuotaIngreso(NaN, 100))).toEqual(["cuota"]);
  });
});

describe("rentabilidadBruta", () => {
  it("alquiler 1 800/mes sobre 350 000 → 6.1714 %", () => {
    // 1800 · 12 = 21 600; 21 600 / 350 000 = 0.0617142…
    expect(valor(rentabilidadBruta(350000, 1800))).toBeCloseTo(6.1714, 4);
  });
  it("alquiler 0 → 0 %; precio 0 o negativo → error", () => {
    expect(valor(rentabilidadBruta(100000, 0))).toBe(0);
    expect(campos(rentabilidadBruta(0, 1000))).toEqual(["precio"]);
    expect(campos(rentabilidadBruta(-1, 1000))).toEqual(["precio"]);
  });
  it("valores enormes → error", () => {
    expect(campos(rentabilidadBruta(1e12, 1))).toEqual(["precio"]);
    expect(campos(rentabilidadBruta(100000, 1e12))).toEqual(["alquiler"]);
  });
});

describe("rentabilidadNeta (cap rate)", () => {
  // Caso a mano: precio 350 000; alquiler 1 800 → bruto anual 21 600.
  // Mantenimiento 100/mes = 1 200; arbitrios 600; IR 5 % de 21 600 = 1 080.
  // Neto = 21 600 − 1 200 − 600 − 1 080 = 18 720 → cap rate 18 720 / 350 000 = 5.3486 %; flujo mensual 1 560.
  it("caso con todos los costos", () => {
    const r = valor(
      rentabilidadNeta({ precio: 350000, alquilerMensual: 1800, mantenimientoMensual: 100, arbitriosAnuales: 600, impuestoRentaPct: 5 })
    );
    expect(r.ingresoBrutoAnual).toBe(21600);
    expect(r.gastosAnuales).toBe(1800);
    expect(r.impuestoRentaAnual).toBe(1080);
    expect(r.ingresoNetoAnual).toBe(18720);
    expect(r.flujoMensualNeto).toBe(1560);
    expect(r.capRatePct).toBeCloseTo(5.3486, 4);
    expect(r.rentabilidadBrutaPct).toBeCloseTo(6.1714, 4);
    expect(r.gastosSuperanIngresos).toBe(false);
  });
  it("sin costos opcionales, cap rate = rentabilidad bruta", () => {
    const r = valor(rentabilidadNeta({ precio: 100000, alquilerMensual: 500 }));
    expect(r.capRatePct).toBeCloseTo(r.rentabilidadBrutaPct, 10);
  });
  it("si los gastos superan el alquiler, el neto es 0 (no negativo) y se avisa", () => {
    const r = valor(rentabilidadNeta({ precio: 100000, alquilerMensual: 100, mantenimientoMensual: 500 }));
    expect(r.gastosSuperanIngresos).toBe(true);
    expect(r.ingresoNetoAnual).toBe(0);
    expect(r.capRatePct).toBe(0);
    expect(r.faltanteAnual).toBe(4800);
    expect(todosLimpios(r)).toBe(true);
  });
  it("entradas inválidas → error por campo", () => {
    expect(
      campos(rentabilidadNeta({ precio: 0, alquilerMensual: -1, mantenimientoMensual: -2, arbitriosAnuales: NaN, impuestoRentaPct: 150 })).sort()
    ).toEqual(["alquiler", "arbitrios", "impuestoRenta", "mantenimiento", "precio"]);
  });
});

describe("inversionTotal", () => {
  it("350 000 + 3 % de alcabala (10 500) + 1 500 notariales = 362 000", () => {
    const r = valor(inversionTotal(350000, 3, 1500));
    expect(r.alcabala).toBe(10500);
    expect(r.total).toBe(362000);
  });
  it("sin alcabala ni gastos (campos vacíos) el total es el precio", () => {
    expect(valor(inversionTotal(350000)).total).toBe(350000);
  });
  it("valores inválidos → error", () => {
    expect(campos(inversionTotal(-1, 200, -5)).sort()).toEqual(["alcabala", "gastosNotariales", "precio"]);
  });
});

describe("proyeccionPlusvalia", () => {
  it("100 000 al 4 % anual a 5 años → 121 665.29", () => {
    // 1.04^5 = 1.2166529
    const r = valor(proyeccionPlusvalia(100000, 4, 5));
    expect(r.valorFuturo).toBeCloseTo(121665.29, 2);
    expect(r.ganancia).toBeCloseTo(21665.29, 2);
  });
  it("0 % → sin ganancia", () => {
    expect(valor(proyeccionPlusvalia(100000, 0, 5)).ganancia).toBe(0);
  });
  it("plusvalía negativa, años 0 o precio 0 → error", () => {
    expect(campos(proyeccionPlusvalia(100000, -4, 5))).toEqual(["plusvalia"]);
    expect(campos(proyeccionPlusvalia(100000, 4, 0))).toEqual(["anios"]);
    expect(campos(proyeccionPlusvalia(0, 4, 5))).toEqual(["precio"]);
  });
});

describe("convertirMoneda", () => {
  it("USD → PEN multiplica y PEN → USD divide (el tipo de cambio lo escribe la persona)", () => {
    expect(valor(convertirMoneda(100, "USD", "PEN", 4))).toBe(400);
    expect(valor(convertirMoneda(400, "PEN", "USD", 4))).toBe(100);
    expect(valor(convertirMoneda(100, "USD", "USD", 4))).toBe(100);
  });
  it("tipo de cambio 0, negativo, NaN o enorme → error (no divide entre 0)", () => {
    for (const tc of [0, -3, NaN, 1e6]) {
      expect(campos(convertirMoneda(100, "PEN", "USD", tc))).toEqual(["tipoCambio"]);
    }
  });
});

describe("mensajeDe", () => {
  it("devuelve el mensaje del campo pedido", () => {
    const r = cuotaFrancesa({ capital: 1000, teaPct: 5, plazoMeses: 0 });
    expect(!r.ok && mensajeDe(r.errores, "plazoMeses")).toMatch(/plazo/);
    expect(!r.ok && mensajeDe(r.errores, "capital")).toBeUndefined();
  });
});

describe("barrido: nunca NaN, Infinity ni negativos en resultados ok", () => {
  const raros = [0, -1, 1e-12, 0.1, 1, 12.5, 1e6, 1e9, 1e10, 1e300, NaN, Infinity, -Infinity];
  it("cuota/cronograma", () => {
    for (const capital of raros)
      for (const teaPct of raros)
        for (const plazoMeses of [0, 1, 12, 240, 480, 481, -1, NaN]) {
          const r = cronogramaFrances({ capital, teaPct, plazoMeses });
          if (r.ok) expect(todosLimpios(r.valor)).toBe(true);
          const c = cuotaFrancesa({ capital, teaPct, plazoMeses });
          if (c.ok) expect(todosLimpios(c.valor)).toBe(true);
        }
  });
  it("rentabilidad, inversión y proyección", () => {
    for (const a of raros)
      for (const b of raros) {
        for (const r of [rentabilidadNeta({ precio: a, alquilerMensual: b, mantenimientoMensual: b, impuestoRentaPct: a }), inversionTotal(a, b, b), proyeccionPlusvalia(a, b, 5), rentabilidadBruta(a, b), relacionCuotaIngreso(a, b), ingresoMinimoRequerido(a, b), convertirMoneda(a, "USD", "PEN", b)]) {
          if (r.ok) expect(todosLimpios(r.valor)).toBe(true);
        }
      }
  });
});
