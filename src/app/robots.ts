import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

const robots = (): MetadataRoute.Robots => ({
  // /admin no se bloquea aquí a propósito: lleva `noindex` (metadata y X-Robots-Tag) y un
  // `disallow` impediría que los buscadores lo lean.
  rules: { userAgent: "*", allow: "/" },
  sitemap: `${SITE_URL}/sitemap.xml`,
});

export default robots;
