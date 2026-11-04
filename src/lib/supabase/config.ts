/**
 * Configuración de Supabase (catálogo de propiedades, sesión 16). Solo la URL del proyecto y la
 * clave **publicable**: el sitio no usa la clave de servicio; los permisos los dan las políticas RLS
 * (supabase/migrations) y la sesión de quien administra.
 *
 * Sin estas variables el catálogo queda vacío (modo vacío honesto, D-20) y /admin avisa que falta
 * configurarlo. Una variable vacía o una URL que no sea https:// cuentan como ausentes.
 */
export type ConfigSupabase = { url: string; clave: string };

export const BUCKET_FOTOS = "propiedades";

export const leerConfigSupabase = (): ConfigSupabase | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  // Solo una URL https:// válida cuenta: las e2e apagan Supabase con un valor que no lo es.
  if (!url || !clave || !/^https:\/\/[^\s/]+/.test(url)) return null;
  return { url: url.replace(/\/+$/, ""), clave };
};

/** URL pública de una foto del bucket (el bucket es de lectura pública). */
export const urlFoto = (urlProyecto: string, ruta: string): string =>
  `${urlProyecto}/storage/v1/object/public/${BUCKET_FOTOS}/${ruta}`;
