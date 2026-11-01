import type { CampoPropiedad } from "@/lib/catalogo/esquema";

/** Respuestas de las Server Actions de /admin (un archivo "use server" solo puede exportar funciones). */

export type ResultadoAccion = { ok: boolean; mensaje: string };

export type ResultadoFormulario = ResultadoAccion & {
  errores?: Partial<Record<CampoPropiedad, string>>;
};

export type ResultadoFoto = ResultadoAccion & { errores?: { foto?: string; alt?: string; limpia?: string } };

export type DireccionFoto = "arriba" | "abajo" | "portada";
