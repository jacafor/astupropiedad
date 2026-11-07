"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ETIQUETA_ROL,
  MENSAJE_ULTIMO_ADMINISTRADOR,
  esquemaClaveNueva,
  esquemaNuevoUsuario,
  generarClaveTemporal,
  motivoBloqueo,
  ROLES,
  type AccionUsuario,
  type Rol,
  type UsuarioPanel,
} from "@/lib/admin/roles";
import { requerirAdmin, requerirAdministrador, type SesionAdmin } from "@/lib/admin/sesion";
import type { ResultadoAccion, ResultadoCambioClave, ResultadoClave } from "@/lib/admin/tipos";
import { listarUsuarios, type AccionRegistrada } from "@/lib/admin/usuarios";
import { esUuid } from "@/lib/catalogo/admin";
import { clienteServicio } from "@/lib/supabase/servicio";
import { clientePublico } from "@/lib/supabase/servidor";

/**
 * Gestión de usuarios de /admin (D-35). Cada acción: `requerirAdministrador()` → comprueba las
 * reglas (roles.ts) con la lista actual → cambia la cuenta con la clave secreta → deja registro.
 * Los registros de consola llevan solo códigos de error: nunca correos ni contraseñas.
 */

type ClienteServicio = NonNullable<ReturnType<typeof clienteServicio>>;
type ErrorConCodigo = { code?: string; hint?: string; status?: number; message?: string } | null;

const registrar = (accion: string, error: ErrorConCodigo) =>
  console.error(`[admin/usuarios] ${accion} falló (${error?.code ?? error?.status ?? "sin código"})`);

const SIN_CLAVE: ResultadoAccion = {
  ok: false,
  mensaje: "Falta configurar SUPABASE_SECRET_KEY en el servidor: por ahora no se pueden cambiar usuarios.",
};

const ERROR_GENERICO = "No se pudo guardar el cambio. Inténtalo de nuevo; si sigue fallando, avísale a quien mantiene el sitio.";

const esUltimoAdministrador = (error: ErrorConCodigo) => error?.hint === "ultimo_administrador";

const revalidar = () => revalidatePath("/admin/usuarios");

const auditar = async (
  servicio: ClienteServicio,
  sesion: SesionAdmin,
  accion: AccionRegistrada,
  objetivoCorreo: string,
  detalle?: string
) => {
  const { error } = await servicio.from("auditoria_usuarios").insert({
    actor_id: sesion.userId,
    actor_correo: sesion.correo,
    accion,
    objetivo_correo: objetivoCorreo,
    detalle: detalle ?? null,
  });
  // El cambio ya se hizo: un fallo del registro no lo deshace, solo queda en los registros del servidor.
  if (error) registrar("registrar cambio", error);
};

type Contexto = { sesion: SesionAdmin; servicio: ClienteServicio; usuarios: UsuarioPanel[] };

const preparar = async (): Promise<Contexto | ResultadoAccion> => {
  const sesion = await requerirAdministrador();
  const servicio = clienteServicio(sesion.config);
  if (!servicio) return SIN_CLAVE;
  return { sesion, servicio, usuarios: await listarUsuarios(sesion) };
};

/** Prepara y comprueba que la acción esté permitida sobre ese usuario. */
const prepararSobre = async (
  id: string,
  accion: AccionUsuario,
  nuevoRol?: Rol
): Promise<(Contexto & { objetivo: UsuarioPanel }) | ResultadoAccion> => {
  if (!esUuid(id)) return { ok: false, mensaje: "Ese usuario no existe." };
  const ctx = await preparar();
  if ("ok" in ctx) return ctx;
  const objetivo = ctx.usuarios.find((u) => u.id === id);
  if (!objetivo) return { ok: false, mensaje: "Ese usuario ya no tiene acceso. Recarga la página." };
  const motivo = motivoBloqueo(accion, objetivo, ctx.sesion.userId, ctx.usuarios, nuevoRol);
  if (motivo) return { ok: false, mensaje: motivo };
  return { ...ctx, objetivo };
};

// ───────────────────────── Crear ─────────────────────────

/** Busca una cuenta de Auth por correo (cuentas creadas a mano en el panel de Supabase, sin acceso). */
const buscarCuenta = async (servicio: ClienteServicio, correo: string): Promise<string | null> => {
  for (let pagina = 1; pagina <= 10; pagina++) {
    const { data, error } = await servicio.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (error) {
      registrar("buscar cuenta", error);
      return null;
    }
    const encontrada = data.users.find((u) => u.email?.toLowerCase() === correo);
    if (encontrada) return encontrada.id;
    if (data.users.length < 1000) return null;
  }
  return null;
};

export async function crearUsuario(_previo: ResultadoClave | null, fd: FormData): Promise<ResultadoClave> {
  // Primero el permiso: quien no es administrador no llega ni a la validación.
  const ctx = await preparar();
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, usuarios } = ctx;

  const datos = esquemaNuevoUsuario.safeParse({ correo: fd.get("correo") ?? "", rol: fd.get("rol") ?? "" });
  if (!datos.success) {
    const errores: NonNullable<ResultadoClave["errores"]> = {};
    for (const issue of datos.error.issues) {
      const campo = issue.path[0];
      if ((campo === "correo" || campo === "rol") && !errores[campo]) errores[campo] = issue.message;
    }
    return { ok: false, mensaje: "Revisa los campos marcados.", errores };
  }
  const { correo, rol } = datos.data;
  if (usuarios.some((u) => u.correo.toLowerCase() === correo)) {
    return { ok: false, mensaje: "Revisa los campos marcados.", errores: { correo: "Esa persona ya tiene acceso: búscala en la lista." } };
  }

  const clave = generarClaveTemporal();
  let userId: string;
  let creada = false;
  const { data, error } = await servicio.auth.admin.createUser({ email: correo, password: clave, email_confirm: true });
  if (data.user) {
    userId = data.user.id;
    creada = true;
  } else if (error?.code === "email_exists") {
    // Ya había una cuenta sin acceso (p. ej. creada a mano antes): se le da acceso con clave nueva.
    const existente = await buscarCuenta(servicio, correo);
    if (!existente) return { ok: false, mensaje: ERROR_GENERICO };
    const { error: errorClave } = await servicio.auth.admin.updateUserById(existente, { password: clave, ban_duration: "none" });
    if (errorClave) {
      registrar("clave de cuenta existente", errorClave);
      return { ok: false, mensaje: ERROR_GENERICO };
    }
    userId = existente;
  } else {
    registrar("crear cuenta", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }

  const { error: errorFila } = await servicio
    .from("administradores")
    .insert({ user_id: userId, correo, rol, debe_cambiar_clave: true, creado_por: sesion.correo });
  if (errorFila) {
    registrar("dar acceso", errorFila);
    // Sin fila no hay acceso; no se deja una cuenta suelta que acabamos de crear.
    if (creada) await servicio.auth.admin.deleteUser(userId);
    return { ok: false, mensaje: ERROR_GENERICO };
  }

  await auditar(servicio, sesion, "crear", correo, `rol: ${ETIQUETA_ROL[rol].toLowerCase()}`);
  revalidar();
  return {
    ok: true,
    mensaje: `Listo: ${correo} ya tiene acceso como ${ETIQUETA_ROL[rol].toLowerCase()}.`,
    correo,
    clave,
  };
}

// ───────────────────────── Rol ─────────────────────────

export async function cambiarRol(id: string, rol: string): Promise<ResultadoAccion> {
  const valor = z.enum(ROLES).safeParse(rol);
  if (!valor.success) return { ok: false, mensaje: "Rol no válido." };
  const ctx = await prepararSobre(id, "cambiar_rol", valor.data);
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, objetivo } = ctx;

  const { error } = await servicio.from("administradores").update({ rol: valor.data }).eq("user_id", id);
  if (error) {
    registrar("cambiar rol", error);
    return { ok: false, mensaje: esUltimoAdministrador(error) ? MENSAJE_ULTIMO_ADMINISTRADOR : ERROR_GENERICO };
  }
  await auditar(servicio, sesion, "cambiar_rol", objetivo.correo, `${objetivo.rol} → ${valor.data}`);
  revalidar();
  return { ok: true, mensaje: `${objetivo.correo} ahora es ${ETIQUETA_ROL[valor.data].toLowerCase()}.` };
}

// ───────────────────────── Suspender / reactivar ─────────────────────────

// Unos 100 años: Supabase Auth no tiene "para siempre"; se levanta con "none".
const BLOQUEO_INDEFINIDO = "876000h";

export async function suspenderUsuario(id: string): Promise<ResultadoAccion> {
  const ctx = await prepararSobre(id, "suspender");
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, objetivo } = ctx;

  // Primero la fila: desde ese momento `es_admin()` ya le niega el catálogo, aunque tenga sesión abierta.
  const { error } = await servicio.from("administradores").update({ suspendido_en: new Date().toISOString() }).eq("user_id", id);
  if (error) {
    registrar("suspender", error);
    return { ok: false, mensaje: esUltimoAdministrador(error) ? MENSAJE_ULTIMO_ADMINISTRADOR : ERROR_GENERICO };
  }
  // Y además no puede volver a ingresar ni renovar su sesión.
  const { error: errorAuth } = await servicio.auth.admin.updateUserById(id, { ban_duration: BLOQUEO_INDEFINIDO });
  if (errorAuth) registrar("bloquear en Auth", errorAuth);

  await auditar(servicio, sesion, "suspender", objetivo.correo);
  revalidar();
  return { ok: true, mensaje: `${objetivo.correo} quedó suspendido: ya no puede entrar. Puedes reactivarlo cuando quieras.` };
}

export async function reactivarUsuario(id: string): Promise<ResultadoAccion> {
  const ctx = await prepararSobre(id, "reactivar");
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, objetivo } = ctx;

  const { error: errorAuth } = await servicio.auth.admin.updateUserById(id, { ban_duration: "none" });
  if (errorAuth) {
    registrar("desbloquear en Auth", errorAuth);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  const { error } = await servicio.from("administradores").update({ suspendido_en: null }).eq("user_id", id);
  if (error) {
    registrar("reactivar", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  await auditar(servicio, sesion, "reactivar", objetivo.correo);
  revalidar();
  return { ok: true, mensaje: `${objetivo.correo} puede volver a entrar.` };
}

// ───────────────────────── Contraseña temporal ─────────────────────────

export async function restablecerClave(id: string): Promise<ResultadoClave> {
  const ctx = await prepararSobre(id, "restablecer_clave");
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, objetivo } = ctx;

  const clave = generarClaveTemporal();
  const { error: errorAuth } = await servicio.auth.admin.updateUserById(id, { password: clave });
  if (errorAuth) {
    registrar("restablecer clave", errorAuth);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  // Al entrar con ella tendrá que elegir una propia (y si tenía una sesión abierta, también).
  const { error } = await servicio.from("administradores").update({ debe_cambiar_clave: true }).eq("user_id", id);
  if (error) registrar("marcar clave temporal", error);

  await auditar(servicio, sesion, "restablecer_clave", objetivo.correo);
  revalidar();
  return {
    ok: true,
    mensaje: `Nueva contraseña temporal para ${objetivo.correo}. La anterior ya no sirve.`,
    correo: objetivo.correo,
    clave,
  };
}

// ───────────────────────── Quitar acceso ─────────────────────────

export async function quitarAcceso(id: string): Promise<ResultadoAccion> {
  const ctx = await prepararSobre(id, "quitar_acceso");
  if ("ok" in ctx) return ctx;
  const { sesion, servicio, objetivo } = ctx;

  // Se borra la cuenta de Auth (y en cascada su fila): el correo queda libre por si vuelve más adelante.
  const { error } = await servicio.auth.admin.deleteUser(id);
  if (error) {
    registrar("quitar acceso", error);
    const ultimo = error.message?.includes("administrador activo");
    return { ok: false, mensaje: ultimo ? MENSAJE_ULTIMO_ADMINISTRADOR : ERROR_GENERICO };
  }
  await auditar(servicio, sesion, "quitar_acceso", objetivo.correo, `era ${objetivo.rol}`);
  // Sin revalidar a propósito: la fila se queda con la confirmación; al recargar ya no aparece.
  return { ok: true, mensaje: `${objetivo.correo} ya no tiene acceso al administrador.` };
}

// ───────────────────────── Mi cuenta ─────────────────────────

const MENSAJE_ERROR_CLAVE: Record<string, string> = {
  same_password: "La nueva contraseña debe ser distinta de la actual.",
  weak_password: "Esa contraseña es demasiado fácil de adivinar. Prueba con una más larga.",
};

/** Cambiar la propia contraseña. Con contraseña temporal no pide la actual (acaba de usarla para entrar). */
export async function cambiarMiClave(_previo: ResultadoCambioClave | null, fd: FormData): Promise<ResultadoCambioClave> {
  const sesion = await requerirAdmin({ permitirClavePendiente: true });
  const datos = esquemaClaveNueva.safeParse({ clave: fd.get("clave") ?? "", confirmacion: fd.get("confirmacion") ?? "" });
  const errores: NonNullable<ResultadoCambioClave["errores"]> = {};
  if (!datos.success) {
    for (const issue of datos.error.issues) {
      const campo = issue.path[0];
      if ((campo === "clave" || campo === "confirmacion") && !errores[campo]) errores[campo] = issue.message;
    }
  }
  const actual = String(fd.get("actual") ?? "");
  if (!sesion.debeCambiarClave && !actual) errores.actual = "Escribe tu contraseña actual.";
  if (Object.keys(errores).length > 0 || !datos.success) return { ok: false, mensaje: "Revisa los campos marcados.", errores };

  if (!sesion.debeCambiarClave) {
    // Se comprueba con un cliente aparte, sin tocar las cookies de la sesión.
    const { error } = await clientePublico(sesion.config).auth.signInWithPassword({ email: sesion.correo, password: actual });
    if (error) {
      return {
        ok: false,
        mensaje: "Revisa los campos marcados.",
        errores: { actual: error.status === 429 ? "Demasiados intentos. Espera unos minutos." : "La contraseña actual no es correcta." },
      };
    }
  }

  const { error } = await sesion.supabase.auth.updateUser({ password: datos.data.clave });
  if (error) {
    registrar("cambiar mi clave", error);
    const conocido = error.code ? MENSAJE_ERROR_CLAVE[error.code] : undefined;
    return conocido
      ? { ok: false, mensaje: "Revisa los campos marcados.", errores: { clave: conocido } }
      : { ok: false, mensaje: ERROR_GENERICO };
  }

  if (sesion.debeCambiarClave) {
    const { error: errorMarca } = await sesion.supabase.rpc("clave_cambiada");
    if (errorMarca) {
      registrar("marcar clave cambiada", errorMarca);
      return { ok: false, mensaje: ERROR_GENERICO };
    }
    redirect("/admin?bienvenida=1");
  }
  return { ok: true, mensaje: "Contraseña cambiada. Úsala la próxima vez que ingreses." };
}
