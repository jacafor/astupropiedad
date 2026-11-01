/**
 * Lectura del inventario (solo servidor): el catálogo, la home, las fichas `/propiedades/[slug]` y
 * el sitemap leen de aquí. Los datos viven en Supabase y se editan en /admin (D-30). Tipos y
 * etiquetas en `./properties`.
 */
import { unstable_cache } from "next/cache";
import { COLUMNAS_PROPIEDAD, filasAPublicas, type FilaPropiedad } from "@/lib/catalogo/mapeo";
import { leerConfigSupabase } from "@/lib/supabase/config";
import { clientePublico } from "@/lib/supabase/servidor";
import type { Property } from "./properties";

/**
 * ⚠ EJEMPLO: dato ficticio solo para desarrollo y pruebas de la ficha.
 * Solo aparece si Supabase NO está configurado y además estamos en desarrollo (o con
 * MOSTRAR_EJEMPLO=1 para probar el build). Con base de datos nunca se mezcla con lo real.
 */
const EJEMPLO: Property = {
  id: "EJEMPLO-000",
  slug: "ejemplo-no-publicar",
  titulo: "EJEMPLO — Departamento de prueba (no es una propiedad real)",
  operacion: "venta",
  tipo: "departamento",
  distrito: "Distrito de ejemplo",
  precio: 100000,
  moneda: "USD",
  areaConstruidaM2: 80,
  dormitorios: 2,
  banos: 2,
  cocheras: 1,
  descripcion:
    "Ficha ficticia para comprobar el diseño de la página. Los datos, el precio y la foto no corresponden a ningún inmueble.",
  caracteristicas: ["Característica de ejemplo"],
  estado: "disponible",
  destacada: true,
  fotos: [{ url: "/imagenes/portada.jpg", alt: "Foto de ejemplo, no corresponde a una propiedad real" }],
};

/** Etiqueta de caché del inventario: /admin la invalida al guardar (`revalidateTag`). */
export const ETIQUETA_CACHE_PROPIEDADES = "propiedades";

/**
 * Lo publicado en Supabase, en caché (1 h y hasta que /admin guarde). Si Supabase falla se lanza el
 * error: Next sigue sirviendo la última versión buena de la página en lugar de un catálogo vacío.
 */
const publicadas = unstable_cache(
  async (): Promise<Property[]> => {
    const config = leerConfigSupabase();
    if (!config) return [];
    const { data, error } = await clientePublico(config)
      .from("propiedades")
      .select(COLUMNAS_PROPIEDAD)
      .eq("visibilidad", "publicada")
      .order("publicada_en", { ascending: false });
    if (error) throw new Error(`No se pudo leer el catálogo (${error.code ?? "sin código"})`);
    return filasAPublicas((data ?? []) as unknown as FilaPropiedad[], config.url);
  },
  ["inventario-publicado"],
  { tags: [ETIQUETA_CACHE_PROPIEDADES], revalidate: 3600 }
);

const mostrarEjemplo =
  process.env.NODE_ENV !== "production" || process.env.MOSTRAR_EJEMPLO === "1";

const visibles = async (): Promise<Property[]> => {
  if (leerConfigSupabase()) return publicadas();
  return mostrarEjemplo ? [EJEMPLO] : [];
};

/** Todas las propiedades publicadas (cualquier estado): se usan para generar las fichas y el sitemap. */
export const obtenerPropiedades = (): Promise<Property[]> => visibles();

/** Las que se muestran en el catálogo y la home: solo las disponibles. */
export const listarDisponibles = async (): Promise<Property[]> =>
  (await visibles()).filter((p) => p.estado === "disponible");

export const obtenerPorSlug = async (slug: string): Promise<Property | undefined> =>
  (await visibles()).find((p) => p.slug === slug);

/** Hasta `max` propiedades disponibles parecidas: mismo distrito primero, luego misma operación. */
export const similares = async (base: Property, max = 3): Promise<Property[]> => {
  const otras = (await listarDisponibles()).filter((p) => p.slug !== base.slug && p.operacion === base.operacion);
  const puntaje = (p: Property) => (p.distrito === base.distrito ? 2 : 0) + (p.tipo === base.tipo ? 1 : 0);
  return otras.sort((a, b) => puntaje(b) - puntaje(a)).slice(0, max);
};

