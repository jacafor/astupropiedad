// Reducción de fotos en el navegador antes de subirlas a /admin (seguro en cliente: sin sharp).
// Las fotos de celular suelen pesar 4-8 MB y Vercel no acepta envíos de más de 4,5 MB; redibujarlas
// a 2000 px de lado mayor las deja en 0,3-1,5 MB sin pérdida visible. El servidor las procesa igual.

/** Medidas para que el lado mayor no pase de `maximo`, sin agrandar y sin deformar. */
export const medidasReducidas = (ancho: number, alto: number, maximo: number): { ancho: number; alto: number } => {
  const mayor = Math.max(ancho, alto);
  if (mayor <= maximo) return { ancho, alto };
  const escala = maximo / mayor;
  return { ancho: Math.max(1, Math.round(ancho * escala)), alto: Math.max(1, Math.round(alto * escala)) };
};

/** Nombre del archivo reducido: mismo nombre con extensión .jpg. */
export const nombreJpg = (nombre: string): string => `${nombre.replace(/\.[^./\\]+$/, "") || "foto"}.jpg`;

export class FotoIlegible extends Error {}

const aBlob = (lienzo: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, "image/jpeg", calidad));

/**
 * Si `archivo` pesa más de `limite`, lo redibuja como JPG con el lado mayor en `ladoMaximo`
 * (aplica la orientación de la cámara; el lienzo no copia EXIF ni GPS). Si ya cabe, lo devuelve tal cual.
 */
export const reducirSiPesa = async (archivo: File, limite: number, ladoMaximo: number): Promise<File> => {
  if (archivo.size <= limite) return archivo;
  let imagen: ImageBitmap;
  try {
    imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw new FotoIlegible("No se pudo leer la foto en este navegador. Súbela en JPG o PNG.");
  }
  const { ancho, alto } = medidasReducidas(imagen.width, imagen.height, ladoMaximo);
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new FotoIlegible("No se pudo reducir la foto en este navegador. Redúcela antes de subirla.");
  ctx.fillStyle = "#ffffff"; // fondo para PNG con transparencia (el JPG no la admite)
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(imagen, 0, 0, ancho, alto);
  imagen.close();
  for (const calidad of [0.9, 0.8, 0.7]) {
    const blob = await aBlob(lienzo, calidad);
    if (blob && blob.size <= limite) return new File([blob], nombreJpg(archivo.name), { type: "image/jpeg" });
  }
  throw new FotoIlegible("La foto sigue pesando más de 4 MB después de reducirla. Prueba con otra.");
};
