import { urlFoto } from "@/lib/supabase/config";
import type { EstadoPropiedad, Operacion, Property, TipoInmueble } from "@/data/properties";
import type { Moneda } from "@/lib/finance";

/** Filas tal como las devuelve Supabase (supabase/migrations/20261031000000_catalogo_propiedades.sql). */
export type Visibilidad = "borrador" | "publicada" | "archivada";

export interface FilaFoto {
  id: string;
  propiedad_id: string;
  ruta: string;
  alt: string;
  orden: number;
  ancho: number;
  alto: number;
}

export interface FilaPropiedad {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  distrito: string;
  /** numeric de Postgres: llega como número o como texto según el tamaño. */
  precio: number | string;
  moneda: Moneda;
  area_construida_m2: number | string;
  area_total_m2: number | string | null;
  dormitorios: number;
  banos: number;
  cocheras: number;
  descripcion: string;
  caracteristicas: string[] | null;
  estado: EstadoPropiedad;
  destacada: boolean;
  visibilidad: Visibilidad;
  publicada_en: string | null;
  creada_en: string;
  actualizada_en: string;
  fotos_propiedad?: FilaFoto[] | null;
}

/** Columnas que se piden siempre (propiedad + fotos). */
export const COLUMNAS_PROPIEDAD = "*, fotos_propiedad(id, propiedad_id, ruta, alt, orden, ancho, alto)";

export interface FotoAdmin {
  id: string;
  ruta: string;
  url: string;
  alt: string;
  orden: number;
  ancho: number;
  alto: number;
}

/** Lo que ve /admin: la propiedad pública más lo interno. */
export interface PropiedadAdmin extends Omit<Property, "fotos"> {
  uuid: string;
  visibilidad: Visibilidad;
  publicadaEn: string | null;
  actualizadaEn: string;
  fotos: FotoAdmin[];
}

const numero = (v: number | string): number => (typeof v === "number" ? v : Number(v));

const ordenarFotos = (fotos: FilaFoto[] | null | undefined): FilaFoto[] =>
  [...(fotos ?? [])].sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));

export const filaAPropiedadAdmin = (fila: FilaPropiedad, urlProyecto: string): PropiedadAdmin => ({
  uuid: fila.id,
  id: fila.codigo,
  slug: fila.slug,
  titulo: fila.titulo,
  operacion: fila.operacion,
  tipo: fila.tipo,
  distrito: fila.distrito,
  precio: numero(fila.precio),
  moneda: fila.moneda,
  areaConstruidaM2: numero(fila.area_construida_m2),
  ...(fila.area_total_m2 === null ? {} : { areaTotalM2: numero(fila.area_total_m2) }),
  dormitorios: fila.dormitorios,
  banos: fila.banos,
  cocheras: fila.cocheras,
  descripcion: fila.descripcion,
  caracteristicas: fila.caracteristicas ?? [],
  estado: fila.estado,
  destacada: fila.destacada,
  visibilidad: fila.visibilidad,
  publicadaEn: fila.publicada_en,
  actualizadaEn: fila.actualizada_en,
  fotos: ordenarFotos(fila.fotos_propiedad).map((f) => ({
    id: f.id,
    ruta: f.ruta,
    url: urlFoto(urlProyecto, f.ruta),
    alt: f.alt,
    orden: f.orden,
    ancho: f.ancho,
    alto: f.alto,
  })),
});

/** La forma pública (`Property`) que usan catálogo, home, fichas y sitemap. */
export const aPropiedadPublica = (p: PropiedadAdmin): Property => ({
  id: p.id,
  slug: p.slug,
  titulo: p.titulo,
  operacion: p.operacion,
  tipo: p.tipo,
  distrito: p.distrito,
  precio: p.precio,
  moneda: p.moneda,
  areaConstruidaM2: p.areaConstruidaM2,
  ...(p.areaTotalM2 === undefined ? {} : { areaTotalM2: p.areaTotalM2 }),
  dormitorios: p.dormitorios,
  banos: p.banos,
  cocheras: p.cocheras,
  descripcion: p.descripcion,
  caracteristicas: p.caracteristicas,
  estado: p.estado,
  destacada: p.destacada,
  fotos: p.fotos.map(({ url, alt }) => ({ url, alt })),
});

/**
 * Filas publicadas → propiedades públicas. Descarta las que no tengan fotos (la ficha y la tarjeta
 * necesitan portada; /admin no deja publicar sin fotos, pero aquí no se confía en eso).
 */
export const filasAPublicas = (filas: FilaPropiedad[], urlProyecto: string): Property[] =>
  filas
    .filter((f) => f.visibilidad === "publicada")
    .map((f) => aPropiedadPublica(filaAPropiedadAdmin(f, urlProyecto)))
    .filter((p) => p.fotos.length > 0);
