/**
 * Matemática financiera de los simuladores. Funciones puras, sin React.
 * Fórmulas y supuestos: docs/ARQUITECTURA.md §"Matemática financiera".
 *
 * Contrato: cada función valida sus entradas y devuelve `{ ok: true, valor }` o
 * `{ ok: false, errores }`. Nunca devuelve NaN, Infinity ni números negativos
 * (cuando el resultado real sería negativo se informa con una bandera, no con un signo).
 * Los porcentajes se reciben como número "humano" (8.5 = 8,5 %).
 */

export type Moneda = "USD" | "PEN";

export type CampoFinanza =
  | "capital"
  | "cuotaInicial"
  | "tea"
  | "plazoAnios"
  | "plazoMeses"
  | "cuota"
  | "ingreso"
  | "ratioMaximo"
  | "precio"
  | "alquiler"
  | "mantenimiento"
  | "arbitrios"
  | "impuestoRenta"
  | "alcabala"
  | "gastosNotariales"
  | "plusvalia"
  | "anios"
  | "monto"
  | "tipoCambio";

export type ErrorFinanza = { campo: CampoFinanza; mensaje: string };

export type Resultado<T> = { ok: true; valor: T } | { ok: false; errores: ErrorFinanza[] };

export const LIMITES = {
  /** Tope de cualquier monto: evita desbordes y resultados sin sentido. */
  montoMax: 1_000_000_000,
  teaMax: 100,
  plazoAniosMin: 1,
  plazoAniosMax: 40,
  porcentajeMax: 100,
  tipoCambioMax: 1_000,
} as const;

const ok = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const fallo = <T>(errores: ErrorFinanza[]): Resultado<T> => ({ ok: false, errores });

const fmt = (n: number) => n.toLocaleString("es-PE");

type Regla = {
  /** Si es true, el valor debe ser > 0; si no, basta con ≥ 0. */
  positivo?: boolean;
  max: number;
  /** Mensaje propio para el rango (p. ej. el plazo). */
  mensajeRango?: string;
};

/** Valida un número y, si no cumple, agrega el error en español junto al campo. */
const chequear = (errores: ErrorFinanza[], campo: CampoFinanza, valor: number, regla: Regla): void => {
  let mensaje: string | null = null;
  if (typeof valor !== "number" || !Number.isFinite(valor)) mensaje = "Ingresa un número válido.";
  else if (valor < 0) mensaje = regla.mensajeRango ?? "No puede ser negativo.";
  else if (regla.positivo && valor === 0) mensaje = regla.mensajeRango ?? "Debe ser mayor que 0.";
  else if (valor > regla.max) mensaje = regla.mensajeRango ?? `Es demasiado alto (máximo ${fmt(regla.max)}).`;
  if (mensaje) errores.push({ campo, mensaje });
};

/** Campo opcional: `undefined` se trata como 0; cualquier otro valor se valida. */
const chequearOpcional = (
  errores: ErrorFinanza[],
  campo: CampoFinanza,
  valor: number | undefined,
  regla: Regla
): number => {
  if (valor === undefined) return 0;
  chequear(errores, campo, valor, regla);
  return valor;
};

const reglaMonto: Regla = { max: LIMITES.montoMax };
const reglaMontoPositivo: Regla = { max: LIMITES.montoMax, positivo: true };
const reglaPorcentaje: Regla = { max: LIMITES.porcentajeMax };

// ─── Tasa y cuota ──────────────────────────────────────────────────────────

/** TEA (%) → tasa efectiva mensual como fracción: (1 + TEA)^(1/12) − 1. */
export const tasaMensualDesdeTEA = (teaPct: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "tea", teaPct, { max: LIMITES.teaMax, mensajeRango: `Ingresa una tasa entre 0 y ${LIMITES.teaMax} %.` });
  if (errores.length) return fallo(errores);
  // expm1/log1p conservan precisión con tasas muy pequeñas.
  return ok(Math.expm1(Math.log1p(teaPct / 100) / 12));
};

/** Años → meses enteros, con el rango permitido (1 a 40 años). */
export const mesesDesdeAnios = (anios: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "plazoAnios", anios, {
    positivo: true,
    max: LIMITES.plazoAniosMax,
    mensajeRango: `Elige un plazo entre ${LIMITES.plazoAniosMin} y ${LIMITES.plazoAniosMax} años.`,
  });
  if (!errores.length && anios < LIMITES.plazoAniosMin) {
    errores.push({ campo: "plazoAnios", mensaje: `Elige un plazo entre ${LIMITES.plazoAniosMin} y ${LIMITES.plazoAniosMax} años.` });
  }
  if (errores.length) return fallo(errores);
  return ok(Math.round(anios * 12));
};

export type EntradaPrestamo = { capital: number; teaPct: number; plazoMeses: number };

const validarPrestamo = ({ capital, teaPct, plazoMeses }: EntradaPrestamo): ErrorFinanza[] => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "capital", capital, reglaMontoPositivo);
  const tasa = tasaMensualDesdeTEA(teaPct);
  if (!tasa.ok) errores.push(...tasa.errores);
  const rangoPlazo = `Elige un plazo entre ${LIMITES.plazoAniosMin} y ${LIMITES.plazoAniosMax} años.`;
  if (!Number.isInteger(plazoMeses) || plazoMeses < 1 || plazoMeses > LIMITES.plazoAniosMax * 12) {
    errores.push({ campo: "plazoMeses", mensaje: rangoPlazo });
  }
  return errores;
};

/** Cuota mensual constante (sistema francés). Con TEA = 0 es capital / n. */
export const cuotaFrancesa = (entrada: EntradaPrestamo): Resultado<number> => {
  const errores = validarPrestamo(entrada);
  if (errores.length) return fallo(errores);
  const { capital, teaPct, plazoMeses: n } = entrada;
  const tasa = tasaMensualDesdeTEA(teaPct);
  if (!tasa.ok) return fallo(tasa.errores);
  const i = tasa.valor;
  if (i === 0) return ok(capital / n);
  // capital · i / (1 − (1+i)^−n), escrito con expm1/log1p para no perder precisión.
  const cuota = (capital * i) / -Math.expm1(-n * Math.log1p(i));
  return Number.isFinite(cuota) && cuota >= 0 ? ok(cuota) : fallo([{ campo: "capital", mensaje: "No se pudo calcular con estos valores." }]);
};

export type FilaCronograma = {
  numero: number;
  cuota: number;
  interes: number;
  amortizacion: number;
  saldo: number;
};

export type Cronograma = {
  cuota: number;
  totalIntereses: number;
  totalPagado: number;
  filas: FilaCronograma[];
};

/** Cronograma mes a mes. El saldo final se fuerza a 0 (absorbe el redondeo de coma flotante). */
export const cronogramaFrances = (entrada: EntradaPrestamo): Resultado<Cronograma> => {
  const cuotaRes = cuotaFrancesa(entrada);
  if (!cuotaRes.ok) return fallo(cuotaRes.errores);
  const tasa = tasaMensualDesdeTEA(entrada.teaPct);
  if (!tasa.ok) return fallo(tasa.errores);
  const cuota = cuotaRes.valor;
  const i = tasa.valor;
  const n = entrada.plazoMeses;

  const filas: FilaCronograma[] = [];
  let saldo = entrada.capital;
  let totalIntereses = 0;
  for (let k = 1; k <= n; k++) {
    const interes = saldo * i;
    const amortizacion = k === n ? saldo : Math.min(saldo, cuota - interes);
    saldo = k === n ? 0 : Math.max(0, saldo - amortizacion);
    totalIntereses += interes;
    filas.push({ numero: k, cuota: interes + amortizacion, interes, amortizacion, saldo });
  }
  return ok({ cuota, totalIntereses, totalPagado: entrada.capital + totalIntereses, filas });
};

/** Monto a financiar = precio − cuota inicial (% del precio, de 0 a 99). */
export const montoFinanciado = (precio: number, cuotaInicialPct: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "precio", precio, reglaMontoPositivo);
  chequear(errores, "cuotaInicial", cuotaInicialPct, {
    max: 99,
    mensajeRango: "Ingresa un porcentaje entre 0 y 99.",
  });
  if (errores.length) return fallo(errores);
  return ok(precio * (1 - cuotaInicialPct / 100));
};

// ─── Capacidad de pago ─────────────────────────────────────────────────────

/** Qué porcentaje del ingreso mensual consume la cuota. */
export const relacionCuotaIngreso = (cuota: number, ingresoMensual: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "cuota", cuota, reglaMonto);
  chequear(errores, "ingreso", ingresoMensual, reglaMontoPositivo);
  if (errores.length) return fallo(errores);
  return ok((cuota / ingresoMensual) * 100);
};

/** Ingreso mensual mínimo para que la cuota no pase de `ratioMaximoPct` % del ingreso. */
export const ingresoMinimoRequerido = (cuota: number, ratioMaximoPct: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "cuota", cuota, reglaMonto);
  chequear(errores, "ratioMaximo", ratioMaximoPct, {
    positivo: true,
    max: LIMITES.porcentajeMax,
    mensajeRango: `Ingresa un porcentaje entre 1 y ${LIMITES.porcentajeMax}.`,
  });
  if (errores.length) return fallo(errores);
  return ok(cuota / (ratioMaximoPct / 100));
};

// ─── Inversión ─────────────────────────────────────────────────────────────

export type EntradaRentabilidad = {
  precio: number;
  alquilerMensual: number;
  /** Opcionales: vacío = 0. */
  mantenimientoMensual?: number;
  arbitriosAnuales?: number;
  /** % del alquiler bruto anual que se paga como impuesto a la renta. */
  impuestoRentaPct?: number;
};

/** Rentabilidad bruta anual (%): alquiler anual / precio, sin descontar nada. */
export const rentabilidadBruta = (precio: number, alquilerMensual: number): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "precio", precio, reglaMontoPositivo);
  chequear(errores, "alquiler", alquilerMensual, reglaMonto);
  if (errores.length) return fallo(errores);
  return ok(((alquilerMensual * 12) / precio) * 100);
};

export type Rentabilidad = {
  ingresoBrutoAnual: number;
  gastosAnuales: number;
  impuestoRentaAnual: number;
  /** Nunca negativo: si los gastos superan el alquiler es 0 y `gastosSuperanIngresos` = true. */
  ingresoNetoAnual: number;
  flujoMensualNeto: number;
  gastosSuperanIngresos: boolean;
  /** Cuánto faltaría cubrir al año cuando los gastos superan el alquiler (≥ 0). */
  faltanteAnual: number;
  rentabilidadBrutaPct: number;
  /** Cap rate: ingreso neto operativo anual / precio, en %. */
  capRatePct: number;
};

export const rentabilidadNeta = (entrada: EntradaRentabilidad): Resultado<Rentabilidad> => {
  const errores: ErrorFinanza[] = [];
  const { precio, alquilerMensual } = entrada;
  chequear(errores, "precio", precio, reglaMontoPositivo);
  chequear(errores, "alquiler", alquilerMensual, reglaMonto);
  const mantenimiento = chequearOpcional(errores, "mantenimiento", entrada.mantenimientoMensual, reglaMonto);
  const arbitrios = chequearOpcional(errores, "arbitrios", entrada.arbitriosAnuales, reglaMonto);
  const irPct = chequearOpcional(errores, "impuestoRenta", entrada.impuestoRentaPct, reglaPorcentaje);
  if (errores.length) return fallo(errores);

  const ingresoBrutoAnual = alquilerMensual * 12;
  const gastosAnuales = mantenimiento * 12 + arbitrios;
  const impuestoRentaAnual = ingresoBrutoAnual * (irPct / 100);
  const neto = ingresoBrutoAnual - gastosAnuales - impuestoRentaAnual;
  const ingresoNetoAnual = Math.max(0, neto);
  return ok({
    ingresoBrutoAnual,
    gastosAnuales,
    impuestoRentaAnual,
    ingresoNetoAnual,
    flujoMensualNeto: ingresoNetoAnual / 12,
    gastosSuperanIngresos: neto < 0,
    faltanteAnual: Math.max(0, -neto),
    rentabilidadBrutaPct: (ingresoBrutoAnual / precio) * 100,
    capRatePct: (ingresoNetoAnual / precio) * 100,
  });
};

export type CostoCompra = { alcabala: number; gastosNotariales: number; total: number };

/** Desembolso inicial: precio + alcabala (% editable) + gastos notariales (monto editable). */
export const inversionTotal = (
  precio: number,
  alcabalaPct?: number,
  gastosNotariales?: number
): Resultado<CostoCompra> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "precio", precio, reglaMontoPositivo);
  const pct = chequearOpcional(errores, "alcabala", alcabalaPct, reglaPorcentaje);
  const notarial = chequearOpcional(errores, "gastosNotariales", gastosNotariales, reglaMonto);
  if (errores.length) return fallo(errores);
  const alcabala = precio * (pct / 100);
  return ok({ alcabala, gastosNotariales: notarial, total: precio + alcabala + notarial });
};

export type ProyeccionPlusvalia = { valorFuturo: number; ganancia: number };

/** Valor a `anios` años con plusvalía anual compuesta (0 a 100 %). */
export const proyeccionPlusvalia = (
  precio: number,
  plusvaliaAnualPct: number,
  anios: number
): Resultado<ProyeccionPlusvalia> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "precio", precio, reglaMontoPositivo);
  chequear(errores, "plusvalia", plusvaliaAnualPct, reglaPorcentaje);
  chequear(errores, "anios", anios, { positivo: true, max: LIMITES.plazoAniosMax });
  if (errores.length) return fallo(errores);
  const valorFuturo = precio * Math.pow(1 + plusvaliaAnualPct / 100, anios);
  if (!Number.isFinite(valorFuturo)) return fallo([{ campo: "plusvalia", mensaje: "No se pudo calcular con estos valores." }]);
  return ok({ valorFuturo, ganancia: valorFuturo - precio });
};

// ─── Moneda ────────────────────────────────────────────────────────────────

/** `tipoCambio` = soles (PEN) por 1 dólar (USD). Lo escribe la persona; aquí no hay valor por defecto. */
export const convertirMoneda = (
  monto: number,
  de: Moneda,
  a: Moneda,
  tipoCambio: number
): Resultado<number> => {
  const errores: ErrorFinanza[] = [];
  chequear(errores, "monto", monto, reglaMonto);
  chequear(errores, "tipoCambio", tipoCambio, { positivo: true, max: LIMITES.tipoCambioMax });
  if (errores.length) return fallo(errores);
  if (de === a) return ok(monto);
  return ok(de === "USD" ? monto * tipoCambio : monto / tipoCambio);
};

/** Mensaje de un campo concreto dentro de una lista de errores (para mostrarlo junto al input). */
export const mensajeDe = (errores: ErrorFinanza[], campo: CampoFinanza): string | undefined =>
  errores.find((e) => e.campo === campo)?.mensaje;
