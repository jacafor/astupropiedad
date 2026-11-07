# Roadmap

Plan priorizado derivado de [AUDITORIA-WEB.md](auditorias/AUDITORIA-WEB.md) y [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md). **Marca la casilla al terminar cada tarea** (y anota la fecha). Orden de arreglo: que no se pierda trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → resto.

Leyenda de referencias: `C1…C7` = hallazgos críticos de la auditoría web · `Bloque X` = auditoría de funcionalidades.

## Bloqueos del cliente (sin esto no se puede cerrar P0/P1)

- [ ] ~~WhatsApp, correo y dominio~~ (recibidos 2026-10-04) · ~~dirección, horario y redes~~ (recibidos 2026-10-29, D-28) · **faltan:** RUC y razón social, y confirmar TikTok
- [ ] GoHighLevel **por API** (D-27, 2026-10-29): ~~token e IDs en Vercel, pipeline, campos y calendario de llamadas~~ (2026-10-30) · ~~código de la sesión [15](prompts/15-ghl-api.md)~~ (2026-10-30) · ~~prueba con el GHL real (datos ficticios)~~ (2026-10-31) · **falta:** decidir API o widget de GHL para la cita, quitar el webhook de respaldo si jforero lo confirma, flujo de atención y SLA
- [ ] Inventario real de propiedades (datos + fotos limpias)
- [ ] **Administrador de propiedades y publicación en Proppit y otros portales, para dejar Tokko** (D-29, 2026-10-29): dividido el 2026-10-31 en dos sesiones: ~~[16](prompts/16-administrador-propiedades.md) = catálogo y administrador `/admin` con Supabase (sin portales)~~ **código hecho 2026-10-31 (D-30); ~~proyectos de Supabase y migraciones~~ (2026-11-04); ~~apagar el registro público, crear las cuentas~~ (2026-11-04), ~~variables en Vercel~~ (2026-11-04), ~~fotos de celular Samsung y de más de 4 MB~~ (2026-11-05); ~~prueba e2e completa de `/admin` contra Pruebas~~ (2026-11-05). **Sesión 16 cerrada el 2026-11-05**; la pausa por inactividad del plan gratuito queda mitigada con un cron diario de Vercel (2026-11-05, D-32; P-16 sigue abierta por si se prefiere el plan Pro)**; [17](prompts/17-portales-proppit.md) = publicación en Proppit y otros portales, GHL y salida de Tokko (necesita la especificación técnica de Proppit y la lista de portales, P-15)
- [x] **Fotos en `/admin`: varias a la vez y orden arrastrando** (D-33) — 2026-11-05
- [ ] **Usuarios y roles en `/admin/usuarios`** (D-36): ~~código, migración, pruebas unitarias y e2e~~ (2026-11-07) · ~~migración en Pruebas~~ (2026-11-07) · **falta:** migración en el proyecto del sitio (OK de jforero), `SUPABASE_SECRET_KEY` en Vercel (jforero), correr `e2e/admin-con-supabase.ps1` con la secreta de Pruebas y crear la cuenta de la encargada (rol editor) desde el panel. Más adelante: invitación y recuperación por correo cuando haya SMTP propio en Supabase
- [x] **Ficha PDF de cada propiedad** (`/propiedades/<slug>/ficha.pdf`, D-31) — 2026-11-05. Siguientes mejoras de la ficha (analizadas el 2026-11-05, sin hacer): versión sin precio; mantenimiento, piso, ascensor, antigüedad, SUNARP y Mivivienda (datos del cliente; mejor tras la especificación de Proppit, P-15); características como casillas y filtros; mapa con zona aproximada; galería ampliable, planos y video; "Calcula tu cuota" con el precio y "Agenda una visita"; precio por m²; duplicar propiedad, notas internas y aviso de ficha incompleta en `/admin`
- [ ] **GHL AI Studio** (P-17): ~~piloto con Cloud y Git Sync~~ (2026-11-03: nuestra migración entra igual en Cloud, que es Supabase) · ~~3 propiedades de ejemplo y vista~~ (2026-11-03) · ~~despublicado~~ (2026-11-05, jforero) · **falta:** decidir si se usa (recomendación: seguir con el Supabase propio), medir costo, y pausar o borrar Cloud y el piloto si no se usa. Nota: agregar los `GRANT` explícitos a nuestra migración (Cloud los exigió; los proyectos nuevos de Supabase podrían exigirlos también)
- [ ] Fotos y datos del equipo real
- [ ] Cifras verificables · convenios bancarios: nombres recibidos 2026-10-29 (BBVA, BCP, Scotiabank, Interbank; ya en `/simulador-hipotecario`), **falta archivar el respaldo escrito** (P-10)
- [ ] Textos legales revisados (privacidad y términos ya existen como borrador) y Libro de Reclamaciones

Detalle en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) §7 y [DECISIONES.md](DECISIONES.md).

## Auditoría completa 2026-11 — arreglos propuestos (esperan OK de jforero)

Hallazgos accionables de [AUDITORIA-COMPLETA-2026-11.md](auditorias/AUDITORIA-COMPLETA-2026-11.md) (2026-11-05, nota global 70/100), agrupados en las sesiones del plan (§6 del informe), en el orden de prioridad del repo. Los que ya estaban anotados más abajo no se repiten: se citan.

- [ ] **1 · Sacar la ficha ficticia de producción** (SEO-1): "[Prueba] Departamento con vista al parque" está publicada en el proyecto del sitio, en la home, el catálogo y el sitemap, sin `noindex`. Archivarla en `/admin` (y revisar PRUEBA-2/3); `docs/INTEGRACIONES.md:233` dice que están en borrador
- [ ] **2 · No perder trabajo** (UX-2, A11Y-3): borrador del asistente de `/vender` en `localStorage`; foco al primer campo inválido tras un envío con errores
- [ ] **3 · Embudo seguro** (SEG-1, SEG-2, SEG-3, SEG-7; incluye el aviso de `zod` de P0): límite por IP y por celular + Turnstile (*OK: servicio externo*), caché corta de `obtenerHorarios`, 1 cita futura por celular, `origen` como lista cerrada, upsert que no pise nombre ni correo de un contacto existente, límite de cuerpo de 1 MB en las acciones públicas
- [ ] **4 · La pantalla no miente** (COPY-3, COPY-4, DIS-6, SEG-5): `noindex` para `PRUEBA-*`; "Colección Exclusiva"/"colección selecta" solo con propiedades; "Ver catálogo privado" → "Ver todo el catálogo"; barra de proyección real o fuera; escape `\\u003c` en `JsonLd.tsx:44`
- [x] **5 · Que compartir funcione** — **hecho 2026-11-06 (D-34):** canonical, OG, sitemap y `robots` en `web.astupropiedad.com`, 308 desde `web-as-tupropiedad.vercel.app` (salvo `/api`), YouTube `@AS-Tupropiedad`. Antes: (SEO-2, SEO-3, SEO-6; *decisión de jforero, P-12*): canonical, `og:image`, logo y sitemap apuntan a `astupropiedad.com`, que hoy da 404 (web anterior). Mientras no se pase el dominio: `NEXT_PUBLIC_SITE_URL=https://web.astupropiedad.com` en Production y 308 desde `*.vercel.app`; YouTube `@AS_Tupropiedad` da 404 (pedir el canal real)
- [ ] **6 · Estados de error** (SEO-5, COPY-5): `not-found.tsx` y `error.tsx` en español (ya anotado en P2 "Cabeceras de seguridad… Pendiente")
- [ ] **7 · Acción principal: hero y ficha** (A11Y-1, REN-2, REN-3, DIS-1/2/3/7/9, UX-1, UX-3, SEO-7): hero legible a 390 px (hoy el 54 % del párrafo < 4,5:1), sin retrasos ni animaciones infinitas, foto limpia (P-11); en la ficha, título/precio/CTA antes de la descripción; resultados antes del formulario en `/simulador-inversion`; hover del botón de `/vender`; CTA de la calculadora de la home
- [ ] **8 · Textos con respaldo** (COPY-1, COPY-2, COPY-6 a COPY-9, COPY-13, COPY-14): amplía la tarea de `/vender` de P2 con el titular "Vendemos más rápido. A mejor precio.", el "No somos…" repetido, adjetivos huecos y mayúsculas a la inglesa
- [ ] **9 · Alerta cuando falle el envío a GHL** (hoy solo `console.error`)
- [ ] **10 · Móvil** (A11Y-2): menú que se cierre al tocar fuera y bloquee el scroll; objetivos de 44 px en el pie (hoy 15 px de alto) y la hamburguesa (40 px)
- [ ] **11 · Rendimiento** (REN-1, REN-4, REN-5/SEG-6): framer-motion fuera del layout (≈ 200 KB de JS comprimido en cada ruta), Server Components para lo estático, Geist Mono solo en `/admin`, caché del PDF por slug
- [ ] **12 · Resto** (SEG-8 a SEG-12, DIS-10 a DIS-24, SEO-7 a SEO-12): CSP Report-Only (propuesta en el anexo C del informe), criterio único de radios y botones, `lastmod` de fichas, títulos de ficha ≤ 60, h2 del pie, e2e en CI, correo del administrador fuera de `e2e/admin-con-supabase.ps1`

## P0 — esta semana

- [x] **Mover `Navbar`, `Footer` y `FloatingWhatsApp` a `layout.tsx`** y poner `<main>` por página *(base de varias correcciones; C5)* — 2026-10-05, sesión [01](prompts/01-layout-navbar-main.md)
  - Hecho cuando: ninguna página repite Navbar/Footer; `/propiedades` muestra el menú sin hacer scroll.
- [x] **Crear `src/lib/contact.ts`** y usarlo en navbar, footer, botón flotante *(C2)* — hecho 2026-10-04 (falta: metadata/JSON-LD cuando existan, y las imágenes con teléfono viejo)
  - Hecho cuando: un único teléfono/correo/dominio en todo el sitio; cero apariciones de `51900000000`; `mailto:`/`tel:` en el footer.
- [x] **Arreglar enlaces muertos:** `#vender` → `/vender`; "Catálogo" → `/propiedades`; quitar `(GHL)` visible; redes sociales; "Postular" *(C1)* — 2026-10-05, sesión [02](prompts/02-enlaces-y-contenido-falso.md). Los CTA sin embudo van a WhatsApp con mensaje prellenado; redes y Privacidad/Términos ocultos hasta tener URL/páginas (sesión 09). El formulario de `/vender` sigue sin enviar nada (sesión 05)
  - Hecho cuando: ningún `href="#"` ni botón sin destino (comprobar con `grep` y en navegador a 390 px).
- [x] **Quitar contenido falso:** propiedad de Unsplash, fotos de "equipo" que son edificios, afirmaciones "garantizado" *(C3)* — 2026-10-05, sesión 02. Quedan **pendientes del cliente** las contradicciones entre el catálogo/destacadas y los flyers (ver P-13 en DECISIONES y NEGOCIO-Y-CONTENIDO §4)
  - Hecho cuando: ninguna imagen engañosa; marcadores honestos donde falte dato.
- [x] **Tono "tú" y español natural en todo el sitio** (D-10, cierra P-6 con D-16) — 2026-10-05, sesión [03](prompts/03-tono-tu.md). Guía de voz en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) §3. Quedan anotados (sin tocar): "3.5x" fijo en `/simulador-hipotecario`, promesas absolutas de `/vender` y botón "Enviar datos" sin acción
- [x] **Actualizar `next` y `eslint-config-next`** *(C6)* — 2026-10-16, sesión 10: `16.2.0` → `16.4.2` (la `16.3.8` de la auditoría no era la última parcheada; `latest` del registro y `npm audit` apuntan a `16.4.2`). `npm audit --omit=dev`: 0 avisos (D-23)
  - Hecho cuando: `npm audit --omit=dev` sin críticas; build y lint igual o mejor que la línea base.
- [ ] **Nuevo aviso (visto 2026-10-31, sesión 16):** `npm audit --omit=dev` marca 1 alta en `zod 4.6.5` (GHSA-mrhx-c7xc-m3w5, memoria al validar colecciones enormes; se arregla con `zod 4.6.6`). Ya estaba en `main`; no se actualizó por falta de OK (lista "Pregunta primero"). Sigue igual el 2026-11-05 (SEG-4 de la auditoría completa)
- [x] `.gitignore` completo, `.env.example`, documentación del proyecto (esta carpeta)

## P0 — semana 1: embudo de leads *(Bloque A, C1)*

- [x] *(hecho 2026-10-05, sesión 05; honeypot sí, Turnstile no; envío a GHL probado solo contra un receptor local, no contra GHL real)* Server Action `enviarLead` + validación (zod) + honeypot/Turnstile + envío a GHL
- [x] *(hecho 2026-10-05, sesión 05; el "Broker" es el CTA de `MortgageBasic`)* Conectar: asistente de `/vender`, CTA del simulador hipotecario, CTA del simulador de inversión, "Contactar a un Broker", "Solicitar asesor privado", reclutamiento
- [x] *(hecho 2026-10-05, sesión 05)* Botón de WhatsApp con mensaje prellenado como plan B (`waLink` en `src/lib/contact.ts`, ya existe)
- [x] Páginas `/privacidad` y `/terminos` — **borrador**, 2026-10-16, sesión [09](prompts/09-legal.md). `noindex` y fuera del sitemap hasta poner `LEGALES_EN_BORRADOR = false` en `src/lib/legal.ts`. **Pendiente:** revisión legal y los `[PENDIENTE]` (ver D-22). Casilla extraída a `ConsentCheckbox`
  - Hecho cuando: un lead de prueba llega a GHL con origen, página y consentimiento; el usuario ve confirmación real y error entendible.
- [x] **Pendiente tras la sesión 05 (cambio de método el 2026-10-29, D-27):** en lugar del webhook, enviar los leads por la **API de GHL** (contacto, oportunidad y cita) con la sesión [15](prompts/15-ghl-api.md). *Código, pruebas (Vitest + e2e contra un GHL falso) y variables en Vercel hechos el 2026-10-30; prueba con el GHL real superada el 2026-10-31 (D-27).* Anti-spam adicional (Turnstile, límite por IP) y deduplicación en el servidor siguen sin hacer.

## P0 — semana 1: SEO base *(C4)*

- [x] *(hecho 2026-10-05, sesión 04)* Convertir cada `page.tsx` en Server Component con `metadata` propia (usar los títulos/descripciones de AUDITORIA-WEB §C4)
- [x] *(hecho 2026-10-05, sesión 04)* `metadataBase`, Open Graph/Twitter, canonical, `robots.ts`, `sitemap.ts`, imagen OG
- [x] *(hecho 2026-10-05, sesión 04; solo nombre, URL, teléfono, correo y logo)* JSON-LD `RealEstateAgent` en el layout
  - Hecho cuando: cada ruta tiene título/description únicos; `/robots.txt` y `/sitemap.xml` responden 200; el link se ve bien al pegarlo en WhatsApp. *(Lo primero está verificado; lo de WhatsApp requiere dominio público: cómo probarlo en [SEO.md](SEO.md).)*

## P1 — semanas 2-3

- [x] **Fuente única de propiedades** `src/data/properties.ts` (tipo `Property`) *(C3, Bloque B)* — 2026-10-14, sesión 07. **Pendiente del cliente:** las propiedades reales (hoy solo existe un EJEMPLO que no sale en producción; `PROPIEDADES` está vacío)
- [x] **Fichas** `/propiedades/[slug]` con galería, WhatsApp prellenado, JSON-LD, similares *(Bloque C)* — 2026-10-14, sesión 07. Falta: mapa de zona, formulario "Agendar visita", compartir, zoom de galería
- [x] **Simuladores v2** *(hecho 2026-10-07, sesión 06)*: `src/lib/finance.ts` con pruebas, TEA→TEM, validación de entradas, cronograma, capacidad de pago, alcabala/plusvalía/notariales/IR editables sin valor inicial, USD/PEN con tipo de cambio escrito por la persona, aviso de simulación referencial *(C7, Bloque D)*. El resultado ya viajaba como lead (sesión 05). **Pendiente:** TCEA, seguros/comisiones, y contrastar con un simulador bancario real
- [x] **Analítica + eventos + banner de cookies** *(Bloque G)* — 2026-10-23, sesión [13](prompts/13-analitica-cookies.md) (D-26): banner accesible y "Preferencias de cookies" en el pie; GA4 y píxel de Meta solo tras aceptar y solo con ID; eventos `cta_whatsapp_click`, `lead_enviado`, `formulario_error`, `simulador_calculado`, `propiedad_vista` sin datos personales; sección de cookies en `/privacidad` (borrador); 8 pruebas e2e. **Pendiente:** IDs reales (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`) en Vercel y comprobar la recepción en GA4 Tiempo real / Meta Probar eventos; revisión legal del banner y de la sección de cookies; captura de UTM en la primera visita; `filtro_usado`; Conversions API de Meta
- [x] **Accesibilidad:** labels, `aria-label`, contraste, texto ≥ 12 px, `reducedMotion`, foco visible *(AUDITORIA-WEB §Accesibilidad)* — 2026-10-16, sesión 08 (D-21). axe-core: 0 violaciones en las 8 rutas a 390 y 1280 px. **Pendiente:** lector de pantalla real (NVDA/VoiceOver) y `prefers-reduced-motion` probado en navegador
  - Hecho cuando: `design:accessibility-review` sin críticos; cero `<div onClick>`.

## P2 — mes 2

- [ ] Catálogo avanzado: filtros de precio/dormitorios/m², orden, estado en la URL, vista lista real, favoritos, estado vacío con acción *(Bloque C)*
- [ ] Calendario GHL en `/agendar` y asistente de valoración v2 (Atrás, borrador, validación) *(Bloque E)*
- [x] `next/image` y WebP *(Rendimiento)* — 2026-10-16, sesión 11 (D-24): 5 `<img>`/fondos CSS migrados, PNG de ~1 MB a WebP, imágenes renombradas, lint en 0 advertencias. **Pendiente:** Server Components para contenido estático (Hero, Nosotros y Vender siguen siendo cliente)
- [x] Pruebas: ~~Vitest para `finance.ts`~~ *(hecho 2026-10-07, sesión 06)*, Playwright para flujos críticos; CI con `tsc` + `eslint` + `build` *(Bloque H)* — 2026-10-23, sesión 12 (D-25): 24 pruebas e2e (rutas, menú a 390 px, WhatsApp, simuladores con valores límite, `/vender` contra un webhook falso), GitHub Actions con typecheck + lint + test + build, [PRUEBAS.md](PRUEBAS.md), [DESPLIEGUE.md](DESPLIEGUE.md) y `CHANGELOG.md`. **Pendiente:** e2e en CI, catálogo y fichas (sin propiedades), Firefox/WebKit, axe automático
- [x] Cabeceras de seguridad y `poweredByHeader: false` — 2026-10-16, sesión 10 (D-23). **Pendiente:** CSP en modo Report-Only; `not-found.tsx`/`error.tsx` en español
- [x] `git init` (rama `main`) y limpieza de duplicados — 2026-10-05, 3 commits *(D-12)*
- [x] Conectar el repo con Vercel (previews por rama; producción solo desde `main`, sin asignar dominio todavía) — 2026-10-05, sesión [14](prompts/14-conectar-vercel.md), ver [DESPLIEGUE.md](DESPLIEGUE.md). Preview de `prueba/vercel-preview` en Ready. Pendiente de decidir: P-12 (protección de `main`, dominio, `www`)
- [x] Añadir `<main>` a las 6 páginas internas — resuelto con el `<main id="contenido">` único del layout, 2026-10-05 (sesión 01)
- [x] Revisar a 390 px el preview de Vercel (menú móvil, botón flotante, simuladores) — 2026-10-23, en producción (`web-as-tupropiedad.vercel.app`) a 390 y 1280 px: las 7 rutas sin desbordamiento horizontal, un `<main>`, menú móvil que abre, navega y se cierra, botón flotante y todos los enlaces a `wa.me/51977588905`, ambos simuladores recalculan sin `NaN` (campo vacío → "—" y error en el campo) y `/vender` avanza del paso 1 al 2 (no se envió nada)
- [ ] Textos de `/vender` con afirmaciones sin respaldo ("inteligencia artificial", "marketing de ultra-lujo", "base de datos privada de inversores", "Valoración Gratuita", "inversores pre-aprobados", "tiempo récord"): reescribir según la regla 4 y [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) o confirmarlos con el cliente (visto el 2026-10-23)
- [x] Remoto en GitHub (`jacafor/astupropiedad`) y primer `git push` — 2026-10-05 *(D-12)*. Pendiente: confirmar en GitHub que el repositorio es **privado**

## P3 — continuo

- [ ] Blog/guías en MDX enlazadas a los simuladores
- [ ] Landings por distrito (Miraflores, San Isidro, Surco, Jesús María, La Molina, Callao…)
- [ ] Testimonios, casos reales, reseñas de Google, FAQ
- [ ] Alertas de nuevas propiedades (WhatsApp/correo)
- [ ] Supabase como panel de inventario *(si el equipo lo necesita)*
- [ ] Libro de Reclamaciones y cumplimiento completo. **Preguntar a la asesoría legal (anotado 2026-10-16, sin implementar):** ¿aplica el Libro de Reclamaciones virtual a una inmobiliaria que solo capta leads? ¿Qué formato, texto y datos exige (razón social, RUC, domicilio)? ¿Hay que registrarse como agente inmobiliario? ¿Plazos de conservación y de respuesta a derechos ARCO? ¿Hay que inscribir el banco de datos ante la autoridad? ¿Hay transferencia de datos al extranjero (CRM, alojamiento)? ¿Se enviará publicidad (consentimiento aparte)? ¿Texto de cookies cuando haya analítica?

## Definición de "sitio funcional mínimo" (MVP)

1. Un visitante deja sus datos desde cualquier CTA y el asesor lo recibe en GHL y por WhatsApp.
2. Cada propiedad del catálogo tiene ficha propia con datos coherentes y botón de WhatsApp.
3. Los simuladores no devuelven valores imposibles y su resultado puede enviarse como lead.
4. Existen privacidad, términos y consentimiento.
5. Se mide (visitas → leads) para saber qué funciona.

## Línea base de calidad (no empeorar)

| Chequeo | Línea base (16 oct 2026) | Meta |
|---|---|---|
| `npx tsc --noEmit` | limpio | limpio |
| `npm run lint` | 0 errores · 0 advertencias (sesión 11) | 0 / 0 |
| `npm run build` | OK (next 16.4.2; rutas estáticas + `/propiedades/[slug]` SSG) | OK |
| `npm audit --omit=dev` | **Rota desde 2026-10-31: 1 alta en `zod` 4.6.5** (ver P0; 14 avisos en el `npm audit` completo el 2026-11-05). Antes: **0 avisos** (antes: 1 crítica · 2 altas · 1 moderada). `npm audit` completo: 8 (1 moderada, 7 altas), solo en herramientas de desarrollo (cadena de `eslint-config-next`: `fast-glob`/`micromatch`/`braces`, `brace-expansion`, `js-yaml`, `@humanfs/node`); no llegan al sitio | 0 |
| `npm test` | 51 pruebas OK | OK |
| `npm run test:e2e` | 24 pruebas OK (sesión 12) | OK |
| CI (GitHub Actions) | typecheck + lint + test + build (sesión 12) | verde |
| SEO / UX / Accesibilidad | 32 · 36 · ~35 → **62 · 64 · 78** (auditoría completa 2026-11-05; rendimiento 70, seguridad 80, diseño y textos 66, global 70) | ≥ 75 · ≥ 70 · ≥ 80 |
