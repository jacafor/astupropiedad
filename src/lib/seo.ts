import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/contact";
import { RUTAS } from "@/lib/rutas";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = `${BRAND_NAME} — boutique inmobiliaria en Lima`;

/**
 * Metadata completa de una ruta de `RUTAS`: title, description, canonical,
 * Open Graph y Twitter. Se repite openGraph/twitter (incluida la imagen) porque
 * Next reemplaza, no fusiona, esos objetos cuando una página define los suyos.
 */
export const rutaMetadata = (path: string): Metadata => {
  const ruta = RUTAS.find((r) => r.path === path);
  if (!ruta) throw new Error(`Ruta sin registrar en src/lib/rutas.ts: ${path}`);

  const esHome = path === "/";
  const titleCompleto = esHome ? ruta.title : `${ruta.title} | ${BRAND_NAME}`;

  return {
    // La home usa el título por defecto del layout; el resto pasa por title.template.
    ...(esHome ? {} : { title: ruta.title }),
    description: ruta.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: BRAND_NAME,
      title: titleCompleto,
      description: ruta.description,
      url: path,
      images: [{ url: "/opengraph-image", ...OG_SIZE, alt: OG_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title: titleCompleto,
      description: ruta.description,
      images: [{ url: "/twitter-image", alt: OG_ALT }],
    },
  };
};
