import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, Car, Check, MapPin, MessageCircle, Square } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { BRAND_NAME, SITE_URL } from "@/lib/contact";
import { precioTexto, waPropiedad } from "@/lib/propiedades";
import {
  ETIQUETA_OPERACION,
  ETIQUETA_TIPO,
  obtenerPorSlug,
  obtenerPropiedades,
  similares,
  type Property,
} from "@/data/properties";

type Props = { params: Promise<{ slug: string }> };

// Slug que no esté en el inventario → 404 directo (sin render bajo demanda).
export const dynamicParams = false;

export const generateStaticParams = () => obtenerPropiedades().map((p) => ({ slug: p.slug }));

const descripcionCorta = (p: Property): string => {
  const base = `${ETIQUETA_TIPO[p.tipo]} en ${p.operacion} en ${p.distrito}: ${p.areaConstruidaM2} m², ${p.dormitorios} dormitorios, ${p.banos} baños. ${precioTexto(p)}.`;
  const completa = `${base} ${p.descripcion}`;
  return completa.length <= 160 ? completa : `${completa.slice(0, 157).trimEnd()}…`;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  const p = obtenerPorSlug(slug);
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

const TIPO_SCHEMA: Record<Property["tipo"], string> = {
  departamento: "Apartment",
  casa: "House",
  oficina: "Accommodation",
  terreno: "Landform",
};

const DISPONIBILIDAD: Record<Property["estado"], string> = {
  disponible: "https://schema.org/InStock",
  reservado: "https://schema.org/LimitedAvailability",
  vendido: "https://schema.org/SoldOut",
};

const jsonLdPropiedad = (p: Property) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: p.titulo,
  url: `${SITE_URL}/propiedades/${p.slug}`,
  description: p.descripcion,
  image: p.fotos.map((f) => `${SITE_URL}${f.url}`),
  offers: {
    "@type": "Offer",
    price: p.precio,
    priceCurrency: p.moneda,
    availability: DISPONIBILIDAD[p.estado],
  },
  about: {
    "@type": TIPO_SCHEMA[p.tipo],
    name: p.titulo,
    numberOfBedrooms: p.dormitorios,
    numberOfBathroomsTotal: p.banos,
    floorSize: { "@type": "QuantitativeValue", value: p.areaConstruidaM2, unitCode: "MTK" },
    address: { "@type": "PostalAddress", addressLocality: p.distrito, addressCountry: "PE" },
  },
});

const Dato = ({ icono: Icono, valor, etiqueta }: { icono: typeof Square; valor: string; etiqueta: string }) => (
  <div className="bg-light rounded-2xl p-4 text-center">
    <Icono className="w-5 h-5 mx-auto mb-2 text-primary" aria-hidden="true" />
    <p className="text-xl font-black text-dark">{valor}</p>
    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">{etiqueta}</p>
  </div>
);

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  const p = obtenerPorSlug(slug);
  if (!p) notFound();

  const [portada, ...otras] = p.fotos;
  const parecidas = similares(p);

  return (
    <div className="bg-gray-50 pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPropiedad(p)).replace(/</g, "\\u003c") }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link
          href="/propiedades"
          className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-gray-200">
              <Image
                src={portada.url}
                alt={portada.alt}
                fill
                priority
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
              />
            </div>
            {otras.length > 0 && (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {otras.map((f) => (
                  <li key={f.url} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200">
                    <Image src={f.url} alt={f.alt} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}

            <section className="mt-10" aria-labelledby="descripcion">
              <h2 id="descripcion" className="text-2xl font-serif font-black text-dark mb-4">
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{p.descripcion}</p>
              {p.caracteristicas && p.caracteristicas.length > 0 && (
                <ul className="grid sm:grid-cols-2 gap-3 mt-6">
                  {p.caracteristicas.map((c) => (
                    <li key={c} className="flex items-start text-gray-700">
                      <Check className="w-5 h-5 mr-3 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 self-start bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-dark text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                {ETIQUETA_OPERACION[p.operacion]}
              </span>
              <span className="bg-light text-dark text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-gray-200">
                {ETIQUETA_TIPO[p.tipo]}
              </span>
              {p.estado !== "disponible" && (
                <span className="bg-primary text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  {p.estado === "reservado" ? "Reservado" : "Vendido"}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-serif font-black text-dark mb-3">{p.titulo}</h1>
            <p className="flex items-center text-gray-600 text-sm font-bold uppercase tracking-wider mb-6">
              <MapPin className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
              {p.distrito}
            </p>
            <p className="text-4xl font-black text-primary mb-6">{precioTexto(p)}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Dato icono={Square} valor={`${p.areaConstruidaM2} m²`} etiqueta="Construida" />
              {p.areaTotalM2 !== undefined && <Dato icono={Square} valor={`${p.areaTotalM2} m²`} etiqueta="Total" />}
              <Dato icono={BedDouble} valor={String(p.dormitorios)} etiqueta="Dormitorios" />
              <Dato icono={Bath} valor={String(p.banos)} etiqueta="Baños" />
              <Dato icono={Car} valor={String(p.cocheras)} etiqueta="Cocheras" />
            </div>

            <a
              href={waPropiedad(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-secondary text-dark px-6 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MessageCircle className="w-4 h-4 mr-3" aria-hidden="true" />
              Consultar por WhatsApp
            </a>
            <p className="text-xs text-gray-600 mt-4">Referencia: {p.id}</p>
          </aside>
        </div>

        {parecidas.length > 0 && (
          <section className="mt-20" aria-labelledby="similares">
            <h2 id="similares" className="text-3xl font-serif font-black text-dark mb-8">
              Propiedades similares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parecidas.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Page;
