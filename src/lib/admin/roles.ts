import { z } from "zod";

/**
 * Roles y reglas de los usuarios del administrador (D-36). Funciones puras, sin Supabase: las usan
 * las páginas, las Server Actions y las pruebas (roles.test.ts). La base repite las reglas que
 * importan (RLS, `es_admin()`, `es_administrador()` y el disparador del último administrador).
 */

export const ROLES = ["administrador", "editor"] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETA_ROL: Record<Rol, string> = { administrador: "Administrador", editor: "Editor" };

export const DESCRIPCION_ROL: Record<Rol, string> = {
  administrador: "Carga y edita propiedades, y da o quita acceso a otras personas.",
  editor: "Carga, edita, publica y archiva propiedades. No ve ni cambia usuarios.",
};

export const esRol = (valor: unknown): valor is Rol => typeof valor === "string" && (ROLES as readonly string[]).includes(valor);

export const puedeGestionarUsuarios = (rol: Rol) => rol === "administrador";

export type EstadoUsuario = "activo" | "invitado" | "suspendido";

export const ETIQUETA_ESTADO_USUARIO: Record<EstadoUsuario, string> = {
  activo: "Activo",
  invitado: "Contraseña temporal",
  suspendido: "Suspendido",
};

export type UsuarioPanel = {
  id: string;
  correo: string;
  rol: Rol;
  suspendidoEn: string | null;
  debeCambiarClave: boolean;
  creadoEn: string;
  creadoPor: string | null;
  ultimoIngreso: string | null;
};

/** Suspendido manda; si no, "invitado" mientras siga con la contraseña temporal. */
export const estadoUsuario = (u: Pick<UsuarioPanel, "suspendidoEn" | "debeCambiarClave">): EstadoUsuario =>
  u.suspendidoEn ? "suspendido" : u.debeCambiarClave ? "invitado" : "activo";

const esAdministradorActivo = (u: UsuarioPanel) => u.rol === "administrador" && !u.suspendidoEn;

export type AccionUsuario = "cambiar_rol" | "suspender" | "reactivar" | "restablecer_clave" | "quitar_acceso";

export const MENSAJE_ULTIMO_ADMINISTRADOR =
  "Debe quedar al menos un administrador activo. Da el rol de administrador a otra persona antes de hacer este cambio.";

/**
 * Motivo por el que `actorId` no puede hacer `accion` sobre `objetivo`, o `null` si puede.
 * - Nadie se cambia a sí mismo desde la lista (así nadie se quita el acceso por error); su
 *   contraseña la cambia en "Mi cuenta".
 * - Nunca puede quedar el sitio sin un administrador activo.
 */
export const motivoBloqueo = (
  accion: AccionUsuario,
  objetivo: UsuarioPanel,
  actorId: string,
  usuarios: readonly UsuarioPanel[],
  nuevoRol?: Rol
): string | null => {
  if (objetivo.id === actorId) {
    return accion === "restablecer_clave"
      ? "Tu propia contraseña se cambia en «Mi cuenta»."
      : "No puedes cambiar tu propia cuenta desde aquí. Pídeselo a otro administrador.";
  }
  if (accion === "cambiar_rol") {
    if (!nuevoRol) return "Elige un rol.";
    if (nuevoRol === objetivo.rol) return `Ya tiene el rol ${ETIQUETA_ROL[nuevoRol].toLowerCase()}.`;
  }
  if (accion === "suspender" && objetivo.suspendidoEn) return "Ese acceso ya está suspendido.";
  if (accion === "reactivar" && !objetivo.suspendidoEn) return "Ese acceso ya está activo.";

  const loQuitaComoAdministrador =
    accion === "suspender" || accion === "quitar_acceso" || (accion === "cambiar_rol" && nuevoRol !== "administrador");
  if (loQuitaComoAdministrador && esAdministradorActivo(objetivo)) {
    const otros = usuarios.filter((u) => u.id !== objetivo.id && esAdministradorActivo(u));
    if (otros.length === 0) return MENSAJE_ULTIMO_ADMINISTRADOR;
  }
  return null;
};

// ───────────────────────── Contraseñas ─────────────────────────

// Sin caracteres que se confunden al dictarlos o copiarlos a mano (0/O, 1/l/I).
const ALFABETO = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Contraseña temporal de 12 caracteres al azar en tres grupos ("abcD-3fgH-jk7M"), ≈ 70 bits.
 * Usa `crypto.getRandomValues` con rechazo para no sesgar la distribución.
 */
export const generarClaveTemporal = (aleatorio: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string => {
  const limite = 256 - (256 % ALFABETO.length);
  const letras: string[] = [];
  while (letras.length < 12) {
    for (const byte of aleatorio(24)) {
      if (byte < limite && letras.length < 12) letras.push(ALFABETO[byte % ALFABETO.length]);
    }
  }
  return [letras.slice(0, 4), letras.slice(4, 8), letras.slice(8, 12)].map((g) => g.join("")).join("-");
};

export const CLAVE_MINIMA = 10;

export const esquemaClaveNueva = z
  .object({
    clave: z
      .string()
      .min(CLAVE_MINIMA, `Usa al menos ${CLAVE_MINIMA} caracteres.`)
      // bcrypt (Supabase Auth) solo mira los primeros 72 bytes.
      .max(72, "Usa como máximo 72 caracteres."),
    confirmacion: z.string(),
  })
  .refine((d) => d.clave === d.confirmacion, { path: ["confirmacion"], message: "Las dos contraseñas no coinciden." });

export const esquemaNuevoUsuario = z.object({
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Escribe un correo válido.").max(254, "El correo es demasiado largo.")),
  rol: z.enum(ROLES, "Elige un rol."),
});
