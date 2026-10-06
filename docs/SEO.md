# SEO técnico

Estado tras la sesión 04 (2026-10-05). Dominio base: `SITE_URL` de `src/lib/contact.ts` (`https://astupropiedad.com`, sobrescribible con `NEXT_PUBLIC_SITE_URL`). **Ojo:** el dominio aún no está asignado a este despliegue (ver P-12); mientras tanto el canonical, el sitemap y las imágenes OG apuntan a `astupropiedad.com`, no a la URL `*.vercel.app`.

## Cómo está armado

| Pieza | Archivo | Qué hace |
|---|---|---|
| Lista de rutas (fuente única) | `src/lib/rutas.ts` | `path`, `title`, `description`, `priority` de cada página |
| Metadata por página | `src/lib/seo.ts` → `rutaMetadata(path)` | title, description, canonical, Open Graph y Twitter (con imagen) |
| Base global | `src/app/layout.tsx` | `metadataBase`, `title.template` = `%s \| AS Tupropiedad`, description y OG por defecto, `lang="es-PE"` |
| Sitemap / robots | `src/app/sitemap.ts`, `src/app/robots.ts` | Se generan desde `RUTAS` y `SITE_URL` |
| Imagen para compartir | `src/app/opengraph-image.tsx`, `twitter-image.tsx` (generador en `src/lib/og-image.tsx`) | PNG 1200×630 con el logo y el nombre; sin cifras ni promesas |
| Datos estructurados | `src/components/JsonLd.tsx` (en el layout) | `RealEstateAgent` solo con nombre, URL, teléfono, correo y logo |

Cada `page.tsx` es un Server Component que exporta `metadata = rutaMetadata("/ruta")` y renderiza un componente cliente (`*Client.tsx`) con lo interactivo. La home no necesita componente cliente porque sus secciones ya lo son.

## Títulos y descripciones finales

El título final es `title` + ` | AS Tupropiedad` (salvo la home, que usa el suyo completo). Todos ≤ 60 caracteres; descripciones de 150 a 160.

| Ruta | Título completo (car.) | Descripción (car.) |
|---|---|---|
| `/` | AS Tupropiedad \| Departamentos y casas en Lima (46) | Boutique inmobiliaria en Lima: compra, vende o invierte con asesoría cercana, simuladores de hipoteca y rentabilidad, y acompañamiento en todo el proceso. (154) |
| `/propiedades` | Departamentos y casas en venta en Lima \| AS Tupropiedad (55) | Explora departamentos y casas en venta en Lima: Jesús María, La Molina, Callao y más. Revisa ubicación y áreas y escríbenos por WhatsApp para coordinar visita. (159) |
| `/vender` | Vende tu departamento o casa en Lima \| AS Tupropiedad (53) | ¿Quieres vender tu departamento o casa en Lima? Cuéntanos sobre tu inmueble y te acompañamos con fotografía, difusión y la búsqueda de compradores interesados. (159) |
| `/simulador-hipotecario` | Simulador de crédito hipotecario \| AS Tupropiedad (49) | Calcula la cuota mensual, los intereses y el pago total de tu crédito hipotecario. Es una simulación referencial: te ayudamos a revisarla con tu situación real. (160) |
| `/simulador-inversion` | Calculadora de rentabilidad inmobiliaria \| AS Tupropiedad (57) | Estima la rentabilidad, el flujo mensual y la plusvalía de tu inversión inmobiliaria en Lima, con alcabala, mantenimiento e impuestos. Cálculo referencial. (155) |
| `/servicios` | Servicios inmobiliarios en Lima \| AS Tupropiedad (48) | Representación de comprador (Personal Shopper), marketing para vendedores, estructuración financiera y revisión legal: todo lo que necesitas en un solo equipo. (159) |
| `/nosotros` | Quiénes somos, boutique inmobiliaria \| AS Tupropiedad (53) | Conoce AS Tupropiedad, boutique inmobiliaria de Lima: nuestra forma de trabajar y los valores con los que te acompañamos a comprar, vender e invertir. (150) |

Se quitaron del borrador de la auditoría las frases sin respaldo: "valoración gratuita", "red de compradores calificados", "asesores con experiencia bancaria" y "cap rate" (ver D-15, D-16). Si el cliente confirma alguna, se puede reponer.

## Cómo añadir una página al sitemap

1. Crea la página con `/nueva-pagina` (Server Component).
2. Añade su entrada en `RUTAS` de `src/lib/rutas.ts`: `path`, `title` (sin la marca), `description` (150-160) y `priority`.
3. En el `page.tsx`: `export const metadata: Metadata = rutaMetadata("/tu-ruta");`. Si la ruta no está en `RUTAS`, el build falla a propósito.
4. `sitemap.ts` la incluye sola. Verifica con `npm run build` y consulta `/sitemap.xml`.
5. Una sola `<h1>` en la página.

Las páginas dinámicas (`/propiedades/[slug]`, sesión 07) deberán usar `generateMetadata` y añadir sus URLs en `sitemap.ts` leyendo `src/data/properties.ts`; `rutaMetadata` solo cubre rutas fijas.

## Reglas que no se rompen

- **Una página que define su propio `openGraph` o `twitter` reemplaza al del layout** (no se fusionan): por eso `rutaMetadata` repite `siteName`, `locale` e `images`. No uses un `export const metadata` suelto en una página.
- **JSON-LD:** solo datos confirmados de `contact.ts`. No añadir dirección, horario, valoraciones, reseñas ni redes sociales hasta que el cliente los confirme (D-9, P-10). El `<` se escapa como `<`.
- El sitemap no lleva `lastModified`: no hay una fecha real de edición por página y no se inventa.

## Cómo probar el enlace compartido (no verificable sin dominio público)

Los metadatos están comprobados en el HTML, pero cómo se ve la tarjeta en WhatsApp/Instagram depende de que sus rastreadores lean una URL pública. Las URLs absolutas dentro del HTML apuntan a `astupropiedad.com`, así que la imagen solo aparecerá cuando ese dominio responda.

1. Con el dominio asignado, pega la URL en un chat contigo mismo en WhatsApp y espera unos segundos: debe verse el título, la descripción y la imagen con el logo.
2. WhatsApp guarda la tarjeta en caché: si cambias algo, prueba con la URL + `?v=2`. Para Facebook/Instagram: [Sharing Debugger](https://developers.facebook.com/tools/debug/). Para ver la imagen sola: abre `/opengraph-image`.
3. Datos estructurados: [Rich Results Test](https://search.google.com/test/rich-results) o [Schema Markup Validator](https://validator.schema.org/).
4. Con dominio: enviar `https://astupropiedad.com/sitemap.xml` en Search Console.

## Pendiente (no hecho en esta sesión)

- Sin `FAQPage`, `Offer`/`Residence` ni `BreadcrumbList` (llegan con las fichas, sesión 07).
- Falta `not-found.tsx` en español (hoy el 404 es el de Next).
- Los logos y flyers conservan nombres con espacios (`logo AS Tupropiedad.png`); la URL del logo en el JSON-LD va codificada. Renombrar requiere permiso (AGENTS.md).
