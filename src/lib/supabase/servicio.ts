import { createClient } from "@supabase/supabase-js";
import type { ConfigSupabase } from "./config";

/**
 * Clave secreta de Supabase (D-36): SOLO para gestionar cuentas de /admin/usuarios (crear,
 * contraseña temporal, suspender, quitar acceso) y escribir su registro. Salta la RLS, así que:
 * - vive solo en el servidor (`SUPABASE_SECRET_KEY`, nunca con prefijo NEXT_PUBLIC_);
 * - solo se usa después de `requerirAdministrador()` (src/lib/admin/sesion.ts);
 * - todo lo demás (catálogo, lecturas del panel) sigue con la clave publicable y la sesión.
 *
 * Sin la variable, /admin/usuarios muestra la lista pero no deja cambiar nada. Solo valen las
 * claves nuevas (`sb_secret_…`) o la `service_role` antigua (JWT): las e2e la apagan con otro valor.
 */
export const leerClaveSecreta = (): string | null => {
  const clave = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!clave || !(clave.startsWith("sb_secret_") || clave.startsWith("eyJ"))) return null;
  return clave;
};

export const clienteServicio = (config: ConfigSupabase) => {
  const clave = leerClaveSecreta();
  if (!clave) return null;
  return createClient(config.url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
};
