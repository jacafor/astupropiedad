/**
 * Tipos y utilidades de los leads que se comparten entre el cliente y el servidor.
 * No importes zod aquí: este archivo llega al navegador (el esquema vive en leads.ts).
 * Contrato: docs/INTEGRACIONES.md §2.
 */

export const INTERESES = [
  "comprar",
  "vender",
  "invertir",
  "hipoteca",
  "asesor",
  "reclutamiento",
  "contacto",
] as const;

export type Interes = (typeof INTERESES)[number];

export type ContextoLead = {
  // /vender
  tipoPropiedad?: string;
  distrito?: string;
  areaM2?: number;
  habitaciones?: number;
  // hipotecario
  montoPrestamo?: number;
  plazoAnios?: number;
  tea?: number;
  cuota?: number;
  // inversión
  precio?: number;
  alquilerMensual?: number;
  capRateNeto?: number;
  // fichas
  propiedadId?: string;
};

export type CampoLead = "nombre" | "celular" | "correo" | "consentimiento" | "general";

export type ResultadoLead =
  | { ok: true }
  | {
      ok: false;
      /** validacion: corrige campos · no-configurado / servicio: ofrece el plan B de WhatsApp */
      motivo: "validacion" | "no-configurado" | "servicio";
      mensaje: string;
      errores: Partial<Record<CampoLead, string>>;
    };

/** Deja solo números finitos y positivos: nunca mandamos `NaN`, `Infinity` ni negativos. */
export const numeroValido = (n: number | undefined | null): number | undefined =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;

/** Mensaje de WhatsApp del plan B: el texto contextual del formulario + los datos que la persona ya escribió. */
export const mensajeWhatsAppLead = (
  base: string,
  datos: { nombre?: string; celular?: string }
): string => {
  const nombre = datos.nombre?.trim();
  const celular = datos.celular?.trim();
  const partes = [base.trim()];
  if (nombre) partes.push(`Mi nombre es ${nombre}.`);
  if (celular) partes.push(`Mi celular es ${celular}.`);
  return partes.join(" ");
};
