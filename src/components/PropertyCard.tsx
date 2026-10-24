import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Square, MapPin, MessageCircle } from "lucide-react";
import { ETIQUETA_OPERACION, type Property } from "@/data/properties";
import { precioTexto, waPropiedad } from "@/lib/propiedades";

/**
 * Tarjeta de propiedad (catálogo y home). Todo el recuadro lleva a la ficha mediante
 * el enlace del título (`after:absolute`); el botón de WhatsApp queda por encima.
 */
const PropertyCard = ({ property: p, priority = false }: { property: Property; priority?: boolean }) => (
  <article className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 focus-within:ring-2 focus-within:ring-primary">
    <div className="relative h-64 overflow-hidden">
      <Image
        src={p.fotos[0].url}
        alt={p.fotos[0].alt}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/10 to-transparent" />
      <span className="absolute top-4 left-4 bg-white text-dark text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
        {ETIQUETA_OPERACION[p.operacion]}
      </span>
      <p className="absolute bottom-4 left-4 text-white text-2xl font-black">{precioTexto(p)}</p>
    </div>

    <div className="p-6">
      <p className="flex items-center text-gray-600 mb-2 text-xs font-bold tracking-wider uppercase">
        <MapPin className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
        {p.distrito}
      </p>
      <h3 className="text-xl font-serif font-black text-dark mb-5 line-clamp-2">
        <Link
          href={`/propiedades/${p.slug}`}
          className="after:absolute after:inset-0 after:content-[''] focus:outline-none hover:text-primary transition-colors"
        >
          {p.titulo}
        </Link>
      </h3>

      <ul className="flex items-center justify-between pt-5 border-t border-gray-100 text-gray-600 text-sm font-bold">
        <li className="flex items-center" title="Dormitorios">
          <BedDouble className="w-4 h-4 mr-2" aria-hidden="true" />
          {p.dormitorios}
          <span className="sr-only"> dormitorios</span>
        </li>
        <li className="flex items-center" title="Baños">
          <Bath className="w-4 h-4 mr-2" aria-hidden="true" />
          {p.banos}
          <span className="sr-only"> baños</span>
        </li>
        <li className="flex items-center" title="Área construida">
          <Square className="w-4 h-4 mr-2" aria-hidden="true" />
          {p.areaConstruidaM2} m²
        </li>
      </ul>

      <a
        data-origen={`tarjeta:${p.id}`}
        href={waPropiedad(p)}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 mt-5 inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline"
      >
        <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
        Consultar por WhatsApp
        <span className="sr-only">: {p.titulo}</span>
      </a>
    </div>
  </article>
);

export default PropertyCard;
