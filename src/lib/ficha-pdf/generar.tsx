import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";
import type { Property } from "@/data/properties";
import FichaPdf, { type FotoPdf } from "./FichaPdf";

/** Portada + 3 miniaturas: lo que cabe en la primera página sin achicar el texto. */
export const MAX_FOTOS_PDF = 4;
const ANCHO_FOTO_PDF = 1200;
const TIEMPO_MAXIMO_FOTO_MS = 8000;

const leerPublico = (ruta: string) => readFile(path.join(process.cwd(), "public", ruta.replace(/^\/+/, "")));

/** Bytes de la foto: las de Supabase por HTTP; las de /public (ficha de ejemplo) del disco. */
const descargar = async (url: string): Promise<Buffer> => {
  if (url.startsWith("/")) return leerPublico(url);
  const r = await fetch(url, { signal: AbortSignal.timeout(TIEMPO_MAXIMO_FOTO_MS) });
  if (!r.ok) throw new Error(`Foto no disponible (${r.status})`);
  return Buffer.from(await r.arrayBuffer());
};

/** WebP/PNG/JPG → JPG de 1200 px (react-pdf no admite WebP y así el PDF pesa poco). */
const aJpg = (datos: Buffer) =>
  sharp(datos, { failOn: "error" })
    .rotate()
    .resize({ width: ANCHO_FOTO_PDF, height: ANCHO_FOTO_PDF, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 80 })
    .toBuffer();

/** Las primeras fotos ya convertidas. Una foto que falla se omite: la ficha sale igual. */
export const fotosParaPdf = async (p: Property): Promise<FotoPdf[]> => {
  const resultados = await Promise.allSettled(
    p.fotos.slice(0, MAX_FOTOS_PDF).map(async (f) => ({ datos: await aJpg(await descargar(f.url)), alt: f.alt }))
  );
  return resultados.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
};

export const fechaLima = (fecha: Date): string =>
  new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" }).format(fecha);

/** Nombre del archivo descargado: "ficha-prueba-1.pdf". */
export const nombreArchivoPdf = (p: Property): string =>
  `ficha-${p.id.toLowerCase().replace(/[^a-z0-9-]+/g, "-")}.pdf`;

export const generarFichaPdf = async (p: Property, url: string, fotos?: FotoPdf[]): Promise<Buffer> => {
  const [logo, listas] = await Promise.all([leerPublico("imagenes/logo-as-tupropiedad.png"), fotos ?? fotosParaPdf(p)]);
  return renderToBuffer(<FichaPdf propiedad={p} fotos={listas} logo={logo} url={url} fecha={fechaLima(new Date())} />);
};
