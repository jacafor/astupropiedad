import { z } from "zod";
import { MONEDA_POR_OPERACION, type EstadoPropiedad, type Operacion, type TipoInmueble } from "@/data/properties";
import type { Visibilidad } from "./mapeo";

/**
 * Validación del formulario de /admin (sesión 16). Los límites coinciden con los `check` de la
 * migración de Supabase; si cambias uno, cambia el otro. Mensajes en español y en "tú" (D-10).
 */

export const OPERACIONES = ["venta", "alquiler"] as const satisfies readonly Operacion[];
export const TIPOS = ["departamento", "casa", "oficina", "terreno"] as const satisfies readonly TipoInmueble[];
export const ESTADOS = ["disponible", "reservado", "vendido"] as const satisfies readonly EstadoPropiedad[];
export const VISIBILIDADES = ["borrador", "publicada", "archivada"] as const satisfies readonly Visibilidad[];

export const ETIQUETA_ESTADO: Record<EstadoPropiedad, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const ETIQUETA_VISIBILIDAD: Record<Visibilidad, string> = {
  borrador: "Borrador",
  publicada: "Publicada",
  archivada: "Archivada",
};

/** "Departamento en Jesús María!" → "departamento-en-jesus-maria" */
export const aSlug = (texto: string): string =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CODIGO = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

/** Número escrito por una persona: admite coma decimal y separadores de miles con espacio. */
const aNumero = (v: string): number => Number(v.replace(/\s/g, "").replace(",", "."));

const numeroObligatorio = (etiqueta: string) =>
  z
    .string()
    .trim()
    .min(1, `Escribe ${etiqueta}.`)
    .transform(aNumero)
    .pipe(z.number({ error: `${etiqueta[0].toUpperCase()}${etiqueta.slice(1)}: escribe solo números.` }));

const entero = (etiqueta: string) =>
  numeroObligatorio(etiqueta).pipe(
    z
      .number()
      .int(`Escribe ${etiqueta} sin decimales.`)
      .min(0, `${etiqueta[0].toUpperCase()}${etiqueta.slice(1)} no puede ser negativo.`)
      .max(50, `Revisa ${etiqueta}: el máximo es 50.`)
  );

export const esquemaPropiedad = z
  .object({
    codigo: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Escribe el código de referencia (ej. JM-001).")
      .max(20, "El código admite hasta 20 caracteres.")
      .regex(CODIGO, "Usa solo letras, números y guiones (ej. JM-001)."),
    titulo: z
      .string()
      .trim()
      .min(5, "El título debe tener al menos 5 caracteres.")
      .max(90, "El título admite hasta 90 caracteres."),
    slug: z
      .string()
      .trim()
      .max(100, "La dirección web admite hasta 100 caracteres.")
      .refine((v) => v === "" || SLUG.test(v), "Usa minúsculas, números y guiones, sin tildes ni espacios."),
    operacion: z.enum(OPERACIONES, { error: "Elige si es venta o alquiler." }),
    tipo: z.enum(TIPOS, { error: "Elige el tipo de inmueble." }),
    distrito: z
      .string()
      .trim()
      .min(2, "Escribe el distrito.")
      .max(60, "El distrito admite hasta 60 caracteres."),
    precio: numeroObligatorio("el precio").pipe(
      z.number().positive("El precio debe ser mayor que 0.").max(1_000_000_000, "Revisa el precio: parece demasiado alto.")
    ),
    areaConstruidaM2: numeroObligatorio("el área construida").pipe(
      z.number().positive("El área construida debe ser mayor que 0.").max(1_000_000, "Revisa el área construida.")
    ),
    areaTotalM2: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : aNumero(v)))
      .pipe(
        z
          .number({ error: "Área total: escribe solo números." })
          .positive("El área total debe ser mayor que 0.")
          .max(10_000_000, "Revisa el área total.")
          .optional()
      ),
    dormitorios: entero("los dormitorios"),
    banos: entero("los baños"),
    cocheras: entero("las cocheras"),
    descripcion: z
      .string()
      .trim()
      .min(20, "La descripción debe tener al menos 20 caracteres.")
      .max(5000, "La descripción admite hasta 5000 caracteres."),
    caracteristicas: z
      .string()
      .transform((v) =>
        v
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      )
      .pipe(
        z
          .array(z.string().max(60, "Cada característica admite hasta 60 caracteres."))
          .max(20, "Hasta 20 características.")
      ),
    estado: z.enum(ESTADOS, { error: "Elige el estado." }),
    destacada: z.boolean(),
  })
  .transform((d) => ({
    ...d,
    // D-28: la moneda la fija la operación; no es un campo editable.
    moneda: MONEDA_POR_OPERACION[d.operacion],
    slug: d.slug === "" ? aSlug(`${d.titulo} ${d.codigo}`) : d.slug,
  }));

export type DatosPropiedad = z.output<typeof esquemaPropiedad>;
export type CampoPropiedad = keyof z.input<typeof esquemaPropiedad>;

/** Lo que manda el formulario (todo texto, salvo la casilla de destacada). */
export const leerFormulario = (fd: FormData): Record<CampoPropiedad, string | boolean> => {
  const t = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    codigo: t("codigo"),
    titulo: t("titulo"),
    slug: t("slug"),
    operacion: t("operacion"),
    tipo: t("tipo"),
    distrito: t("distrito"),
    precio: t("precio"),
    areaConstruidaM2: t("areaConstruidaM2"),
    areaTotalM2: t("areaTotalM2"),
    dormitorios: t("dormitorios"),
    banos: t("banos"),
    cocheras: t("cocheras"),
    descripcion: t("descripcion"),
    caracteristicas: t("caracteristicas"),
    estado: t("estado"),
    destacada: fd.get("destacada") === "on",
  };
};

/** Errores de zod → un mensaje por campo (el primero). */
export const erroresPorCampo = (error: z.ZodError): Partial<Record<CampoPropiedad, string>> => {
  const salida: Partial<Record<CampoPropiedad, string>> = {};
  for (const issue of error.issues) {
    const campo = issue.path[0] as CampoPropiedad | undefined;
    if (campo && !salida[campo]) salida[campo] = issue.message;
  }
  return salida;
};

/** Datos validados → columnas de la tabla `propiedades`. */
export const aFila = (d: DatosPropiedad) => ({
  codigo: d.codigo,
  slug: d.slug,
  titulo: d.titulo,
  operacion: d.operacion,
  tipo: d.tipo,
  distrito: d.distrito,
  precio: d.precio,
  moneda: d.moneda,
  area_construida_m2: d.areaConstruidaM2,
  area_total_m2: d.areaTotalM2 ?? null,
  dormitorios: d.dormitorios,
  banos: d.banos,
  cocheras: d.cocheras,
  descripcion: d.descripcion,
  caracteristicas: d.caracteristicas,
  estado: d.estado,
  destacada: d.destacada,
});

// ───── Fotos ─────

export const MAX_BYTES_FOTO = 4 * 1024 * 1024;
export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"] as const;

export const esquemaAlt = z
  .string()
  .trim()
  .min(5, "Describe la foto en al menos 5 caracteres (ej. \"Sala con ventanal al parque\").")
  .max(160, "La descripción de la foto admite hasta 160 caracteres.");
