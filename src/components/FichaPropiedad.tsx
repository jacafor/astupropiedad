import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Car, Check, FileDown, MapPin, MessageCircle, Square } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import VistaPropiedad from "@/components/VistaPropiedad";
import { SITE_URL } from "@/lib/contact";
import { precioTexto, waPropiedad } from "@/lib/propiedades";
import { ETIQUETA_OPERACION, ETIQUETA_TIPO, type Property } from "@/data/properties";

/**
 * Ficha de una propiedad. La usan la página pública `/propiedades/[slug]` y la vista previa de
 * /admin (`vistaPrevia`: sin JSON-LD ni analítica, para no registrar visitas de quien administra).
 */

/** Las fotos de Supabase ya son absolutas; las de /public (ejemplo) se completan con el dominio. */
const urlAbsoluta = (url: string): string => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url}`);

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
  image: p.fotos.map((f) => urlAbsoluta(f.url)),
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

type Props = { propiedad: Property; parecidas?: Property[]; vistaPrevia?: boolean };

const FichaPropiedad = ({ propiedad: p, parecidas = [], vistaPrevia = false }: Props) => {
  const [portada, ...otras] = p.fotos;

  return (
    <div className={`bg-gray-50 pb-24 ${vistaPrevia ? "pt-10" : "pt-32"}`}>
      {!vistaPrevia && (
        <>
          <VistaPropiedad id={p.id} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPropiedad(p)).replace(/</g, "\\u003c") }}
          />
        </>
      )}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {!vistaPrevia && (
          <Link
            href="/propiedades"
            className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Volver al catálogo
          </Link>
        )}

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
              data-origen={`propiedad:${p.id}`}
              href={waPropiedad(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-secondary text-dark px-6 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MessageCircle className="w-4 h-4 mr-3" aria-hidden="true" />
              Consultar por WhatsApp
            </a>
            {/* La vista previa de /admin puede ser un borrador: su PDF no existe todavía. */}
            {!vistaPrevia && (
              <a
                href={`/propiedades/${p.slug}/ficha.pdf`}
                download
                className="mt-3 flex items-center justify-center border-2 border-dark text-dark px-6 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-dark hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-primary"
              >
                <FileDown className="w-4 h-4 mr-3" aria-hidden="true" />
                Descargar ficha (PDF)
              </a>
            )}
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

export default FichaPropiedad;
