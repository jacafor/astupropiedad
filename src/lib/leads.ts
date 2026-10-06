/**
 * Esquema del Lead (zod) y payload hacia GoHighLevel. Solo se usa en el servidor.
 * Contrato y mapeo de campos: docs/INTEGRACIONES.md §2.
 */
import { z } from "zod";
import { INTERESES } from "./lead-tipos";

/**
 * Normaliza un celular peruano a E.164 (`+519XXXXXXXX`).
 * Acepta `987654321`, `987 654 321`, `+51 987 654 321`, `51987654321`, `0051 987654321`.
 * Devuelve `null` si no es un móvil peruano (9 dígitos que empiezan en 9).
 */
export const normalizarCelular = (entrada: string): string | null => {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.startsWith("0051")) digitos = digitos.slice(4);
  else if (digitos.startsWith("51") && digitos.length === 11) digitos = digitos.slice(2);
  return /^9\d{8}$/.test(digitos) ? `+51${digitos}` : null;
};

const MSG_CELULAR = "Escribe un celular peruano válido, por ejemplo 987 654 321.";

const numero = z.number().finite().positive().max(1_000_000_000).optional();
const texto = (max: number) => z.string().trim().max(max).optional();

const contextoSchema = z
  .object({
    tipoPropiedad: texto(40),
    distrito: texto(80),
    areaM2: numero,
    habitaciones: numero,
    montoPrestamo: numero,
    plazoAnios: numero,
    tea: numero,
    cuota: numero,
    precio: numero,
    alquilerMensual: numero,
    capRateNeto: numero,
    propiedadId: texto(40),
  })
  .partial();

const utmSchema = z
  .object({
    source: texto(80),
    medium: texto(80),
    campaign: texto(120),
    term: texto(120),
    content: texto(120),
  })
  .partial();

export const leadSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo.")
    .max(100, "El nombre es demasiado largo."),
  celular: z
    .string()
    .trim()
    .refine((v) => normalizarCelular(v) !== null, MSG_CELULAR)
    .transform((v) => normalizarCelular(v) as string),
  correo: z
    .string()
    .trim()
    .max(120, "El correo es demasiado largo.")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Escribe un correo válido o déjalo vacío.")
    .transform((v) => (v === "" ? undefined : v)),
  interes: z.enum(INTERESES, "Falta el motivo de tu consulta. Recarga la página e inténtalo de nuevo."),
  origen: z
    .string()
    .trim()
    .regex(/^[a-z0-9:_.-]{1,80}$/i, "Falta el origen del formulario. Recarga la página e inténtalo de nuevo."),
  pagina: z.string().trim().max(200).startsWith("/").catch("/"),
  consentimiento: z.literal(true, "Debes aceptar el tratamiento de tus datos para poder contactarte."),
  contexto: contextoSchema.optional(),
  utm: utmSchema.optional(),
});

export type Lead = z.output<typeof leadSchema>;

const ETIQUETA_INTERES: Record<Lead["interes"], string> = {
  comprar: "Compra",
  vender: "Venta",
  invertir: "Inversión",
  hipoteca: "Crédito hipotecario",
  asesor: "Asesor privado",
  reclutamiento: "Reclutamiento",
  contacto: "Contacto",
};

/**
 * Cuerpo JSON que se envía al webhook de GHL. Es plano a propósito: en GHL se
 * mapea cada clave a un campo de contacto, campo personalizado o etiqueta.
 */
export const construirPayload = (lead: Lead, idEnvio: string) => {
  const c = lead.contexto ?? {};
  const u = lead.utm ?? {};
  return {
    nombre: lead.nombre,
    telefono: lead.celular,
    email: lead.correo ?? "",
    interes: lead.interes,
    interes_etiqueta: ETIQUETA_INTERES[lead.interes],
    origen: lead.origen,
    pagina: lead.pagina,
    consentimiento: true,
    consentimiento_fecha: new Date().toISOString(),
    id_envio: idEnvio,
    etiquetas: ["web-astupropiedad", `interes:${lead.interes}`, `origen:${lead.origen}`],
    ctx_tipo_propiedad: c.tipoPropiedad ?? "",
    ctx_distrito: c.distrito ?? "",
    ctx_area_m2: c.areaM2 ?? "",
    ctx_habitaciones: c.habitaciones ?? "",
    ctx_monto_prestamo: c.montoPrestamo ?? "",
    ctx_plazo_anios: c.plazoAnios ?? "",
    ctx_tea: c.tea ?? "",
    ctx_cuota: c.cuota ?? "",
    ctx_precio: c.precio ?? "",
    ctx_alquiler_mensual: c.alquilerMensual ?? "",
    ctx_cap_rate_neto: c.capRateNeto ?? "",
    ctx_propiedad_id: c.propiedadId ?? "",
    utm_source: u.source ?? "",
    utm_medium: u.medium ?? "",
    utm_campaign: u.campaign ?? "",
    utm_term: u.term ?? "",
    utm_content: u.content ?? "",
  };
};
