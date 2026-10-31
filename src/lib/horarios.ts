/**
 * Horarios de llamada del calendario de GHL, siempre en hora de Lima.
 * Se usa en el servidor (filtrar la respuesta de la API) y en el navegador (etiquetas):
 * no importes aquí nada de servidor. Contrato: docs/INTEGRACIONES.md §2.
 */

export const ZONA_LIMA = "America/Lima";

/** Días hacia adelante que se ofrecen para agendar (la API admite hasta 31). */
export const DIAS_A_MOSTRAR = 14;

/** No se ofrecen horarios que empiecen antes de este margen (minutos desde ahora). */
export const MARGEN_MINUTOS = 60;

export type DiaHorarios = { fecha: string; horarios: string[] };

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const fechaFormato = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_LIMA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Fecha `AAAA-MM-DD` en Lima de un instante ISO. */
export const fechaLima = (iso: string): string => fechaFormato.format(new Date(iso));

/**
 * Un horario es aceptable si es una fecha ISO con zona, empieza después del margen
 * y no más allá de los días que se ofrecen.
 */
export const horarioValido = (iso: string, ahora: Date = new Date()): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(iso)) return false;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return false;
  const desde = ahora.getTime() + MARGEN_MINUTOS * 60_000;
  const hasta = ahora.getTime() + (DIAS_A_MOSTRAR + 1) * 86_400_000;
  return t >= desde && t <= hasta;
};

/**
 * Convierte la respuesta de `GET /calendars/{id}/free-slots`
 * (`{ "AAAA-MM-DD": { slots: [ISO…] }, traceId?: … }`) en días ordenados.
 * Descarta claves que no son fechas, horarios inválidos, pasados o repetidos.
 */
export const agruparHorarios = (respuesta: unknown, ahora: Date = new Date()): DiaHorarios[] => {
  if (!respuesta || typeof respuesta !== "object") return [];
  const vistos = new Set<string>();
  for (const [clave, valor] of Object.entries(respuesta)) {
    if (!FECHA.test(clave) || !valor || typeof valor !== "object") continue;
    const slots = (valor as { slots?: unknown }).slots;
    if (!Array.isArray(slots)) continue;
    for (const s of slots) if (typeof s === "string" && horarioValido(s, ahora)) vistos.add(s);
  }
  const porDia = new Map<string, string[]>();
  for (const iso of [...vistos].sort((a, b) => Date.parse(a) - Date.parse(b))) {
    const dia = fechaLima(iso);
    porDia.set(dia, [...(porDia.get(dia) ?? []), iso]);
  }
  return [...porDia].map(([fecha, horarios]) => ({ fecha, horarios }));
};

const diaFormato = new Intl.DateTimeFormat("es-PE", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const diaCortoFormato = new Intl.DateTimeFormat("es-PE", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const horaFormato =new Intl.DateTimeFormat("es-PE", {
  timeZone: ZONA_LIMA,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "jueves, 30 de octubre" a partir de `AAAA-MM-DD` (sin depender de la zona del equipo). */
export const etiquetaDia = (fecha: string): string => diaFormato.format(new Date(`${fecha}T12:00:00Z`));

/** Versión corta para botones ("Mar, 3 nov"), con mayúscula solo al inicio. */
export const etiquetaDiaCorta = (fecha: string): string => {
  const texto = diaCortoFormato.format(new Date(`${fecha}T12:00:00Z`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** "10:00" en hora de Lima. */
export const etiquetaHora = (iso: string): string => horaFormato.format(new Date(iso));

/** "jueves, 30 de octubre a las 10:00 (hora de Lima)". */
export const etiquetaHorario = (iso: string): string =>
  `${etiquetaDia(fechaLima(iso))} a las ${etiquetaHora(iso)} (hora de Lima)`;
