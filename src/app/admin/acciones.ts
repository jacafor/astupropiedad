"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requerirAdmin, type SesionAdmin } from "@/lib/admin/sesion";
import type { DireccionFoto, ResultadoAccion, ResultadoFormulario, ResultadoFoto } from "@/lib/admin/tipos";
import { esUuid, obtenerParaAdmin } from "@/lib/catalogo/admin";
import {
  ESTADOS,
  MAX_BYTES_FOTO,
  TIPOS_FOTO,
  VISIBILIDADES,
  aFila,
  erroresPorCampo,
  esquemaAlt,
  esquemaPropiedad,
  leerFormulario,
} from "@/lib/catalogo/esquema";
import { FotoInvalida, procesarFoto, reordenar } from "@/lib/catalogo/fotos";
import { ETIQUETA_CACHE_PROPIEDADES } from "@/data/inventario";
import { BUCKET_FOTOS, leerConfigSupabase } from "@/lib/supabase/config";
import { clienteConSesion } from "@/lib/supabase/servidor";

/**
 * Acciones de /admin (sesión 16). Cada una vuelve a comprobar el acceso (`requerirAdmin`) y la RLS
 * de Supabase repite el control en la base. Los registros llevan solo códigos de error: nunca
 * correos, contraseñas ni datos de propiedades.
 */

type ErrorPg = { code?: string; message?: string } | null;

const registrar = (accion: string, error: ErrorPg) =>
  console.error(`[admin] ${accion} falló (${error?.code ?? "sin código"})`);

/** Tras cualquier cambio: el sitio público vuelve a leer el inventario en la próxima visita. */
const actualizarSitio = () => {
  revalidateTag(ETIQUETA_CACHE_PROPIEDADES, { expire: 0 });
  revalidatePath("/", "layout");
};

const ERROR_GENERICO = "No se pudo guardar. Revisa tu conexión e inténtalo de nuevo; si sigue fallando, avísale a quien mantiene el sitio.";

// ───────────────────────── Ingreso ─────────────────────────

const esquemaIngreso = z.object({
  correo: z.email("Escribe un correo válido."),
  clave: z.string().min(1, "Escribe tu contraseña."),
});

export async function ingresar(_previo: ResultadoAccion | null, fd: FormData): Promise<ResultadoAccion> {
  const config = leerConfigSupabase();
  if (!config) return { ok: false, mensaje: "El administrador aún no está configurado (faltan las variables de Supabase)." };

  const datos = esquemaIngreso.safeParse({ correo: fd.get("correo"), clave: fd.get("clave") });
  if (!datos.success) return { ok: false, mensaje: datos.error.issues[0].message };

  const supabase = await clienteConSesion(config);
  const { error } = await supabase.auth.signInWithPassword({ email: datos.data.correo, password: datos.data.clave });
  if (error) {
    // Mismo mensaje para correo inexistente y contraseña errónea: no revela qué cuentas existen.
    return {
      ok: false,
      mensaje:
        error.status === 429
          ? "Demasiados intentos. Espera unos minutos y vuelve a intentarlo."
          : "Correo o contraseña incorrectos.",
    };
  }
  const { data: esAdmin } = await supabase.rpc("es_admin");
  if (esAdmin !== true) {
    await supabase.auth.signOut();
    return { ok: false, mensaje: "Esta cuenta no tiene acceso al administrador." };
  }
  redirect("/admin");
}

export async function salir(): Promise<void> {
  const config = leerConfigSupabase();
  if (config) await (await clienteConSesion(config)).auth.signOut();
  redirect("/admin/ingresar");
}

// ───────────────────────── Propiedad ─────────────────────────

const traducirErrorGuardado = (error: ErrorPg): ResultadoFormulario => {
  const texto = error?.message ?? "";
  if (error?.code === "23505" && texto.includes("codigo")) {
    return { ok: false, mensaje: "Revisa el formulario.", errores: { codigo: "Ya existe una propiedad con ese código." } };
  }
  if (error?.code === "23505" && texto.includes("slug")) {
    return { ok: false, mensaje: "Revisa el formulario.", errores: { slug: "Ya existe una propiedad con esa dirección web." } };
  }
  if (error?.code === "23514" && texto.includes("slug")) {
    return {
      ok: false,
      mensaje: "Revisa el formulario.",
      errores: { slug: "La dirección web no se puede cambiar después de publicar (rompería los enlaces)." },
    };
  }
  return { ok: false, mensaje: ERROR_GENERICO };
};

/** Crea (id = null) o actualiza una propiedad. Al crear, lleva a su pantalla de edición para subir fotos. */
export async function guardarPropiedad(
  id: string | null,
  _previo: ResultadoFormulario | null,
  fd: FormData
): Promise<ResultadoFormulario> {
  const sesion = await requerirAdmin();
  const entrada = leerFormulario(fd);
  // Al editar, el estado comercial no viaja en este formulario (lo cambia `cambiarEstado`): se valida
  // con un valor neutro y no se escribe, para no pisar un cambio hecho desde el panel "Publicación".
  if (id !== null) entrada.estado = "disponible";
  const datos = esquemaPropiedad.safeParse(entrada);
  if (!datos.success) {
    return { ok: false, mensaje: "Revisa los campos marcados.", errores: erroresPorCampo(datos.error) };
  }
  const fila: Partial<ReturnType<typeof aFila>> = aFila(datos.data);
  if (id !== null) delete fila.estado;

  if (id === null) {
    const { data, error } = await sesion.supabase.from("propiedades").insert(fila).select("id").single();
    if (error || !data) {
      registrar("crear propiedad", error);
      return traducirErrorGuardado(error);
    }
    actualizarSitio();
    redirect(`/admin/propiedades/${data.id}?creada=1`);
  }

  if (!esUuid(id)) return { ok: false, mensaje: "La propiedad no existe." };
  const { error } = await sesion.supabase.from("propiedades").update(fila).eq("id", id);
  if (error) {
    registrar("editar propiedad", error);
    return traducirErrorGuardado(error);
  }
  actualizarSitio();
  return { ok: true, mensaje: "Cambios guardados. El sitio público ya muestra la versión nueva." };
}

const cargar = async (sesion: SesionAdmin, id: string) => {
  const p = await obtenerParaAdmin(sesion, id);
  if (!p) throw new Error("La propiedad no existe");
  return p;
};

export async function cambiarEstado(id: string, estado: string): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin();
  const valor = z.enum(ESTADOS).safeParse(estado);
  if (!valor.success || !esUuid(id)) return { ok: false, mensaje: "Estado no válido." };
  const { error } = await sesion.supabase.from("propiedades").update({ estado: valor.data }).eq("id", id);
  if (error) {
    registrar("cambiar estado", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  actualizarSitio();
  return { ok: true, mensaje: "Estado actualizado." };
}

const MENSAJE_VISIBILIDAD = {
  publicada: "Publicada: ya aparece en el sitio.",
  borrador: "Pasó a borrador: ya no aparece en el sitio.",
  archivada: "Archivada: ya no aparece en el sitio. Puedes restaurarla cuando quieras.",
} as const;

export async function cambiarVisibilidad(id: string, visibilidad: string): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin();
  const valor = z.enum(VISIBILIDADES).safeParse(visibilidad);
  if (!valor.success || !esUuid(id)) return { ok: false, mensaje: "Opción no válida." };
  if (valor.data === "publicada") {
    const p = await cargar(sesion, id);
    if (p.fotos.length === 0) return { ok: false, mensaje: "Sube al menos una foto antes de publicar." };
  }
  const { error } = await sesion.supabase.from("propiedades").update({ visibilidad: valor.data }).eq("id", id);
  if (error) {
    registrar("cambiar visibilidad", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  actualizarSitio();
  return { ok: true, mensaje: MENSAJE_VISIBILIDAD[valor.data] };
}

// ───────────────────────── Fotos ─────────────────────────

export async function subirFoto(id: string, _previo: ResultadoFoto | null, fd: FormData): Promise<ResultadoFoto> {
  const sesion = await requerirAdmin();
  if (!esUuid(id)) return { ok: false, mensaje: "La propiedad no existe." };

  const archivo = fd.get("foto");
  const alt = esquemaAlt.safeParse(fd.get("alt") ?? "");
  const errores: NonNullable<ResultadoFoto["errores"]> = {};
  if (!(archivo instanceof File) || archivo.size === 0) errores.foto = "Elige una foto.";
  else if (archivo.size > MAX_BYTES_FOTO) errores.foto = "La foto pesa más de 4 MB. Redúcela antes de subirla.";
  else if (!(TIPOS_FOTO as readonly string[]).includes(archivo.type)) errores.foto = "Sube la foto en JPG, PNG o WebP.";
  if (!alt.success) errores.alt = alt.error.issues[0].message;
  if (fd.get("limpia") !== "on") errores.limpia = "Confirma que la foto no muestra teléfonos, precios ni marcas de agua.";
  if (Object.keys(errores).length > 0 || !(archivo instanceof File) || !alt.success) {
    return { ok: false, mensaje: "Revisa los campos marcados.", errores };
  }

  let foto: Awaited<ReturnType<typeof procesarFoto>>;
  try {
    foto = await procesarFoto(Buffer.from(await archivo.arrayBuffer()));
  } catch (e) {
    if (e instanceof FotoInvalida) return { ok: false, mensaje: e.message, errores: { foto: e.message } };
    throw e;
  }

  const propiedad = await cargar(sesion, id);
  const ruta = `${id}/${randomUUID()}.webp`;
  const almacen = sesion.supabase.storage.from(BUCKET_FOTOS);
  const { error: errorSubida } = await almacen.upload(ruta, foto.datos, {
    contentType: "image/webp",
    // La ruta es única por foto: se puede guardar en caché un año.
    cacheControl: "31536000",
    upsert: false,
  });
  if (errorSubida) {
    console.error(`[admin] subir foto falló (${errorSubida.name})`);
    return { ok: false, mensaje: "No se pudo subir la foto. Inténtalo de nuevo." };
  }

  const orden = propiedad.fotos.reduce((max, f) => Math.max(max, f.orden), 0) + 1;
  const { error } = await sesion.supabase
    .from("fotos_propiedad")
    .insert({ propiedad_id: id, ruta, alt: alt.data, orden, ancho: foto.ancho, alto: foto.alto });
  if (error) {
    registrar("registrar foto", error);
    await almacen.remove([ruta]);
    return { ok: false, mensaje: "No se pudo guardar la foto. Inténtalo de nuevo." };
  }
  actualizarSitio();
  return {
    ok: true,
    mensaje: propiedad.fotos.length === 0 ? "Foto subida. Es la portada de la propiedad." : "Foto subida al final de la galería.",
  };
}

export async function actualizarAlt(id: string, fotoId: string, alt: string): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin();
  const valor = esquemaAlt.safeParse(alt);
  if (!valor.success) return { ok: false, mensaje: valor.error.issues[0].message };
  if (!esUuid(id) || !esUuid(fotoId)) return { ok: false, mensaje: "La foto no existe." };
  const { error } = await sesion.supabase
    .from("fotos_propiedad")
    .update({ alt: valor.data })
    .eq("id", fotoId)
    .eq("propiedad_id", id);
  if (error) {
    registrar("editar texto de foto", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  actualizarSitio();
  return { ok: true, mensaje: "Descripción guardada." };
}

export async function moverFoto(id: string, fotoId: string, direccion: DireccionFoto): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin();
  if (!["arriba", "abajo", "portada"].includes(direccion) || !esUuid(id)) return { ok: false, mensaje: "Opción no válida." };
  const p = await cargar(sesion, id);
  const actual = p.fotos.map((f) => f.id);
  const nuevo = reordenar(actual, fotoId, direccion);
  if (nuevo === actual) return { ok: true, mensaje: "La foto ya está en esa posición." };
  const { error } = await sesion.supabase.rpc("ordenar_fotos", { p_propiedad: id, p_ids: nuevo });
  if (error) {
    registrar("ordenar fotos", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  actualizarSitio();
  return { ok: true, mensaje: direccion === "portada" ? "Nueva portada guardada." : "Orden guardado." };
}

export async function quitarFoto(id: string, fotoId: string): Promise<ResultadoAccion> {
  const sesion = await requerirAdmin();
  if (!esUuid(id)) return { ok: false, mensaje: "La propiedad no existe." };
  const p = await cargar(sesion, id);
  const foto = p.fotos.find((f) => f.id === fotoId);
  if (!foto) return { ok: false, mensaje: "La foto ya no existe." };
  if (p.visibilidad === "publicada" && p.fotos.length === 1) {
    return { ok: false, mensaje: "Una propiedad publicada necesita al menos una foto. Sube otra antes de quitar esta." };
  }
  const { error } = await sesion.supabase.from("fotos_propiedad").delete().eq("id", fotoId).eq("propiedad_id", id);
  if (error) {
    registrar("quitar foto", error);
    return { ok: false, mensaje: ERROR_GENERICO };
  }
  const { error: errorArchivo } = await sesion.supabase.storage.from(BUCKET_FOTOS).remove([foto.ruta]);
  // Si falla, queda un archivo huérfano en el bucket (no visible en el sitio); no se bloquea a quien administra.
  if (errorArchivo) console.error(`[admin] borrar archivo de foto falló (${errorArchivo.name})`);
  actualizarSitio();
  return { ok: true, mensaje: "Foto quitada." };
}
