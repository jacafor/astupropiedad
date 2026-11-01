import sharp from "sharp";
import type { DireccionFoto } from "@/lib/admin/tipos";

/** Lado mayor de la foto guardada: suficiente para la ficha a pantalla completa. */
export const LADO_MAXIMO = 2000;
const FORMATOS_ACEPTADOS = new Set(["jpeg", "png", "webp"]);

export class FotoInvalida extends Error {}

/**
 * Foto subida → WebP listo para el catálogo: respeta la orientación de la cámara, la reduce a
 * 2000 px de lado mayor sin agrandarla y la guarda sin metadatos (se van el EXIF y la ubicación GPS).
 * No detecta teléfonos ni precios incrustados: eso lo confirma quien la sube.
 */
export const procesarFoto = async (entrada: Buffer): Promise<{ datos: Buffer; ancho: number; alto: number }> => {
  let formato: string | undefined;
  try {
    // limitInputPixels evita imágenes gigantes hechas para agotar la memoria (≈ 50 MP).
    formato = (await sharp(entrada, { limitInputPixels: 50_000_000 }).metadata()).format;
  } catch {
    throw new FotoInvalida("El archivo no es una imagen válida o es demasiado grande.");
  }
  if (!formato || !FORMATOS_ACEPTADOS.has(formato)) {
    throw new FotoInvalida("Sube la foto en JPG, PNG o WebP.");
  }
  const { data, info } = await sharp(entrada, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { datos: data, ancho: info.width, alto: info.height };
};

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
