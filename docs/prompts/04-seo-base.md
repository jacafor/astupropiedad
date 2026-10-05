# 04 · SEO base (P0 · C4)

**Tú das:** nada. El dominio ya es `astupropiedad.com` (D-9). Si luego decides usar `www`, es un cambio de una línea en `contact.ts`.
**Depende de:** 01 y 03 (los títulos usan el tono final).

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: SEO técnico base. Hoy las 7 páginas son "use client" y comparten el mismo título; no pueden exportar metadata. Responde en español, tono "tú". Contacto y dominio solo desde src/lib/contact.ts.

Antes de escribir código lee en node_modules/next/dist/docs/: metadata (generateMetadata, title template, metadataBase), robots, sitemap, opengraph-image, y json-ld (01-app/02-guides/json-ld.md). Lee docs/auditorias/AUDITORIA-WEB.md hallazgo C4: trae títulos y descripciones propuestos por página; úsalos como borrador pero ajústalos a "tú" y a astupropiedad.com (title ≤ 60 caracteres, description 150-160).

Tareas:
1. Cada page.tsx pasa a ser Server Component con `export const metadata` propia; lo interactivo se mueve a un componente cliente en el mismo directorio (p. ej. VenderClient.tsx). No cambies el comportamiento ni el aspecto.
2. layout.tsx: metadataBase = new URL(SITE_URL), title.template, description por defecto, openGraph (locale es_PE, siteName), twitter card, alternates.canonical por página.
3. src/app/robots.ts y src/app/sitemap.ts con las 7 rutas actuales y SITE_URL.
4. Imagen OG: opengraph-image (next/og o un archivo estático) con el logo de public/imagenes y el nombre de la marca. Sin textos de cifras ni promesas.
5. JSON-LD RealEstateAgent en el layout, SOLO con datos de contact.ts (nombre, url, teléfono, correo) y logo. No pongas dirección, horarios, rating, reseñas ni redes: no están confirmados. Escapa "<" como <.
6. Un solo <h1> por página: si alguna tiene cero o varios, corrígelo sin cambiar el diseño.

Pruebas con el build de producción (puerto libre, apágalo al terminar), con curl o el navegador:
- Cada una de las 7 rutas: <title> y meta description distintos, canonical correcto, og:title, og:image con URL absoluta.
- /robots.txt y /sitemap.xml responden 200 y el sitemap lista las 7 rutas con astupropiedad.com.
- El JSON-LD es JSON válido (parsea con JSON.parse) y no contiene datos inventados.
- Las páginas siguen funcionando (menú, simuladores, wizard de /vender) a 390 px.
- npx tsc --noEmit && npm run lint && npm run build.

Crea docs/SEO.md con los títulos/descripciones finales por ruta y cómo añadir una página al sitemap. Marca las casillas del ROADMAP. Dime qué verificaste de verdad y qué no (no puedes comprobar cómo se ve el enlace en WhatsApp; di cómo probarlo).
````
