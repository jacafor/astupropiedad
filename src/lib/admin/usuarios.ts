import { esRol, type UsuarioPanel } from "./roles";
import type { SesionAdmin } from "./sesion";

/** Lecturas de /admin/usuarios con la sesión de quien administra (la base exige `es_administrador()`). */

type FilaUsuario = {
  user_id: string;
  correo: string;
  rol: string;
  suspendido_en: string | null;
  debe_cambiar_clave: boolean;
  creado_en: string;
  creado_por: string | null;
  ultimo_ingreso: string | null;
};

export const listarUsuarios = async (sesion: SesionAdmin): Promise<UsuarioPanel[]> => {
  const { data, error } = await sesion.supabase.rpc("listar_usuarios");
  if (error) throw new Error(`No se pudo leer la lista de usuarios (${error.code ?? "sin código"})`);
  return ((data ?? []) as FilaUsuario[])
    .filter((f) => esRol(f.rol))
    .map((f) => ({
      id: f.user_id,
      correo: f.correo,
      rol: f.rol as UsuarioPanel["rol"],
      suspendidoEn: f.suspendido_en,
      debeCambiarClave: f.debe_cambiar_clave,
      creadoEn: f.creado_en,
      creadoPor: f.creado_por,
      ultimoIngreso: f.ultimo_ingreso,
    }));
};

export type AccionRegistrada = "crear" | "cambiar_rol" | "suspender" | "reactivar" | "restablecer_clave" | "quitar_acceso";

export const ETIQUETA_ACCION: Record<AccionRegistrada, string> = {
  crear: "Dio acceso a",
  cambiar_rol: "Cambió el rol de",
  suspender: "Suspendió a",
  reactivar: "Reactivó a",
  restablecer_clave: "Generó contraseña temporal para",
  quitar_acceso: "Quitó el acceso a",
};

export type EntradaRegistro = {
  id: number;
  creadoEn: string;
  actorCorreo: string;
  accion: AccionRegistrada;
  objetivoCorreo: string;
  detalle: string | null;
};

export const leerRegistro = async (sesion: SesionAdmin, limite = 30): Promise<EntradaRegistro[]> => {
  const { data, error } = await sesion.supabase
    .from("auditoria_usuarios")
    .select("id, creado_en, actor_correo, accion, objetivo_correo, detalle")
    .order("creado_en", { ascending: false })
    .limit(limite);
  if (error) throw new Error(`No se pudo leer el registro de cambios (${error.code ?? "sin código"})`);
  return (data ?? []).map((f) => ({
    id: f.id as number,
    creadoEn: f.creado_en as string,
    actorCorreo: f.actor_correo as string,
    accion: f.accion as AccionRegistrada,
    objetivoCorreo: f.objetivo_correo as string,
    detalle: (f.detalle as string | null) ?? null,
  }));
};
