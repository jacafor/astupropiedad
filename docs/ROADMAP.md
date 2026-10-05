# Roadmap

Plan priorizado derivado de [AUDITORIA-WEB.md](auditorias/AUDITORIA-WEB.md) y [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md). **Marca la casilla al terminar cada tarea** (y anota la fecha). Orden de arreglo: que no se pierda trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → resto.

Leyenda de referencias: `C1…C7` = hallazgos críticos de la auditoría web · `Bloque X` = auditoría de funcionalidades.

## Bloqueos del cliente (sin esto no se puede cerrar P0/P1)

- [ ] ~~WhatsApp, correo y dominio~~ (recibidos 2026-10-04) · **faltan:** dirección, horario, RUC, redes sociales
- [ ] Webhook/API y calendario de GoHighLevel (+ flujo de atención y SLA)
- [ ] Inventario real de propiedades (datos + fotos limpias)
- [ ] Fotos y datos del equipo real
- [ ] Cifras verificables / convenios bancarios autorizados
- [ ] Textos legales (privacidad, términos) y Libro de Reclamaciones

Detalle en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) §7 y [DECISIONES.md](DECISIONES.md).

## P0 — esta semana

- [x] **Mover `Navbar`, `Footer` y `FloatingWhatsApp` a `layout.tsx`** y poner `<main>` por página *(base de varias correcciones; C5)* — 2026-10-05, sesión [01](prompts/01-layout-navbar-main.md)
  - Hecho cuando: ninguna página repite Navbar/Footer; `/propiedades` muestra el menú sin hacer scroll.
- [x] **Crear `src/lib/contact.ts`** y usarlo en navbar, footer, botón flotante *(C2)* — hecho 2026-10-04 (falta: metadata/JSON-LD cuando existan, y las imágenes con teléfono viejo)
  - Hecho cuando: un único teléfono/correo/dominio en todo el sitio; cero apariciones de `51900000000`; `mailto:`/`tel:` en el footer.
- [x] **Arreglar enlaces muertos:** `#vender` → `/vender`; "Catálogo" → `/propiedades`; quitar `(GHL)` visible; redes sociales; "Postular" *(C1)* — 2026-10-05, sesión [02](prompts/02-enlaces-y-contenido-falso.md). Los CTA sin embudo van a WhatsApp con mensaje prellenado; redes y Privacidad/Términos ocultos hasta tener URL/páginas (sesión 09). El formulario de `/vender` sigue sin enviar nada (sesión 05)
  - Hecho cuando: ningún `href="#"` ni botón sin destino (comprobar con `grep` y en navegador a 390 px).
- [x] **Quitar contenido falso:** propiedad de Unsplash, fotos de "equipo" que son edificios, afirmaciones "garantizado" *(C3)* — 2026-10-05, sesión 02. Quedan **pendientes del cliente** las contradicciones entre el catálogo/destacadas y los flyers (ver P-13 en DECISIONES y NEGOCIO-Y-CONTENIDO §4)
  - Hecho cuando: ninguna imagen engañosa; marcadores honestos donde falte dato.
- [ ] **Actualizar `next` a `16.3.8`** y `eslint-config-next` *(C6)*
  - Hecho cuando: `npm audit --omit=dev` sin críticas; build y lint igual o mejor que la línea base.
- [x] `.gitignore` completo, `.env.example`, documentación del proyecto (esta carpeta)

## P0 — semana 1: embudo de leads *(Bloque A, C1)*

- [ ] Server Action `enviarLead` + validación (zod) + honeypot/Turnstile + envío a GHL
- [ ] Conectar: asistente de `/vender`, CTA del simulador hipotecario, CTA del simulador de inversión, "Contactar a un Broker", "Solicitar asesor privado", reclutamiento
- [ ] Botón de WhatsApp con mensaje prellenado como plan B (`waLink` en `src/lib/contact.ts`, ya existe)
- [ ] Páginas `/privacidad` y `/terminos` + casilla de consentimiento en cada formulario
  - Hecho cuando: un lead de prueba llega a GHL con origen, página y consentimiento; el usuario ve confirmación real y error entendible.

## P0 — semana 1: SEO base *(C4)*

- [ ] Convertir cada `page.tsx` en Server Component con `metadata` propia (usar los títulos/descripciones de AUDITORIA-WEB §C4)
- [ ] `metadataBase`, Open Graph/Twitter, canonical, `robots.ts`, `sitemap.ts`, imagen OG
- [ ] JSON-LD `RealEstateAgent` en el layout
  - Hecho cuando: cada ruta tiene título/description únicos; `/robots.txt` y `/sitemap.xml` responden 200; el link se ve bien al pegarlo en WhatsApp.

## P1 — semanas 2-3

- [ ] **Fuente única de propiedades** `src/data/properties.ts` (tipo `Property`) y datos/fotos reales *(C3, Bloque B)*
- [ ] **Fichas** `/propiedades/[slug]` con galería, WhatsApp prellenado, JSON-LD, similares *(Bloque C)*
- [ ] **Simuladores v2:** `src/lib/finance.ts` con pruebas, TEA→TEM, validación de entradas, cronograma, capacidad de pago, alcabala/plusvalía editables, resultado enviable como lead *(C7, Bloque D)*
- [ ] **Analítica + eventos + banner de cookies** *(Bloque G)*
- [ ] **Accesibilidad:** labels, `aria-label`, contraste, texto ≥ 12 px, `reducedMotion`, foco visible *(AUDITORIA-WEB §Accesibilidad)*
  - Hecho cuando: `design:accessibility-review` sin críticos; cero `<div onClick>`.

## P2 — mes 2

- [ ] Catálogo avanzado: filtros de precio/dormitorios/m², orden, estado en la URL, vista lista real, favoritos, estado vacío con acción *(Bloque C)*
- [ ] Calendario GHL en `/agendar` y asistente de valoración v2 (Atrás, borrador, validación) *(Bloque E)*
- [ ] `next/image`, WebP/AVIF, Server Components para contenido estático, lint a cero *(Rendimiento)*
- [ ] Pruebas: Vitest para `finance.ts`, Playwright para flujos críticos; CI con `tsc` + `eslint` + `build` *(Bloque H)*
- [ ] Cabeceras de seguridad y `poweredByHeader: false`; `not-found.tsx`/`error.tsx` en español
- [x] `git init` (rama `main`) y limpieza de duplicados — 2026-10-05, 3 commits *(D-12)*
- [x] Conectar el repo con Vercel (previews por rama; producción solo desde `main`, sin asignar dominio todavía) — 2026-10-05, sesión [14](prompts/14-conectar-vercel.md), ver [DESPLIEGUE.md](DESPLIEGUE.md). Preview de `prueba/vercel-preview` en Ready. Pendiente de decidir: P-12 (protección de `main`, dominio, `www`)
- [x] Añadir `<main>` a las 6 páginas internas — resuelto con el `<main id="contenido">` único del layout, 2026-10-05 (sesión 01)
- [ ] Revisar a 390 px el preview de Vercel (menú móvil, botón flotante, simuladores): solo se vio a escritorio
- [x] Remoto en GitHub (`jacafor/astupropiedad`) y primer `git push` — 2026-10-05 *(D-12)*. Pendiente: confirmar en GitHub que el repositorio es **privado**

## P3 — continuo

- [ ] Blog/guías en MDX enlazadas a los simuladores
- [ ] Landings por distrito (Miraflores, San Isidro, Surco, Jesús María, La Molina, Callao…)
- [ ] Testimonios, casos reales, reseñas de Google, FAQ
- [ ] Alertas de nuevas propiedades (WhatsApp/correo)
- [ ] Supabase como panel de inventario *(si el equipo lo necesita)*
- [ ] Libro de Reclamaciones y cumplimiento completo

## Definición de "sitio funcional mínimo" (MVP)

1. Un visitante deja sus datos desde cualquier CTA y el asesor lo recibe en GHL y por WhatsApp.
2. Cada propiedad del catálogo tiene ficha propia con datos coherentes y botón de WhatsApp.
3. Los simuladores no devuelven valores imposibles y su resultado puede enviarse como lead.
4. Existen privacidad, términos y consentimiento.
5. Se mide (visitas → leads) para saber qué funciona.

## Línea base de calidad (no empeorar)

| Chequeo | Línea base (3 oct 2026) | Meta |
|---|---|---|
| `npx tsc --noEmit` | limpio | limpio |
| `npm run lint` | 6 errores · 17 advertencias | 0 / 0 |
| `npm run build` | OK (7 páginas + 404, todas estáticas) | OK |
| `npm audit --omit=dev` | 1 crítica · 3 altas · 1 moderada | 0 críticas/altas |
| SEO / UX / Accesibilidad | 32 · 36 · ~35 | ≥ 75 · ≥ 70 · ≥ 80 |
