import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ConfigSupabase } from "./config";

/**
 * Cliente SIN sesión para leer lo publicado (catálogo, home, fichas, sitemap). No toca cookies,
 * así que puede ir dentro de `unstable_cache` y en páginas estáticas.
 */
export const clientePublico = (config: ConfigSupabase) =>
  createClient(config.url, config.clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

/** Cliente CON la sesión de quien administra (cookies). Solo en /admin y sus Server Actions. */
export const clienteConSesion = async (config: ConfigSupabase) => {
  const almacen = await cookies();
  return createServerClient(config.url, config.clave, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (porGuardar) => {
        try {
          porGuardar.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: no puede escribir cookies. El proxy (src/proxy.ts)
          // ya refresca la sesión en cada petición a /admin.
        }
      },
    },
  });
};
