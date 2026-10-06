import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";
import { RUTAS } from "@/lib/rutas";

// Sin `lastModified`: no hay fecha real de edición por página y no se inventa.
const sitemap = (): MetadataRoute.Sitemap =>
  RUTAS.map(({ path, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    priority,
  }));

export default sitemap;
