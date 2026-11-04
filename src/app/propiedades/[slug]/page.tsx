import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FichaPropiedad from "@/components/FichaPropiedad";
import { BRAND_NAME } from "@/lib/contact";
import { precioTexto } from "@/lib/propiedades";
import { obtenerPorSlug, obtenerPropiedades, similares } from "@/data/inventario";
import { ETIQUETA_TIPO, type Property } from "@/data/properties";

type Props = { params: Promise<{ slug: string }> };

// Las fichas publicadas se generan al compilar; las que se publiquen después desde /admin se
// generan en la primera visita (dynamicParams por defecto). Un slug que no existe → 404.
export const revalidate = 3600;

export const generateStaticParams = async () => (await obtenerPropiedades()).map((p) => ({ slug: p.slug }));

const descripcionCorta = (p: Property): string => {
  const base = `${ETIQUETA_TIPO[p.tipo]} en ${p.operacion} en ${p.distrito}: ${p.areaConstruidaM2} m², ${p.dormitorios} dormitorios, ${p.banos} baños. ${precioTexto(p)}.`;
  const completa = `${base} ${p.descripcion}`;
  return completa.length <= 160 ? completa : `${completa.slice(0, 157).trimEnd()}…`;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const p = await obtenerPorSlug(slug);
  if (!p) return {};
  const description = descripcionCorta(p);
  const titulo = `${p.titulo} | ${BRAND_NAME}`;
  const foto = { url: p.fotos[0].url, alt: p.fotos[0].alt };
  return {
    title: p.titulo,
    description,
    alternates: { canonical: `/propiedades/${p.slug}` },
    openGraph: {
      type: "website",
      locale: "es_PE",
      siteName: BRAND_NAME,
      title: titulo,
      description,
      url: `/propiedades/${p.slug}`,
      images: [foto],
    },
    twitter: { card: "summary_large_image", title: titulo, description, images: [foto] },
    // La ficha de ejemplo nunca debe indexarse.
    ...(p.id.startsWith("EJEMPLO") ? { robots: { index: false, follow: false } } : {}),
  };
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  const p = await obtenerPorSlug(slug);
  if (!p) notFound();
  return <FichaPropiedad propiedad={p} parecidas={await similares(p)} />;
};

export default Page;
