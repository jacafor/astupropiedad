import { redirect } from "next/navigation";
import { leerConfigSupabase, type ConfigSupabase } from "@/lib/supabase/config";
import { clienteConSesion } from "@/lib/supabase/servidor";
import { esRol, type Rol } from "./roles";

type ClienteSesion = Awaited<ReturnType<typeof clienteConSesion>>;

export type SesionAdmin = {
  supabase: ClienteSesion;
  config: ConfigSupabase;
  correo: string;
  userId: string;
  rol: Rol;
  /** Entró con una contraseña temporal: debe cambiarla en /admin/cuenta antes de seguir. */
  debeCambiarClave: boolean;
};

export type Acceso = { rol: Rol; debeCambiarClave: boolean };

/**
 * Fila propia en `administradores` (la RLS solo deja ver la propia). Sin fila, suspendida o con un
 * rol desconocido → sin acceso. Equivale a `es_admin()` y además trae el rol.
 */
export const leerAcceso = async (supabase: ClienteSesion, userId: string): Promise<Acceso | null> => {
  const { data, error } = await supabase
    .from("administradores")
    .select("rol, suspendido_en, debe_cambiar_clave")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data || data.suspendido_en || !esRol(data.rol)) return null;
  return { rol: data.rol, debeCambiarClave: data.debe_cambiar_clave === true };
};

/**
 * Comprueba en el servidor que quien llama tiene sesión válida (`getUser` la verifica con Supabase,
 * no solo lee la cookie) y acceso activo (cualquier rol). El proxy solo redirige; esta es la
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
  const acceso = await leerAcceso(supabase, user.id);
  if (!acceso) return null;
  return { supabase, config, correo: user.email ?? "", userId: user.id, ...acceso };
};

/**
 * Para páginas y Server Actions de /admin: sin acceso, a la pantalla de ingreso. Con contraseña
 * temporal, a /admin/cuenta (salvo la propia página y acción de cambiar la contraseña).
 */
export const requerirAdmin = async ({ permitirClavePendiente = false } = {}): Promise<SesionAdmin> => {
  const sesion = await obtenerAdmin();
  if (!sesion) redirect("/admin/ingresar");
  if (sesion.debeCambiarClave && !permitirClavePendiente) redirect("/admin/cuenta");
  return sesion;
};

/** Solo el rol administrador (gestión de usuarios). Un editor vuelve a la lista de propiedades. */
export const requerirAdministrador = async (): Promise<SesionAdmin> => {
  const sesion = await requerirAdmin();
  if (sesion.rol !== "administrador") redirect("/admin");
  return sesion;
};
