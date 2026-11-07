import type { CampoPropiedad } from "@/lib/catalogo/esquema";

/** Respuestas de las Server Actions de /admin (un archivo "use server" solo puede exportar funciones). */

export type ResultadoAccion = { ok: boolean; mensaje: string };

export type ResultadoFormulario = ResultadoAccion & {
  errores?: Partial<Record<CampoPropiedad, string>>;
};

export type ResultadoFoto = ResultadoAccion & { errores?: { foto?: string; alt?: string; limpia?: string } };

/** Crear un usuario o darle una contraseña temporal nueva: la clave viaja UNA vez y no se guarda. */
export type ResultadoClave = ResultadoAccion & {
  clave?: string;
  correo?: string;
  errores?: { correo?: string; rol?: string };
};

export type ResultadoCambioClave = ResultadoAccion & {
  errores?: { actual?: string; clave?: string; confirmacion?: string };
};

export type DireccionFoto = "arriba" | "abajo" | "portada";
