import {
  BRAND_NAME,
  DIRECCION,
  EMAIL,
  HORARIO,
  REDES_SOCIALES,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "@/lib/contact";

/**
 * Datos estructurados `RealEstateAgent`. Solo lleva lo confirmado y viene de
 * `contact.ts` (nombre, URL, teléfono, correo, logo, dirección, horario y redes).
 * No añadir valoraciones ni reseñas (ver docs/SEO.md).
 */
export const jsonLdAgente = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: BRAND_NAME,
  url: SITE_URL,
  telephone: `+${WHATSAPP_NUMBER}`,
  email: EMAIL,
  logo: `${SITE_URL}/imagenes/logo-as-tupropiedad.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: DIRECCION.calle,
    addressLocality: DIRECCION.distrito,
    addressRegion: DIRECCION.ciudad,
    addressCountry: DIRECCION.codigoPais,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: HORARIO.dias,
    opens: HORARIO.abre,
    closes: HORARIO.cierra,
  },
  sameAs: REDES_SOCIALES.map((red) => red.url),
};

const JsonLd = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(jsonLdAgente).replace(/</g, "\u003c"),
    }}
  />
);

export default JsonLd;
