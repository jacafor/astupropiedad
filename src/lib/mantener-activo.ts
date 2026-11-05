/**
 * Consulta diaria para que Supabase no pause los proyectos gratuitos (se pausan tras 7 días con
 * poca actividad; P-16). La dispara el cron de Vercel (`vercel.json`) sobre `/api/mantener-activo`.
 * Hace una lectura mínima con la clave publicable (RLS: solo lo publicado), sin escribir nada.
 */
import { leerConfigSupabase, type ConfigSupabase } from "@/lib/supabase/config";

export type ProyectoPing = ConfigSupabase & { nombre: string };
export type ResultadoPing = { nombre: string; ok: boolean; estado: number | null };

const URL_VALIDA = /^https:\/\/[^\s/]+/;

/** El proyecto del despliegue y, si están las variables, el de pruebas (lo usan los previews y las e2e). */
export const proyectosAPing = (env: Record<string, string | undefined> = process.env): ProyectoPing[] => {
  const proyectos: ProyectoPing[] = [];
  const sitio = leerConfigSupabase();
  if (sitio) proyectos.push({ nombre: "sitio", ...sitio });
  const url = env.SUPABASE_PRUEBAS_URL?.trim();
  const clave = env.SUPABASE_PRUEBAS_PUBLISHABLE_KEY?.trim();
  if (url && clave && URL_VALIDA.test(url) && url.replace(/\/+$/, "") !== sitio?.url) {
    proyectos.push({ nombre: "pruebas", url: url.replace(/\/+$/, ""), clave });
  }
  return proyectos;
};

export const pingProyecto = async (p: ProyectoPing, hacerFetch: typeof fetch = fetch): Promise<ResultadoPing> => {
  try {
    const r = await hacerFetch(`${p.url}/rest/v1/propiedades?select=id&limit=1`, {
      headers: { apikey: p.clave, Authorization: `Bearer ${p.clave}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    return { nombre: p.nombre, ok: r.ok, estado: r.status };
  } catch {
    return { nombre: p.nombre, ok: false, estado: null };
  }
};

/** Vercel manda `Authorization: Bearer <CRON_SECRET>`. Sin secreto configurado, nadie pasa. */
export const autorizado = (cabecera: string | null, secreto: string | undefined): boolean =>
  Boolean(secreto) && cabecera === `Bearer ${secreto}`;
