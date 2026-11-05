import { obtenerPorSlug } from "@/data/inventario";
import { SITE_URL } from "@/lib/contact";
import { generarFichaPdf, nombreArchivoPdf } from "@/lib/ficha-pdf/generar";

/**
 * Ficha en PDF de una propiedad publicada: `/propiedades/<slug>/ficha.pdf`. Mismos datos que la
 * ficha web (inventario en caché); una propiedad no publicada o inexistente → 404.
 */
export const GET = async (_request: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const p = await obtenerPorSlug(slug);
  if (!p) return new Response("Propiedad no encontrada", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const pdf = await generarFichaPdf(p, `${SITE_URL}/propiedades/${p.slug}`);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${nombreArchivoPdf(p)}"`,
      // 10 min en la CDN de Vercel: un cambio desde /admin tarda como máximo eso en verse aquí.
      "Cache-Control": "public, max-age=0, s-maxage=600",
      // Es una copia de la ficha web, que es la que debe indexarse.
      "X-Robots-Tag": "noindex",
    },
  });
};
