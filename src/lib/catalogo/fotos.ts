import sharp from "sharp";
import type { DireccionFoto } from "@/lib/admin/tipos";
import { LADO_MAXIMO_FOTO } from "./esquema";

export const LADO_MAXIMO = LADO_MAXIMO_FOTO;
const FORMATOS_ACEPTADOS = new Set(["jpeg", "png", "webp"]);

export class FotoInvalida extends Error {}

// limitInputPixels evita imágenes gigantes hechas para agotar la memoria (≈ 50 MP).
// failOn "error": muchos celulares (p. ej. Samsung) guardan JPG con avisos menores del decodificador
// ("Corrupt JPEG data: extraneous bytes…", "Invalid SOS parameters…") que se ven perfectos. Con el
// valor por defecto ("warning") sharp los rechaza; así se aceptan y solo se rechazan errores reales
// (incluidas las fotos cortadas a medio subir).
const OPCIONES_ENTRADA = { limitInputPixels: 50_000_000, failOn: "error" } as const;

/**
 * Foto subida → WebP listo para el catálogo: respeta la orientación de la cámara, la reduce a
 * 2000 px de lado mayor sin agrandarla y la guarda sin metadatos (se van el EXIF y la ubicación GPS).
 * No detecta teléfonos ni precios incrustados: eso lo confirma quien la sube.
 */
export const procesarFoto = async (entrada: Buffer): Promise<{ datos: Buffer; ancho: number; alto: number }> => {
  let formato: string | undefined;
  try {
    formato = (await sharp(entrada, OPCIONES_ENTRADA).metadata()).format;
  } catch {
    throw new FotoInvalida("El archivo no es una imagen válida o es demasiado grande.");
  }
  if (!formato || !FORMATOS_ACEPTADOS.has(formato)) {
    throw new FotoInvalida("Sube la foto en JPG, PNG o WebP.");
  }
  try {
    const { data, info } = await sharp(entrada, OPCIONES_ENTRADA)
      .rotate()
      .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { datos: data, ancho: info.width, alto: info.height };
  } catch {
    // La cabecera se leyó pero la imagen está dañada (p. ej. cortada): mensaje claro, no un error 500.
    throw new FotoInvalida("No se pudo leer la foto completa. Puede estar dañada: ábrela, guárdala de nuevo y vuelve a subirla.");
  }
};

/** `nuevo` tiene exactamente las mismas fotos que `actual`, sin repetir ni faltar ninguna (solo cambia el orden). */
export const esPermutacion = (actual: string[], nuevo: string[]): boolean =>
  nuevo.length === actual.length && new Set(nuevo).size === nuevo.length && nuevo.every((id) => actual.includes(id));

/** Nuevo orden de las fotos al mover una (la primera es la portada). Si no se puede mover, devuelve el mismo. */
export const reordenar = (ids: string[], id: string, direccion: DireccionFoto): string[] => {
  const i = ids.indexOf(id);
  if (i === -1) return ids;
  const destino = direccion === "portada" ? 0 : direccion === "arriba" ? i - 1 : i + 1;
  if (destino < 0 || destino >= ids.length || destino === i) return ids;
  const copia = ids.filter((x) => x !== id);
  copia.splice(destino, 0, id);
  return copia;
};
