import { redirect } from "next/navigation";
import { leerConfigSupabase, type ConfigSupabase } from "@/lib/supabase/config";
import { clienteConSesion } from "@/lib/supabase/servidor";

export type SesionAdmin = {
  supabase: Awaited<ReturnType<typeof clienteConSesion>>;
  config: ConfigSupabase;
  correo: string;
};

/**
 * Comprueba en el servidor que quien llama tiene sesión válida (`getUser` la verifica con Supabase,
 * no solo lee la cookie) y que está en `administradores`. El proxy solo redirige; esta es la
 * comprobación que manda, y se repite en cada página y en cada Server Action de /admin.
 */
export const obtenerAdmin = async (): Promise<SesionAdmin | null> => {
  const config = leerConfigSupabase();
  if (!config) return null;
  const supabase = await clienteConSesion(config);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: esAdmin, error } = await supabase.rpc("es_admin");
  if (error || esAdmin !== true) return null;
  return { supabase, config, correo: user.email ?? "" };
};

/** Para páginas y Server Actions de /admin: sin acceso, a la pantalla de ingreso. */
export const requerirAdmin = async (): Promise<SesionAdmin> => {
  const sesion = await obtenerAdmin();
  if (!sesion) redirect("/admin/ingresar");
  return sesion;
};
