import { BRAND_NAME, EMAIL, SITE_URL, WHATSAPP_NUMBER } from "@/lib/contact";

/**
 * Datos estructurados `RealEstateAgent`. Solo lleva lo confirmado (nombre, URL,
 * teléfono, correo y logo). No añadir dirección, horario, valoraciones ni redes
 * hasta que el cliente los confirme (ver docs/SEO.md).
 */
export const jsonLdAgente = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: BRAND_NAME,
  url: SITE_URL,
  telephone: `+${WHATSAPP_NUMBER}`,
  email: EMAIL,
  logo: `${SITE_URL}/imagenes/${encodeURIComponent("logo AS Tupropiedad.png")}`,
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
