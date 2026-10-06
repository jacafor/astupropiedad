/**
 * Única fuente de verdad de las rutas públicas: alimenta la metadata de cada
 * página (vía `rutaMetadata`) y el sitemap. Para añadir una página, ver docs/SEO.md.
 *
 * `title` NO lleva la marca: el `title.template` del layout añade " | AS Tupropiedad"
 * (máx. 60 caracteres en total). La home usa el título por defecto del layout.
 */
export interface Ruta {
  path: string;
  title: string;
  description: string;
  priority: number;
}

export const RUTAS: Ruta[] = [
  {
    path: "/",
    title: "AS Tupropiedad | Departamentos y casas en Lima",
    description:
      "Boutique inmobiliaria en Lima: compra, vende o invierte con asesoría cercana, simuladores de hipoteca y rentabilidad, y acompañamiento en todo el proceso.",
    priority: 1,
  },
  {
    path: "/propiedades",
    title: "Departamentos y casas en venta en Lima",
    description:
      "Explora departamentos y casas en venta en Lima: Jesús María, La Molina, Callao y más. Revisa ubicación y áreas y escríbenos por WhatsApp para coordinar visita.",
    priority: 0.9,
  },
  {
    path: "/vender",
    title: "Vende tu departamento o casa en Lima",
    description:
      "¿Quieres vender tu departamento o casa en Lima? Cuéntanos sobre tu inmueble y te acompañamos con fotografía, difusión y la búsqueda de compradores interesados.",
    priority: 0.9,
  },
  {
    path: "/simulador-hipotecario",
    title: "Simulador de crédito hipotecario",
    description:
      "Calcula la cuota mensual, los intereses y el pago total de tu crédito hipotecario. Es una simulación referencial: te ayudamos a revisarla con tu situación real.",
    priority: 0.8,
  },
  {
    path: "/simulador-inversion",
    title: "Calculadora de rentabilidad inmobiliaria",
    description:
      "Estima la rentabilidad, el flujo mensual y la plusvalía de tu inversión inmobiliaria en Lima, con alcabala, mantenimiento e impuestos. Cálculo referencial.",
    priority: 0.8,
  },
  {
    path: "/servicios",
    title: "Servicios inmobiliarios en Lima",
    description:
      "Representación de comprador (Personal Shopper), marketing para vendedores, estructuración financiera y revisión legal: todo lo que necesitas en un solo equipo.",
    priority: 0.7,
  },
  {
    path: "/nosotros",
    title: "Quiénes somos, boutique inmobiliaria",
    description:
      "Conoce AS Tupropiedad, boutique inmobiliaria de Lima: nuestra forma de trabajar y los valores con los que te acompañamos a comprar, vender e invertir.",
    priority: 0.6,
  },
];
