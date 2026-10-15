import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";
import { RUTAS } from "@/lib/rutas";
import { obtenerPropiedades } from "@/data/properties";

// Sin `lastModified`: no hay fecha real de edición por página y no se inventa.
const sitemap = (): MetadataRoute.Sitemap => [
  ...RUTAS.map(({ path, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    priority,
  })),
  // Fichas de propiedad (las de ejemplo solo existen fuera de producción).
  ...obtenerPropiedades().map(({ slug }) => ({
    url: `${SITE_URL}/propiedades/${slug}`,
    priority: 0.7,
  })),
];

export default sitemap;
