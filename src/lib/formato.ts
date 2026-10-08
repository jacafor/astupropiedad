/** Utilidades de presentación para los simuladores (sin lógica financiera). */

import type { Moneda } from "./finance";

/** Texto del input → número. Vacío o ilegible = NaN (finance.ts lo rechaza con un mensaje). */
export const leerNumero = (texto: string): number => (texto.trim() === "" ? NaN : Number(texto));

/** Campo opcional: vacío = `undefined` (finance.ts lo trata como 0). */
export const leerOpcional = (texto: string): number | undefined =>
  texto.trim() === "" ? undefined : Number(texto);

export const SIMBOLO: Record<Moneda, string> = { USD: "US$", PEN: "S/" };

/** Formatea un monto. Si el valor no es un número finito muestra un guion, nunca "NaN" ni "∞". */
export const formatearMoneda = (valor: number | undefined, moneda: Moneda, decimales = 0): string => {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "—";
  const n = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(Math.max(0, valor));
  return `${SIMBOLO[moneda]} ${n}`;
};

export const formatearPorcentaje = (valor: number | undefined, decimales = 2): string =>
  typeof valor === "number" && Number.isFinite(valor) ? `${valor.toFixed(decimales)} %` : "—";
