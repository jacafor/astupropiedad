import type { SesionAdmin } from "@/lib/admin/sesion";
import { ESTADOS, OPERACIONES, VISIBILIDADES } from "./esquema";
import { COLUMNAS_PROPIEDAD, filaAPropiedadAdmin, type FilaPropiedad, type PropiedadAdmin } from "./mapeo";

/** Consultas de /admin. Usan la sesión de quien administra: la RLS deja ver también borradores y archivadas. */

export type Filtros = {
  q: string;
  operacion: (typeof OPERACIONES)[number] | "";
  estado: (typeof ESTADOS)[number] | "";
  /** "" = activas (borrador + publicada); "archivada" solo se ve si se pide. */
  visibilidad: (typeof VISIBILIDADES)[number] | "";
};

const elegir = <T extends string>(valor: unknown, opciones: readonly T[]): T | "" =>
  typeof valor === "string" && (opciones as readonly string[]).includes(valor) ? (valor as T) : "";

export const leerFiltros = (sp: Record<string, string | string[] | undefined>): Filtros => ({
  q: typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "",
  operacion: elegir(sp.operacion, OPERACIONES),
  estado: elegir(sp.estado, ESTADOS),
  visibilidad: elegir(sp.visibilidad, VISIBILIDADES),
});

export const hayFiltros = (f: Filtros): boolean => Boolean(f.q || f.operacion || f.estado || f.visibilidad);

export const listarParaAdmin = async ({ supabase, config }: SesionAdmin, f: Filtros): Promise<PropiedadAdmin[]> => {
  let consulta = supabase.from("propiedades").select(COLUMNAS_PROPIEDAD).order("actualizada_en", { ascending: false });
  consulta = f.visibilidad ? consulta.eq("visibilidad", f.visibilidad) : consulta.neq("visibilidad", "archivada");
  if (f.operacion) consulta = consulta.eq("operacion", f.operacion);
  if (f.estado) consulta = consulta.eq("estado", f.estado);
  if (f.q) {
    // Se quitan los caracteres con significado en el filtro de PostgREST (coma, paréntesis, comodines).
    const t = f.q.replace(/[,()%*\\]/g, " ").trim();
    if (t) consulta = consulta.or(`titulo.ilike.%${t}%,codigo.ilike.%${t}%,distrito.ilike.%${t}%`);
  }
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo leer el listado (${error.code ?? "sin código"})`);
  return ((data ?? []) as unknown as FilaPropiedad[]).map((fila) => filaAPropiedadAdmin(fila, config.url));
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const esUuid = (v: string): boolean => UUID.test(v);

export const obtenerParaAdmin = async ({ supabase, config }: SesionAdmin, id: string): Promise<PropiedadAdmin | null> => {
  if (!esUuid(id)) return null;
  const { data, error } = await supabase.from("propiedades").select(COLUMNAS_PROPIEDAD).eq("id", id).maybeSingle();
  if (error) throw new Error(`No se pudo leer la propiedad (${error.code ?? "sin código"})`);
  return data ? filaAPropiedadAdmin(data as unknown as FilaPropiedad, config.url) : null;
};
