# Auditoría completa — noviembre 2026

**Fecha:** 2026-11-05 · **Rama:** `auditoria-completa-2026-11` (desde `e4fcba7`) · **Tipo:** solo diagnóstico, no se corrigió nada (prompt [18](../prompts/18-auditoria-completa.md)).
**Alcance:** sitio público y `/admin`, en seis áreas: UX de producto, diseño visual y textos, accesibilidad, rendimiento, SEO técnico y seguridad del repositorio completo. Al final se compara con las auditorías de octubre ([AUDITORIA-WEB.md](AUDITORIA-WEB.md) y [AUDITORIA-FUNCIONALIDADES.md](AUDITORIA-FUNCIONALIDADES.md)).

> Igual que las de octubre (D-7), este informe es una **foto**: no se edita al avanzar. El seguimiento vive en [ROADMAP.md](../ROADMAP.md).

## Cómo se midió

| Entorno | Para qué | Notas |
|---|---|---|
| Build de producción local (`npm run build` + `npx next start -p 3055`) | UX, accesibilidad, rendimiento y formularios | Las variables `GHL_*` apuntan al **GHL falso** (`e2e/ghl-falso.mjs`, puerto 3101), así que ningún lead salió de la máquina. Sin variables de Supabase en local, el catálogo local está vacío y `/admin` muestra "no conectado" |
| Producción `https://web-as-tupropiedad.vercel.app` (y `web.astupropiedad.com`) | Cabeceras, robots, sitemap, metadata, enlaces, ficha y PDF | Solo lectura (GET/HEAD con `curl` y el navegador integrado). Nada se envió |
| Navegador integrado a 390 × 844 y 1280 × 800, modo claro y oscuro del sistema | Recorrido, mediciones con JavaScript (Performance API, contraste calculado, tamaños de objetivos, solapes) | El panel del navegador estuvo **oculto** durante la sesión: las animaciones de framer-motion no avanzan y el LCP no se registra. Por eso **no hay LCP ni INP medidos** (ver "No verificado") |
| Código | Lectura con `archivo:línea`, `grep`, `npm audit`, historial git | Sin leer `.env*` ni `.vercel/**` |

**Skills usadas:** `auditor-ux-app-f100k` (UX, termómetro), `design:design-critique` + `ux-elevacion-formula100k` (modo auditoría) + `design:ux-copy` (diseño y textos), `design:accessibility-review` (criterios WCAG 2.1 AA aplicados con mediciones propias), `searchfit-seo:seo-audit` + `technical-seo` + `schema-markup` + `broken-links` (SEO y parte de rendimiento), `security-review` + `engineering:code-review` (seguridad). Las áreas de seguridad, SEO, diseño/textos y la comparación con octubre las hicieron cuatro subagentes en paralelo; **los hallazgos altos los volví a comprobar yo** (marcados ✔ en la tabla).

**Sin autorización en esta sesión** (el prompt la pedía de forma opcional y no se dio): credenciales de prueba de `/admin` y lectura de Supabase/Vercel (`get_advisors`). `/admin` se auditó por código, por la pantalla de ingreso y por la e2e existente.

---

## 1. Resumen ejecutivo

### Notas

| Área | Nota | En una línea |
|---|---|---|
| UX de producto | **64 / 100** 🟡 | Los formularios funcionan de verdad (error honesto, sin duplicados, plan B por WhatsApp); bajan la nota una ficha ficticia publicada, encabezados que prometen lo que no hay y enlaces compartidos sin imagen |
| Diseño visual y textos | **66 / 100** | Tokens y "tú" impecables; el hero de la home no se lee en móvil, hay promesas sin respaldo en `/vender` y textos de plantilla repetidos |
| Accesibilidad (WCAG 2.1 AA) | **78 / 100** | Etiquetas, foco, menú con teclado, un `<main>` y un `<h1>`, nada < 12 px; falla el contraste del hero en móvil |
| Rendimiento | **70 / 100** | Imágenes ligeras y páginas estáticas con caché; ~200 KB de JS comprimido en cada ruta (framer-motion en el layout) y el titular del hero arranca invisible |
| SEO técnico | **62 / 100** | Metadata, sitemap y `noindex` de `/admin` bien hechos; el canonical y la imagen OG apuntan a un dominio que hoy da 404 y hay una ficha ficticia indexable |
| Seguridad | **80 / 100** | `/admin` con doble barrera (acción + RLS), sin secretos en el historial; el formulario público no tiene límite de envíos |
| **Global** | **70 / 100** | Media simple de las seis áreas |

Frente a la línea base de octubre (D-8: SEO 32 · UX 36 · accesibilidad ≈ 35) el avance es grande, pero **todavía no se alcanza la meta SEO ≥ 75** y la de UX ≥ 70 queda a 6 puntos. Accesibilidad (≥ 80) está a 2 puntos.

### Los 5 problemas más graves

1. **Hay una propiedad ficticia publicada en producción** (SEO-1 ✔). "[Prueba] Departamento con vista al parque", US$ 250 000, aparece en la home, en `/propiedades`, en `sitemap.xml`, con JSON-LD `Offer` "InStock" y **sin `noindex`**; `docs/INTEGRACIONES.md:233` dice que está en borrador. Rompe la regla 1 y la confianza en el catálogo. Arreglo de 2 minutos en `/admin` (archivarla) más `noindex` para `PRUEBA-*`.
2. **Canonical, imagen OG, logo del JSON-LD y sitemap apuntan a `astupropiedad.com`, que hoy redirige a la web anterior y da 404** (SEO-2 ✔). Un enlace compartido por WhatsApp sale sin imagen y Google recibe un canonical roto. Es la consecuencia, ya comprobada, del pendiente P-12.
3. **El hero de la home no se lee en móvil** (A11Y-1 ✔ medido). A 390 px el 54 % del párrafo blanco al 70 % queda por debajo de 4,5:1 sobre el fondo, y el 30 % del titular por debajo de 3:1, porque el degradado no cubre el ancho. Además, el fondo es el banner con el teléfono viejo (P-11) y los botones aparecen a los 1,5 s.
4. **El formulario público de leads no tiene límite de envíos ni anti-bot** (SEG-2, SEG-3). Un script puede crear contactos y oportunidades basura y **ocupar todas las citas de 14 días** del calendario de llamadas; `obtenerHorarios` llama a GHL sin caché con el mismo token que los leads. Y el *upsert* deja que alguien que conozca el celular de un cliente le cambie el nombre o el correo en GHL (SEG-1).
5. **Promesas sin respaldo en `/vender`**, empezando por el titular "Vendemos más rápido. A mejor precio." (COPY-1, COPY-2 ✔): "inteligencia artificial", "inversores pre-aprobados", "tiempo récord", "Valoración Gratuita". Riesgo ante INDECOPI y regla 4.

### Lo que está bien (breve)

- **Embudo de leads de punta a punta** (probado contra el GHL falso): errores por campo en español, el doble clic no duplica (una sola llamada `POST /contacts/upsert`), si GHL cae se conserva lo escrito y se ofrece WhatsApp con los datos ya puestos, y la e2e cubre cita, cita fallida, oportunidad fallida y GHL caído.
- **`/admin`**: cada Server Action llama a `requerirAdmin()` (`acciones.ts:111, 150, 169, 188, 242, 260, 277, 297`) y la RLS lo repite; subida de fotos con verificación del formato real, límite de píxeles, sin EXIF/GPS y ruta generada en el servidor.
- **Sin secretos** en el código ni en el historial git; ninguna `NEXT_PUBLIC_*` es secreta; GA4/Meta no cargan sin consentimiento ni sin ID; el cron exige `CRON_SECRET` (401 comprobado en producción).
- **Accesibilidad de base**: ningún texto < 12 px, ningún campo sin etiqueta, ningún botón de icono sin nombre, un `<main>` y un `<h1>` en las 11 rutas medidas; el menú móvil abre con Enter, el foco entra, Esc lo cierra y devuelve el foco; foco visible (contorno sólido).
- **El botón flotante de WhatsApp no tapa ningún control** al final de ninguna de las 7 rutas medidas, a 390 y 1280 px.
- **SEO de base**: títulos únicos ≤ 60, descripciones de 150-160 en las 7 indexables, sitemap = `RUTAS`, `/admin` y el PDF con `noindex`, imagen OG 1200 × 630, todos los enlaces internos 200.
- **Modo oscuro del sistema**: el sitio se mantiene en claro (D-21) y no aparece ningún contraste roto con `prefers-color-scheme: dark`.

---

## 2. Termómetro de UX (auditor-ux-app-f100k)

**Único trabajo del sitio:** que alguien que quiere comprar, vender o invertir en Lima deje sus datos (o escriba por WhatsApp) a AS Tupropiedad. **Quién:** desde el celular, llegando por redes o WhatsApp. **Acción principal:** enviar un lead o abrir WhatsApp con contexto.

| # | Dimensión | Nota | Por qué (evidencia en la tabla de hallazgos) |
|---|---|---|---|
| 1 | Claridad y un solo trabajo | 6 | El hero dice qué es, pero la home tiene 3 formularios completos (uno de reclutamiento) que compiten (DIS-11) |
| 2 | Primer minuto | 7 | Simuladores útiles sin registro; el hero tarda 1,5 s en mostrar los botones (DIS-3) |
| 3 | Los 4+1 estados | 7 | Vacío del catálogo con acción y errores excelentes; el 404 sale en inglés (SEO-5/COPY-5) |
| 4 | Feedback honesto | 9 | Probado: cargando → éxito real; error honesto con plan B; nunca un "Enviado" falso |
| 5 | No pierde el trabajo | 7 | Si GHL falla, se conserva lo escrito ✔; el asistente de `/vender` se pierde al recargar (UX-2) |
| 6 | La pantalla no miente | 4 | Ficha ficticia publicada (SEO-1), "Colección Exclusiva" y "catálogo privado" sin catálogo (COPY-3/4), barra de proyección decorativa (DIS-6) |
| 7 | Móvil de verdad | 7 | Menú y formularios bien; en la ficha el título, el precio y el CTA quedan debajo de la galería y la descripción (UX-1); hero ilegible (A11Y-1) |
| 8 | Dashboard 1-3-5 | N/A | No hay panel de métricas (sus 10 puntos se reparten) |
| 9 | Puertas: acceso | 7 | `/admin` sin sesión redirige a ingreso con mensaje claro; no se probó con sesión (sin credenciales) |
| 10 | Salir al mundo | 4 | Al compartir no hay imagen (SEO-2); YouTube del pie da 404 (SEO-6) |

**58 / 90 verificables → 64 / 100 · 🟡 "Funciona, pero se siente a medias".**
**Los 3 arreglos que más mueven la aguja:** (1) archivar la ficha de prueba y condicionar los encabezados del catálogo; (2) decidir el host del canonical/OG (P-12) para que compartir funcione; (3) hero legible en móvil, sin retrasos y sin el banner viejo.

---

## 3. Tabla de hallazgos

**Columnas:** el prefijo del ID es el área (UX = UX de producto · A11Y = accesibilidad · REN = rendimiento · DIS = diseño visual · COPY = textos · SEO = SEO técnico · SEG = seguridad). Severidad: crítica / alta / media / baja. Esfuerzo: S (< 1 h), M (medio día), L (> 1 día). ✔ = verificado de nuevo por el consolidador. **No hay hallazgos críticos de seguridad.**

### 3.1 UX de producto, accesibilidad y rendimiento (recorrido propio)

| ID | Sev. | Ruta o archivo:línea | Qué pasa | Evidencia | Impacto en el negocio | Arreglo propuesto | Esf. |
|---|---|---|---|---|---|---|---|
| A11Y-1 ✔ | **Alta** | `/` a 390 px · `src/components/Hero.tsx:28` (degradado), `:56` (`text-white/70`) | El texto del hero queda sobre la parte de la foto que el degradado `from-dark/95 via-dark/70 to-transparent` no oscurece. Falla WCAG 1.4.3 | Medido componiendo `portada.jpg` (con `object-cover`) bajo el degradado y calculando la razón WCAG en una rejilla de puntos de cada texto: párrafo `text-white/70` **54 % de los puntos < 4,5:1** (desde x = 159 px; peor 1,18:1); h1 **30 % < 3:1** (desde x = 267 px; peor 1,26:1); botón "Vender mi propiedad" peor 1,26:1. A 1280 px no se pudo medir (el cálculo superó el tiempo) | La primera frase del sitio no se lee en el celular, que es por donde llega el público | Capa `bg-dark/80` en móvil y el degradado lateral solo desde `md:`, o degradado de abajo arriba; volver a medir | S |
| UX-1 ✔ | Media | `/propiedades/[slug]` a 390 px · `src/components/FichaPropiedad.tsx:111` (descripción) y `:143` (h1) | En móvil el orden es galería → descripción → características → **título, precio y "Consultar por WhatsApp"**. Quien abre la ficha desde WhatsApp tiene que desplazarse para ver el precio y el CTA | `main.innerText` en producción a 390 px: "VOLVER AL CATÁLOGO / Descripción … Ascensor / Terraza / Cocina equipada / VENTA / DEPARTAMENTO / [Prueba] Departamento… / US$ 250,000 … CONSULTAR POR WHATSAPP" | Menos consultas desde la ficha, que es la página que más se comparte | Poner el bloque del h1, precio y CTA antes de la descripción en el DOM (también arregla SEO-7) y ordenar las columnas en escritorio con `order-*` | S |
| UX-2 | Media | `/vender` · `src/app/vender/VenderClient.tsx` | El asistente de 3 pasos guarda su estado solo en `useState`: al recargar o volver desde WhatsApp se pierde lo elegido | `grep localStorage\|sessionStorage` en `VenderClient.tsx` y `LeadForm.tsx` → 0. **No se recargó en el navegador** (el panel oculto congela las transiciones del asistente; la e2e `vender.spec.ts` sí recorre los 3 pasos) | Un vendedor que se distrae vuelve a empezar; es el lead más valioso | Borrador en `localStorage` con `try/catch`, que se borra al enviar | S |
| UX-3 | Media | `/` · `src/components/InvestmentSmarter.tsx` | La calculadora de rentabilidad de la home no tiene CTA ni enlace al simulador completo | Hallazgo F#13 de octubre, sigue abierto (anexo A) | Se calcula y no pasa nada: no hay siguiente paso | Enlace "Ver el análisis completo" a `/simulador-inversion` con los valores en la URL | S |
| UX-4 | Baja | `/admin/ingresar` (local, sin Supabase) · `src/app/admin/ingresar/` | Sin variables, la pantalla muestra texto técnico ("Faltan las variables NEXT_PUBLIC_SUPABASE_URL… Ver docs/INTEGRACIONES.md") | `document.body.innerText` en local | Solo en desarrollo o previews mal configurados; producción sí está conectada | Aceptable (pantalla interna); opcional: mensaje para quien administra | S |
| A11Y-2 ✔ | Baja | Pie (todas las rutas) y `Navbar.tsx` (`#boton-menu-movil`) | Objetivos táctiles pequeños: enlaces de redes del pie de **15 px de alto** (77 × 15, 84 × 15…), "Coordinar por WhatsApp" 203 × 15, hamburguesa **40 × 40**. WCAG 2.1 AA no fija mínimo (2.5.5 es AAA), pero DISENO §4 recomienda 44 px | `getBoundingClientRect()` a 390 px en 8 rutas | Toques fallidos en el pie desde el celular | `py-3` (o `min-h-11`) en los enlaces del pie y `p-3` en la hamburguesa | S |
| A11Y-3 | Baja | `src/components/LeadForm.tsx` | Tras un envío con errores el foco no se mueve al primer campo inválido (el aviso "Revisa los campos marcados…" sí tiene `role="alert"`) | `grep "focus()" LeadForm.tsx` → 0; después del envío fallido `document.activeElement` = `BODY` | Quien navega con teclado o lector tiene que buscar el error | Llevar el foco al primer `aria-invalid="true"` | S |
| A11Y-4 | Baja | Ficha · `FichaPropiedad.tsx:111` vs `:143` | El h2 "Descripción" va antes del h1 en el DOM (= SEO-7) | Ver SEO-7 | Lector de pantalla lee la jerarquía al revés | El mismo arreglo de UX-1 | S |
| REN-1 ✔ | Media | `src/components/Providers.tsx:3` (en el layout), `Navbar.tsx`, `FloatingWhatsApp.tsx` + 13 componentes más | framer-motion entra en **todas** las rutas porque el layout lo usa (MotionConfig, barra y botón flotante). Cada ruta descarga ≈ **200 KB de JS comprimido (≈ 650 KB descomprimido)**, también páginas casi estáticas como `/privacidad` | Performance API con caché vacía: `/simulador-hipotecario` 197 KB / 636 KB, `/simulador-inversion` 198 / 639, `/` 202 / 654 (encoded / decoded). `grep -rl framer-motion src` → 16 archivos; 31 archivos `"use client"`. `npm run build` (Next 16) no imprime el peso por ruta | Más tiempo hasta que se pueda tocar en celulares de gama media y datos móviles | Animaciones de la barra y el botón flotante con CSS (`motion-safe:`); `PropertyZones`, `Servicios`, `Nosotros` y partes del Hero como Server Components; `LazyMotion` + `m` donde quede framer | M |
| REN-2 ✔ | Media | `src/components/Hero.tsx:34-37, 43-46, 53-56, 63-66` | El h1 se sirve con `opacity: 0` y aparece con 0,7 s de retraso + 1 s; el párrafo a 1,2 s y los botones a 1,5 s (= DIS-3) | Código; en el HTML de producción el h1 llega con `style="opacity:0…"` (anexo A, H-4) | Retrasa la primera acción y probablemente el LCP (no medido, ver §5) | Titular sin animar; botones con ≤ 0,15 s de retraso y ≤ 0,4 s de duración | S |
| REN-3 | Baja | `src/components/Hero.tsx:15-16` | El fondo de 100vw hace zoom infinito (20 s, `repeat: Infinity`) | Código (= DIS-2) | Trabajo continuo de GPU y batería en móviles | Una sola pasada o fondo estático | S |
| REN-4 | Baja | `src/app/layout.tsx:2, 20` | Geist Mono se declara en el layout de todo el sitio aunque solo la usa `/admin`; cada página pide 3 fuentes | `performance.getEntriesByType('resource')` → 3 `woff2` en todas las rutas | Una descarga de más por página | Declararla solo en `src/app/admin/layout.tsx` | S |
| REN-5 | Baja | `src/app/propiedades/[slug]/ficha.pdf/route.ts:9-25` | El PDF se genera en cada petición que no sale de la CDN (sharp + react-pdf). En producción: **317 KB, 0,58 s** en frío y luego `X-Vercel-Cache: HIT` (Age 163 s) | `curl` (2 peticiones) | Coste de funciones si alguien lo automatiza (= SEG-6) | Caché por slug en el servidor con la etiqueta `propiedades` | M |

**Rendimiento medido que está bien:** TTFB local 4-19 ms; en producción (desde esta máquina) 0,41-0,54 s y página de 52-88 KB de HTML; imágenes servidas por `next/image` de 15-53 KB a 390 px (portada 20 KB, flyer de `/nosotros` 53 KB) y 24 KB a 1280 px; **CLS = 0** en las 9 rutas medidas; sin desbordamiento horizontal a 390 ni a 1280 px; home, catálogo, fichas y sitemap estáticos con revalidación de 1 h (salida del build).

### 3.2 Diseño visual y textos

Tabla del subagente (código, con skills de crítica de diseño, elevación visual y textos). Cambios del consolidador: **DIS-1 baja de alta a media** (comprobé `portada.jpg`: muestra 940 215 027 arriba a la izquierda, pero a 1280 px queda bajo el 95 % de la capa `dark` y a 390 px el recorte `object-cover` lo deja fuera; sigue siendo el antipatrón §7 y P-11); **DIS-4 queda medido como A11Y-1**.

| ID | Sev. | Archivo:línea | Qué pasa | Evidencia | Impacto en el negocio | Arreglo propuesto | Esf. |
|---|---|---|---|---|---|---|---|
| DIS-1 ✔ | Media *(sigue abierto, P-11; el subagente la puso alta)* | `src/components/Hero.tsx:20` | El fondo del hero de la home es `portada.jpg`, que según P-11 lleva incrustado el teléfono viejo **940 215 027**. Es la primera imagen que ve cualquier visita. | `src="/imagenes/portada.jpg"` … `priority` `sizes="100vw"` | Un lead puede llamar a un número que no es de la empresa; contradice la regla 2 (una sola fuente de contacto). | Sustituir por una foto limpia (sin texto ni teléfono) o rehacer `portada.jpg`; decisión de jforero en P-11. | S (cuando haya foto) |
| DIS-2 | Media | `src/components/Hero.tsx:15-16` y `:88-89` | Dos animaciones **infinitas**: el Ken Burns del fondo (`repeat: Infinity`, 20 s) y el indicador "Desliza" que rebota sin fin. DISENO §4 prohíbe animaciones infinitas. `MotionConfig reducedMotion="user"` las corta solo a quien pidió reducir movimiento. | `transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}` · `animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}` | Distrae del CTA y gasta batería y GPU en móviles de gama media (la mayoría del público de Lima). | Ken Burns de una sola pasada (sin `repeat`) o fondo estático; el indicador, estático o un único rebote al cargar. | S |
| DIS-3 ✔ | Media | `src/components/Hero.tsx:43-45`, `:53-55`, `:63-65` | El h1 aparece a los 0,7 s con 1 s de duración, el párrafo a los 1,2 s y los **CTA a los 1,5 s**. El contenido principal arranca invisible (`opacity: 0`). | `transition={{ delay: 0.7, duration: 1 }}` · `transition={{ delay: 1.5 }}` | Retrasa el LCP y la primera acción; en 3G el usuario ve un hero vacío y puede irse. La skill pide entradas ≤ 300 ms y contenido del hero visible de inmediato. | Retrasos ≤ 0,15 s y duraciones ≤ 0,4 s, o el h1 sin animar (solo los CTA con un desplazamiento corto). | S |
| DIS-4 ✔ | Media (medido: ver A11Y-1) | `src/components/Hero.tsx:28` | El degradado del hero va de izquierda a derecha (`to-transparent`); en móvil el texto ocupa todo el ancho y su lado derecho queda sobre la foto sin oscurecer. DISENO §4 pide un degradado que cubra todo el ancho en móvil. | `bg-gradient-to-r from-dark/95 via-dark/70 to-transparent` | Puede que no se lea bien el titular o el párrafo (`text-white/70`) a 390 px. | `bg-dark/80 md:bg-transparent` + el degradado a partir de `md:`, o un `bg-gradient-to-t` en móvil. **Verificar en navegador.** | S |
| DIS-5 | Media | `src/app/nosotros/NosotrosClient.tsx:16` y `src/app/vender/VenderClient.tsx:28` | Los heroes internos usan **flyers** (imágenes con texto, m² y a veces teléfono incrustados) como fondo decorativo, a una opacidad del 10 % y del 20 %. Es el antipatrón §7 ("hero con un banner que ya contiene… teléfono") y va contra §5 (los flyers no son aptos). | `src="/imagenes/flyer-talara-jesus-maria.webp" … opacity-10` · `src="/imagenes/flyer-cordillera-condor-ate.webp" … opacity-20` | Texto fantasma detrás del titular: parece sucio y puede asomar un dato viejo. | Foto limpia o fondo `dark` liso con textura propia. **Verificar en navegador** cuánto se ve el texto del flyer. | S |
| DIS-6 | Media | `src/app/simulador-inversion/SimuladorInversionClient.tsx:256-259` | La barra "Valor hoy → Valor proyectado" es **decorativa**: siempre ocupa el 100 % (`w-full`) con un tope verde fijo; no representa ninguna proporción. | `<div className="h-full bg-primary relative w-full"><div className="absolute top-0 right-0 h-full w-2 bg-secondary">` | "La pantalla no miente": un gráfico que parece un dato pero no lo es resta credibilidad a un simulador financiero. | Ancho = precio / valor futuro (dos tramos: valor hoy + plusvalía) o quitar la barra y dejar las dos cifras. | S |
| DIS-7 | Media | `src/app/simulador-inversion/SimuladorInversionClient.tsx:117-197` | Por debajo de `xl` (1280 px) la columna izquierda se apila entera **antes** que los resultados: 9 campos → la tarjeta azul con el formulario de lead → y recién entonces los resultados. En móvil se pide el contacto antes de mostrar el resultado. | `grid grid-cols-1 xl:grid-cols-12` con el `LeadForm` (l.173-193) dentro de `xl:col-span-4`, antes de `xl:col-span-8` (l.197) | Baja la conversión: se pide el dato antes de entregar el valor; en `/simulador-hipotecario` el orden es el correcto. | Sacar la tarjeta del lead a un bloque posterior a los resultados (o `order-last` en móvil). **Verificar en navegador** a 390 px y 1024 px. | S |
| DIS-8 | Media | `src/app/simulador-hipotecario/SimuladorHipotecarioClient.tsx:102-103` | El `<span>` del h1 tiene `text-6xl` fijo dentro de un h1 `text-5xl md:text-7xl`: en móvil la segunda línea (60 px) es **más grande** que la primera (48 px); en escritorio, más pequeña. La jerarquía se invierte según la pantalla. | `<h1 className="text-5xl md:text-7xl …">Simulador Hipotecario <br/><span className="… text-6xl">Calcula tu cuota.</span>` | Titular desproporcionado y posible desborde a 390 px ("Hipotecario" en 48 px serif black). | Quitar `text-6xl` o usar `text-4xl md:text-6xl`. **Verificar en navegador.** | S |
| DIS-9 | Media | `src/components/LeadForm.tsx:311` (usado en claro en `VenderClient.tsx:153`) | El botón de envío pasa a `hover:bg-white`. En la variante clara va dentro de la tarjeta blanca de `/vender`: al pasar el ratón, el botón principal **desaparece** (blanco sobre blanco, sin borde). | `"flex-1 … bg-secondary text-dark … rounded-sm hover:bg-white …"` | El CTA de la valoración (el lead más valioso) pierde su forma justo cuando se va a pulsar. | En la variante `claro`, `hover:bg-primary hover:text-white` (como `admin/ui.tsx:17`); conservar `hover:bg-white` solo en `oscuro`. | S |
| DIS-10 | Media | Varios: `Hero.tsx:70` (sin radio), `NosotrosClient.tsx:187` (sin radio), `FichaPropiedad.tsx:329` (sin radio), `LeadForm.tsx:311` (`rounded-sm`), `VenderClient.tsx:91,139` (`rounded-xl`), `FeaturedProperties.tsx:87` (`rounded`), `Navbar.tsx:103` (`rounded-sm`) | El CTA principal no tiene un único criterio de radio: dentro de la misma tarjeta de `/vender`, "Continuar" es `rounded-xl` y "Enviar datos para la valoración" es `rounded-sm`. Las tarjetas mezclan `rounded-lg`, `2xl`, `3xl` y `[2rem]`; en la grilla de destacadas, `PropertyCard` (`rounded-3xl`) convive con la tarjeta "Próximamente" `rounded-lg` (`FeaturedProperties.tsx:59`). | Conteo: `rounded-2xl` ×24, `rounded-xl` ×23, `rounded-3xl` ×19, `rounded-sm` ×14, `rounded-lg` ×7, `rounded-[2rem]` ×1 | Sensación de "ensamblado" en lugar de marca boutique coherente. | Fijar en DISENO §3: botones `rounded-sm` (o ninguno), campos `rounded-xl`, tarjetas `rounded-3xl`; extraer un `<BotonPrincipal>` compartido. | M |
| DIS-11 | Media | `src/app/page.tsx:22-28` (+ `PersonalShopper.tsx:69`, `MortgageBasic.tsx:480`, `PhilosophyAndTeam.tsx:145`) | La home tiene **3 formularios completos** (asesor privado, hipoteca y reclutamiento), además de los CTA del hero. El de reclutamiento compite con los de clientes en la página de conversión. | Tres `<LeadForm …>` en secciones distintas de `/` | Diluye la atención y alarga la página en móvil; mezcla captación de clientes con postulantes. | Dejar uno principal (asesor) y en los demás un CTA que lleve a su página o a WhatsApp; mover reclutamiento a `/nosotros`. | M |
| DIS-12 | Baja | `src/app/propiedades/PropiedadesClient.tsx:34`, `SimuladorHipotecarioClient.tsx:94`, `SimuladorInversionClient.tsx:87` | El hero interno se desvía del patrón `pt-40 pb-20`: el catálogo usa `pt-32 pb-12` sobre fondo blanco, sin eyebrow y con un h1 `text-4xl md:text-5xl` (el resto, `text-5xl md:text-7xl`), y los simuladores usan `pb-24`. | `className="pt-32 pb-12 bg-white border-b border-gray-100"` · `className="pt-40 pb-24 bg-primary …"` | Inconsistencia leve entre páginas hermanas. | Documentar la variante "hero compacto" en DISENO §3 o alinear al patrón. | S |
| DIS-13 | Baja | `src/components/PropertyZones.tsx:191` | La sección de zonas no usa el contenedor `max-w-7xl mx-auto px-6 lg:px-12` (rejilla a sangre). | `<div className="grid grid-cols-1 md:grid-cols-4 divide-y …">` directamente en `<section>` | En pantallas ≥ 1600 px las columnas se estiran más que el resto del sitio. **Verificar en navegador.** | Envolver en el contenedor estándar o documentarlo como excepción. | S |
| DIS-14 | Baja | `PropertyZones.tsx:199,202,216`, `ServiciosClient.tsx:248-254`, `VenderClient.tsx:203`, `SimuladorInversionClient.tsx:173-174`, `Footer.tsx:337,342` | Efectos de hover (cambio de color, escala, sombra) en bloques **no interactivos**: parecen clicables pero no hacen nada. | `className="p-12 hover:bg-gray-50 transition-all group …"` + `group-hover:text-primary` · `group-hover:scale-110` | Falsa promesa de interacción (más clics frustrados en escritorio). | Quitar el hover de lo que no es enlace, o convertir la tarjeta en enlace real. | S |
| DIS-15 | Baja | `src/components/MortgageBasic.tsx:426`, `PhilosophyAndTeam.tsx:132`, `PersonalShopper.tsx:13,26`; glass `bg-white/5 border-white/10` en `PersonalShopper.tsx:59,66`, `PhilosophyAndTeam.tsx:140`, `Footer.tsx:337` | Señales leves de "plantilla de IA": manchas de luz con desenfoque (`blur-[100px]`), cristal translúcido repetido sobre fondo liso (sin nada detrás que desenfocar) y marcos girados decorativos. No hay degradados morados. | `bg-primary/20 rounded-full blur-[100px]` · `bg-secondary opacity-10 rounded-full blur-[100px]` | Bajo; resta algo de personalidad propia. | Limitar el resplandor a un único elemento (el hero) y usar superficies `dark` escalonadas en lugar de `white/5`. | S |
| DIS-16 | Baja | `ServiciosClient.tsx:248`, `PropertyCard.tsx:6,14` (`duration-500`, `duration-700`), `Navbar.tsx:61` (`duration-500`), entradas `duration: 0.8`/`1` en `PersonalShopper.tsx:23`, `PhilosophyAndTeam.tsx:105`, `MortgageBasic.tsx:396`, `VenderClient.tsx:38` | Transiciones lentas (500-1000 ms) y `transition-all` generalizado; la skill pide ≤ 300 ms y animar solo `transform`/`opacity`. | `hover:shadow-2xl transition-all duration-500` · `transition={{ duration: 1 }}` | Interfaz que se siente "pesada" al hacer scroll. | Entradas de 0,3-0,4 s; `transition-[transform,box-shadow] duration-200`. | S |
| DIS-17 | Baja | `src/components/FeaturedProperties.tsx:87` | El botón móvil "Catálogo Completo" pasa a `hover:bg-secondary` conservando `text-white` (blanco sobre verde = 2,21:1, par ❌ en DISENO §4). | `bg-primary text-white … hover:bg-secondary` | Solo afecta al hover o pulsación; poco visible en táctil. | `hover:bg-dark`. | S |
| DIS-18 | Baja | `src/components/PersonalShopper.tsx:33` | Clase muerta: `group-hover:brightness-100` sin ningún `group` padre, con `transition-all duration-700`. | `filter contrast-110 brightness-90 group-hover:brightness-100 transition-all duration-700` | Ninguno visible; ruido en el código. | Quitar o añadir `group` al contenedor. | S |
| DIS-19 | Baja | `src/components/FloatingWhatsApp.tsx:21` y `src/lib/ficha-pdf/FichaPdf.tsx:11` | Hex sueltos fuera de `globals.css`: `bg-[#25D366]` (verde de WhatsApp) y una paleta duplicada en el PDF (más `#374151` y `#e5e7eb`, que no son tokens). En el PDF no hay CSS, así que duplicar los valores es inevitable, pero hoy se mantienen en dos sitios. | `bg-[#25D366]` · `const COLOR = { primary: "#014898", secondary: "#7CC04B", dark: "#122137", … texto: "#374151", borde: "#e5e7eb" }` | Desajuste si cambia la marca. | Token `--color-whatsapp` en `@theme`; módulo `src/lib/marca.ts` con los hex que importen el PDF (y que documente el espejo de `globals.css`). | S |
| DIS-20 | Baja | `src/lib/ficha-pdf/FichaPdf.tsx:31,37,46,52` | En el PDF hay textos de 7-8 pt (≈ 9-11 px), en mayúsculas con espaciado entre letras (eyebrow, insignias, etiquetas de datos, pie). La regla de 12 px es para la web, pero el PDF se imprime y se lee en el celular. | `eyebrow: { … fontSize: 8 …}` · `insignia: { … fontSize: 7.5 …}` · `datoEtiqueta: { … fontSize: 7 …}` | Legibilidad de la ficha que se reenvía a los compradores. | Mínimo de 9 pt en etiquetas y de 8,5 pt en el pie. | S |
| DIS-21 | Baja | `src/app/vender/VenderClient.tsx:81` | Las 4 opciones (Departamento, Casa, Oficina, Terreno) usan el mismo icono `Home`. | `<Home className="w-5 h-5 mb-2" aria-hidden="true" />` dentro del `.map` | El icono no ayuda a distinguir las opciones; parece relleno. | `Building2`, `Home`, `Briefcase`, `Trees` (lucide) o sin icono. | S |
| DIS-22 | Baja | `src/app/propiedades/PropiedadesClient.tsx:59-61` | El buscador muestra un bloque azul con lupa que parece un botón, pero es un `<span aria-hidden>` sin acción (el filtro es en vivo). | `<span className="bg-primary text-white p-4 rounded-xl" aria-hidden="true"><Search …/></span>` | Clic sin respuesta = duda de si la búsqueda funciona. | Icono en gris dentro del campo, sin aspecto de botón. | S |
| DIS-23 | Baja | `src/app/simulador-inversion/SimuladorInversionClient.tsx:174` | La tarjeta "¿Quieres revisar estos números?" lleva de fondo un icono `Download` gigante, que sugiere una descarga que no existe. | `<Download className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 …" />` | Confusión menor. | Quitarlo o usar `MessageCircle`. | S |
| DIS-24 | Baja | `src/components/admin/SubirFotos.tsx:172` | `<img>` crudo en el administrador para la vista previa local (URL `blob:`). Está justificado (next/image no aporta nada sobre un blob), pero no lleva comentario que lo explique. | `<img src={p.vista} alt="" className="w-20 h-16 …" />` | Ninguno para el público. | Añadir un comentario que explique la excepción. | S |

| ID | Sev. | Archivo:línea | Qué pasa | Evidencia | Impacto en el negocio | Arreglo propuesto | Esf. |
|---|---|---|---|---|---|---|---|
| COPY-1 ✔ | **Alta** *(sigue abierto, ROADMAP)* | `src/app/vender/VenderClient.tsx:45`, `:63`, `:190`, `:195`, `:199-200` | Afirmaciones sin respaldo en `/vender`: "inteligencia artificial", "marketing de ultra-lujo", "base de datos privada de inversores", "Valoración Gratuita", "inversores pre-aprobados", "Marketing Algorítmico", "Campañas pautadas con IA… en tiempo récord". Ya anotado en ROADMAP; se confirma que sigue en el código. | `Utilizamos inteligencia artificial, marketing de ultra-lujo y nuestra base de datos privada de inversores…` · `Enlazamos tu propiedad directamente con inversores pre-aprobados.` · `…encontrar al comprador ideal en tiempo récord.` | Riesgo de publicidad engañosa (INDECOPI) y de pérdida de confianza si el vendedor pregunta por "la base de inversores". | Reescribir según NEGOCIO §4, por ejemplo: "Preparamos tu propiedad con fotos profesionales, la difundimos en portales y redes, y la mostramos a compradores que ya nos consultaron". O confirmar cada promesa con el cliente. | S |
| COPY-2 ✔ | **Alta** | `src/app/vender/VenderClient.tsx:42` | El titular de `/vender` promete un resultado comparativo sin respaldo: **"Vendemos más rápido. A mejor precio."** No está en la lista del ROADMAP (solo el párrafo y las tarjetas). | `Vendemos más rápido. <br/><span …>A mejor precio.</span>` | Es la frase más visible de la página de captación de vendedores; viola la regla 4 ("sin afirmaciones absolutas"). | "Vende tu propiedad con un plan claro" / "Vende tu departamento en Lima con asesoría de principio a fin" (NEGOCIO §3: promesa concreta). | S |
| COPY-3 | Media | `src/components/FeaturedProperties.tsx:35` | "Ver catálogo **privado**": el catálogo es público (`/propiedades`), así que el enlace dice algo falso. Además la misma ruta tiene 3 nombres: "Ver catálogo privado", "Catálogo Completo" (`:89`) y "Explorar Catálogo" (`Hero.tsx:72`). | `Ver catálogo privado` | "La pantalla no miente"; nombres distintos para un mismo destino. | "Ver todo el catálogo" en los tres sitios. | S |
| COPY-4 | Media | `src/components/FeaturedProperties.tsx:25` y `src/app/propiedades/PropiedadesClient.tsx:39` | "Colección Exclusiva" y "Explora nuestra colección selecta de propiedades." se muestran **aunque no haya ninguna propiedad**: en la home la grilla queda con la sola tarjeta "Próximamente" y en `/propiedades` el subtítulo aparece justo encima del estado vacío "Estamos preparando nuevas propiedades". | `<h2 …>Colección Exclusiva</h2>` · `<p …>Explora nuestra colección selecta de propiedades.</p>` (sin condición) | El encabezado promete lo que la pantalla no tiene. El CTA principal del hero ("Explorar Catálogo") lleva a esa página. **Verificar en producción** cuántas propiedades hay publicadas hoy. | Encabezado y subtítulo condicionados a `propiedades.length`; con 0, por ejemplo "Nuevas propiedades, muy pronto". Valorar ocultar la sección de destacadas si está vacía. | S |
| COPY-5 | Media | `src/app/` (no existe `not-found.tsx` ni `error.tsx` públicos); `src/app/propiedades/[slug]/page.tsx:52` | Sin `not-found.tsx` propio, cualquier 404 (incluida la ficha de una propiedad **archivada**, que da 404 a propósito) muestra la página por defecto de Next **en inglés** ("This page could not be found."). Lo mismo con un error de servidor público. Solo `/admin` tiene `error.tsx`. | `if (!p) notFound();` · `ls src/app` → sin `not-found.tsx` ni `error.tsx` | Quien llega desde un enlace viejo de WhatsApp o Google a una propiedad vendida o archivada ve un error en inglés y sin salida. | `src/app/not-found.tsx` en español: "Esta propiedad ya no está disponible", con botones "Ver catálogo" y "Escríbenos por WhatsApp"; y un `error.tsx` equivalente. | S |
| COPY-6 | Media | `Hero.tsx:58`, `PhilosophyAndTeam.tsx:112`, `NosotrosClient.tsx:50`, `PersonalShopper.tsx:52` | La fórmula "No somos… somos…" se repite 4 veces, con textos intercambiables ("activos de élite", "asesoría de alto nivel", "firma boutique de asesoría patrimonial"). Es una señal típica de texto genérico de IA. | `No somos solo una inmobiliaria. Somos tu equipo estratégico…` · `No somos una agencia tradicional de clasificados. Somos una firma boutique…` · `No somos simples intermediarios; somos asesores integrales…` | Diluye la propuesta de valor; el visitante no sabe qué hace distinto a AS. | Una sola formulación concreta (qué haces, para quién y cómo, por ejemplo "Te acompañamos desde la búsqueda hasta la firma en notaría") y quitar el resto. | M |
| COPY-7 | Media | `src/components/Hero.tsx:39`, `:59`; `ServiciosClient.tsx:37`, `:35`, `:40`; `Footer.tsx:60`; `PersonalShopper.tsx:55` | Adjetivos huecos o sin respaldo: "Lujo y rentabilidad", "activos de élite", "Servicios Exclusivos", "Soluciones 360°", "búsqueda meticulosa", "asesoría experta", "asesor exclusivo". NEGOCIO §3 pide un tono "aspiracional sin adjetivos huecos". | `Lujo y rentabilidad en Lima` · `inversión de activos de élite en el mercado peruano.` · `Servicios <span>Exclusivos.</span>` | El catálogo real (departamentos de 77-113 m² en Jesús María, La Molina o el Callao, según P-13) no encaja con "lujo" ni "élite": hay una brecha entre la promesa y el producto. | Titulares de promesa concreta: "Compra, vende e invierte en Lima con asesoría personal". | S |
| COPY-8 | Media | `src/app/servicios/ServiciosClient.tsx:16`, `src/app/vender/VenderClient.tsx:190` | "home staging, fotografía arquitectónica, recorridos virtuales 360° y campañas dirigidas" se presentan como servicio incluido. NEGOCIO §4 los marca "Mostrar muestra real o quitar" y siguen sin muestra. | `Incluimos puesta en escena de interiores (home staging), fotografía arquitectónica, recorridos virtuales 360° y campañas dirigidas.` | Promesa operativa que, si no se cumple, genera reclamos de vendedores. | Confirmar con el cliente o cambiar a "Podemos incluir…" con un ejemplo real enlazado. | S |
| COPY-9 | Media | Títulos con mayúsculas a la inglesa (Title Case), visibles en serif: `FeaturedProperties.tsx:25` "Colección Exclusiva", `:89` "Catálogo Completo"; `MortgageBasic.tsx:400` "Sincera tu Cuota Mensual."; `NosotrosClient.tsx:48` "Nuestra Cultura Corporativa", `:62` "Enfoque a Resultados"; `ServiciosClient.tsx:13,18,23` "Marketing Acertado para Vendedores", "Estructuración Financiera Integral", "Auditoría Legal Inmobiliaria"; `VenderClient.tsx:63` "Valoración Gratuita", `:194,199` "Red Personal Shopper", "Marketing Algorítmico"; `PropiedadesClient.tsx:38` "Catálogo de Inmuebles"; `SimuladorInversionClient.tsx:102` "Inmobiliaria Avanzado"; `Footer.tsx:60,72` "Servicios Exclusivos", "Vender Propiedad" | En español solo va mayúscula en la primera palabra y en los nombres propios (RAE). Las etiquetas en `uppercase` no se ven afectadas, pero los titulares serif sí. | `Sincera tu <br/><span …>Cuota Mensual.</span>` | Se lee como traducción del inglés; resta naturalidad (D-16). | Pasar a mayúscula inicial ("Colección destacada", "Calcula tu cuota mensual"). | S |
| COPY-10 | Baja | `NosotrosClient.tsx:131-132` y `PhilosophyAndTeam.tsx:135`; `PersonalShopper.tsx:62` y `PhilosophyAndTeam.tsx:120` | Frases repetidas literalmente en dos sitios: "nueva era del sector inmobiliario" y "Ética, Excelencia y Resultados." (con el mismo icono `ShieldCheck`). | `Una nueva era del <br/><span>sector inmobiliario.</span>` · `Únete a la nueva era <br/><span>del sector inmobiliario.</span>` | Sensación de relleno. | Dejar cada lema en un solo lugar. | S |
| COPY-11 | Baja | `src/app/nosotros/NosotrosClient.tsx:58-69` | Rejilla de 4 "valores" de una o tres palabras sin explicación (Transparencia, Compromiso con la excelencia, Atención cercana, Enfoque a Resultados), cada uno con un icono genérico. | `{ icon: Award, title: 'Compromiso con la excelencia' }` | Contenido vacío típico de plantilla; no aporta prueba. | Una línea concreta por valor ("Te mostramos la partida registral antes de que decidas") o quitar la rejilla. | S |
| COPY-12 | Baja | Navbar: `Navbar.tsx:110` "Contacto Directo" (icono de teléfono, abre WhatsApp en otra pestaña) vs `:158` "Hablar con un experto" (móvil, misma pestaña) | El mismo destino tiene nombre, icono y comportamiento distintos en escritorio y en móvil; el icono `Phone` sugiere una llamada y abre WhatsApp. | `<Phone …/><span>Contacto Directo</span>` · `Hablar con un experto` | Expectativa rota al pulsar (se espera una llamada). | "Escríbenos por WhatsApp" con el icono `MessageCircle` en ambos. | S |
| COPY-13 | Baja | `src/app/vender/VenderClient.tsx:20` | El mensaje prellenado concuerda en masculino con cualquier tipo: "quiero vender mi casa en Surco. ¿Pueden **valorarlo**?". | `` `Hola, quiero vender mi ${propertyType.toLowerCase()} en ${district.trim()}. ¿Pueden valorarlo?` `` | Error gramatical en el primer mensaje que lee el asesor. | "¿Pueden hacer una valoración?" (neutro). | S |
| COPY-14 | Baja | `src/app/servicios/ServiciosClient.tsx:24` | "desde la **Promesa de Venta** hasta la firma de Escritura Pública": "promesa de venta" es un término más usado en Chile y Colombia; en el Perú es habitual hablar de "minuta", "arras" o "compromiso de compraventa". Además, "Auditoría Legal Inmobiliaria" (`:23`) suena a un servicio jurídico formal. | `te acompañamos desde la Promesa de Venta hasta la firma de Escritura Pública en notaría.` | Puede chocar con el público peruano o prometer un servicio que no se presta. | Confirmar con el cliente; por ejemplo, "desde la separación y la minuta hasta la firma de la escritura pública en notaría" y "Revisión legal de la propiedad". | S |
| COPY-15 | Baja | `src/components/MortgageBasic.tsx:62-63`, `:398`; `InvestmentSmarter.tsx:259` | Frases hechas: "No dejes tu sueño inmobiliario al azar", "Financiamiento Inteligente", "Tu dinero merece volver a casa" (ambigua: ¿qué significa?). | `No dejes tu sueño inmobiliario al azar. Utiliza nuestro simulador rápido…` | Bajo; resta claridad. | "Calcula cuánto pagarías al mes antes de ir al banco." | S |
| COPY-16 | Baja | `src/components/admin/Publicacion.tsx:54`, `:95` | En el administrador se usa "su enlace **da 404**": es jerga técnica para quien carga las propiedades. | `Archivada: no aparece en el sitio y su enlace da 404.` | Menor (uso interno). | "su enlace deja de funcionar". | S |

### 3.3 SEO técnico

Tabla del subagente (producción con `curl` + código). Cambios del consolidador: **SEO-1 baja de crítica a alta** (el sitio aún no está en el dominio principal, así que el alcance real es limitado, y se arregla en minutos; sigue siendo lo primero que hay que hacer); SEO-13 es el mismo hallazgo que COPY-2. La tabla de metadata por ruta está en el anexo B.

| ID | Sev. | Dónde | Qué pasa | Evidencia | Impacto en el negocio | Arreglo propuesto | Esf. |
|---|---|---|---|---|---|---|---|
| SEO-1 ✔ | **Alta** *(el subagente la puso crítica)* | Supabase de producción (`qjspixcfvnrqhugtuadz`); filtro en `src/app/propiedades/[slug]/page.tsx:45` | La ficha ficticia "[Prueba] Departamento con vista al parque" (ref. PRUEBA-1, US$ 250,000) está **publicada** en producción: sale en la home, en `/propiedades`, en `sitemap.xml`, es indexable (el `noindex` solo cubre ids `EJEMPLO*`) y emite JSON-LD `Offer` "InStock". `docs/INTEGRACIONES.md:233` dice que PRUEBA-1..3 están "en borrador en el sitio". | `GET /propiedades/prueba-departamento-miraflores` → 200, sin meta robots; sitemap `<loc>https://astupropiedad.com/propiedades/prueba-departamento-miraflores</loc>`; home h3 "[Prueba] Departamento con vista al parque"; og:image en `qjspixcfvnrqhugtuadz.supabase.co` | Un visitante (o Google) ve un inmueble falso con precio; incumple la regla 1 (sin datos inventados); daña la confianza en el catálogo. | Pasarla a `borrador` o `archivada` en `/admin` (y revisar PRUEBA-2/3). Opcional: `noindex` también para códigos `PRUEBA-*`. Corregir el `.md` si el estado era otro. | S |
| SEO-2 ✔ | **Alta** (riesgo ya conocido en P-12/D-17, con consecuencia hoy verificada) | `src/lib/contact.ts:64-66` (`SITE_URL`), `layout.tsx:33`, `seo.ts:26-40`, `robots.ts:8`, `sitemap.ts:14`, `JsonLd.tsx:20-23` | Canonical, `og:url`, `og:image`, `twitter:image`, logo del JSON-LD y sitemap apuntan a `astupropiedad.com`, que hoy responde **301 → www (otra web, nginx) → 404** para cualquier ruta interna y para `/opengraph-image`, el logo y el sitemap. Además el código asume "sin www" y el dominio actual redirige a www. | `curl` `https://astupropiedad.com/` → 301 `https://www.astupropiedad.com/`; `www…/propiedades` 404; `www…/sitemap.xml` 404; `curl -L astupropiedad.com/opengraph-image` → 404 | Enlaces compartidos sin imagen; Google ve un canonical roto y un sitemap inexistente: lo más probable es que ignore el canonical o no indexe el sitio nuevo hasta el cambio de dominio. | Decisión de jforero (P-12): o pasar el dominio raíz, o mientras tanto fijar `NEXT_PUBLIC_SITE_URL=https://web.astupropiedad.com` en Vercel Production (sin tocar código) y volver a `astupropiedad.com` al migrar, con 301 desde `web.`. Decidir también www / sin www. | S (config) |
| SEO-3 | Media | Configuración de dominios de Vercel; `robots.ts:7` | `web.astupropiedad.com` y `web-as-tupropiedad.vercel.app` sirven el mismo contenido, 200, sin `noindex` ni redirección entre ellos. | Ver tabla §6 | Contenido duplicado; Google elige el host a su criterio (más aún con el canonical roto de SEO-2). | Redirigir `*.vercel.app` (308) al host elegido desde Vercel → Domains, o `noindex` por host en `proxy.ts`/cabecera condicionada. | S-M |
| SEO-4 ✔ | Baja (= SEG-5) | `src/components/JsonLd.tsx:44` | `.replace(/</g, "<")`: en JavaScript `"<"` **es** `<`, así que el reemplazo no hace nada. La ficha lo hace bien con `"\\u003c"` (`FichaPropiedad.tsx:74`). Hoy no explota porque los datos son fijos y no tienen `<`. | Lectura del código; el HTML servido no contiene `<` ni `<` dentro del bloque | Si algún día un dato de `contact.ts` (o variable) llevara `</script>`, se rompería la página o abriría inyección; contradice la regla de AGENTS.md. | Cambiar a `"\\u003c"`. | S |
| SEO-5 | Media | Falta `src/app/not-found.tsx` (y `error.tsx` raíz) | 404 en inglés ("This page could not be found.") y con **dos `<title>`** (el de la home y el de Next). El código 404 y el `noindex` sí son correctos. Ya anotado en `docs/SEO.md:62`. | `GET /ruta-que-no-existe-xyz` → `404 Not Found`; `<title>AS Tupropiedad \| …</title>` + `<title>404: This page could not be found.</title>` | Mala experiencia en enlaces rotos (fichas archivadas); señal de calidad pobre. | Crear `not-found.tsx` en español con `metadata.title` propio y CTA a `/propiedades` y WhatsApp; `error.tsx` en español. | S |
| SEO-6 ✔ | Media | `src/lib/contact.ts:48` (usado en `Footer.tsx:33` y `JsonLd.tsx:37`) | El enlace de YouTube `@AS_Tupropiedad` da 404. | `curl -L -A "<Chrome>"` → 404 `<title>404 Not Found</title>`; control `@YouTube` → 200 | Enlace roto en el pie de todas las páginas y `sameAs` inválido en los datos estructurados. | Pedir al cliente el canal real (o quitarlo hasta tenerlo). Facebook no se pudo verificar con `curl` (400). | S |
| SEO-7 | Baja | `src/components/FichaPropiedad.tsx:111-112` vs `:143` | En la ficha, el h2 "Descripción" va antes del h1 en el DOM (la columna lateral con el h1 se pinta después). | Posición en el HTML: `id="descripcion"` en el byte 20075, `<h1` en el 21897 | Lectores de pantalla y buscadores leen la jerarquía al revés. | Mover el bloque del h1 antes en el DOM (orden visual con `order-*` de grid). | S |
| SEO-8 | Baja | `src/lib/catalogo/esquema.ts:70-74`, `[slug]/page.tsx:31` | El título de la ficha admite 90 caracteres; con " \| AS Tupropiedad" el `<title>` puede llegar a 107 (> 60). | Código; la ficha actual tiene 58 | Títulos truncados en Google cuando haya fichas reales. | Limitar a ~43 caracteres para el `<title>` (recortar en `generateMetadata`) o avisar en `/admin`. | S |
| SEO-9 | Baja | `src/lib/rutas.ts:71` y `:79` | Descripciones de `/privacidad` (167) y `/terminos` (141) fuera de 150-160. Hoy son `noindex` (D-22). | Medidas del HTML servido | Ninguno hasta que `LEGALES_EN_BORRADOR = false`. | Ajustarlas al quitar el borrador. | S |
| SEO-10 | Baja | `src/app/sitemap.ts:18-21` | Las fichas salen sin `<lastmod>` aunque la tabla tiene una fecha real (`actualizada_en`, `src/lib/catalogo/mapeo.ts:41`). | `sitemap.xml` sin `<lastmod>` | Recrawl más lento de fichas editadas (precio/estado). | Añadir `lastModified` solo a las fichas, con esa fecha. | S |
| SEO-11 | Baja | `src/app/layout.tsx:32-44` → `/admin/ingresar` | `/admin/ingresar` hereda description y `og:*` de la home y el JSON-LD de la marca. Es `noindex`, impacto mínimo. | HTML de `/admin/ingresar` | Ninguno práctico. | Opcional: `description` propia en `admin/layout.tsx`. | S |
| SEO-12 | Baja | `src/components/Footer.tsx` | El pie usa h2 ("Explorar", "Contacto Directo", "¿Hablamos de negocios?") en todas las páginas, mezclados con la jerarquía del contenido. | Extracción de encabezados (§7) | Ruido en el esquema de la página. | Usar `<p>`/`<h2 class="sr-only">` según accesibilidad, o envolver en `<nav aria-label>`. | S |
| SEO-13 | Baja (duplicado de COPY-2) | `src/app/vender/VenderClient.tsx:42`, `:63`, `:199` | h1 "Vendemos más rápido. A mejor precio." y h2 "Valoración Gratuita" / "Marketing Algorítmico": afirmaciones sin respaldo; D-17 descartó "valoración gratuita" en la metadata. | HTML servido de `/vender` | Riesgo de prometer algo no confirmado (regla 4). | Pasarlo a revisión de contenido (`docs/NEGOCIO-Y-CONTENIDO.md`). | S |

### 3.4 Seguridad

Tabla del subagente (repositorio completo, `npm audit`, historial git y `curl` a producción). La revisión zona por zona, las salidas de comandos y lo que se comprobó en `/admin`, Supabase, leads, cron, PDF y analítica están en el anexo D; la propuesta de CSP, en el anexo C. Comprobé de nuevo SEG-4 (`npm audit --omit=dev` → 1 alta en `zod <4.6.6`) y SEG-5 (`JsonLd.tsx:44`).

| ID | Severidad | Archivo:línea | Qué pasa | Evidencia | Impacto en el negocio | Arreglo propuesto | Esfuerzo |
|---|---|---|---|---|---|---|---|
| SEG-1 | **Media** | `src/lib/ghl.ts:236-245` (`cuerpoContacto`), `src/lib/ghl.ts:132-140` (`upsertContacto`), `src/app/actions/lead.ts:36` (acción pública) | Cualquiera, sin sesión, envía un lead con el celular de un cliente que ya existe. `POST /contacts/upsert` encuentra el contacto por la regla de duplicados (teléfono) y **sobrescribe** `firstName`, `lastName`, `email` (si viene) y los campos `origen` y `source_url` con lo que mandó el atacante. También le añade una nota y etiquetas. | Código: el cuerpo del upsert lleva `...separarNombre(lead.nombre)`, `phone`, `email` y `customFields` (ghl.ts:237-244); no se comprueba si el contacto es nuevo. | Integridad del CRM: un tercero que conoce el celular de un cliente puede cambiarle el nombre o el correo en GHL, y el asesor escribiría al correo equivocado. Explotarlo exige conocer el celular, y no filtra datos (la respuesta al navegador es solo `ok`). | Si el contacto ya existía (la respuesta del upsert trae `new: false`), no enviar nombre ni correo: poner lo recibido solo en la nota ("La persona escribió: nombre X, correo Y"). Alternativa: buscar primero por teléfono y crear solo si no existe. | M |
| SEG-2 | **Media** | `src/app/actions/lead.ts:41-43` (solo honeypot), `:80-97`; `src/lib/ghl.ts:208-219` (cita `confirmed`); `.env.example:34-35` (Turnstile previsto, sin uso) | `enviarLead` es una Server Action pública sin límite de envíos por IP o celular y sin CAPTCHA. Solo tiene un honeypot, que un script dirigido se salta. Cada envío crea o actualiza un contacto, crea una oportunidad y, si `origen` es `vender:valoracion` o `home:asesor-privado` con `quiere_cita=on`, **reserva una cita confirmada** en el calendario. `origen` acepta cualquier texto `^[a-z0-9:_.-]{1,80}$` (leads.ts:70-73), así que también se pueden crear etiquetas arbitrarias `origen:<x>` en GHL (ghl.ts:233). | `grep -i turnstile src` → 0 coincidencias. No hay ningún `rate`/`limit` en `src/app/actions/`. | Spam de leads, pipeline contaminado y, lo más dañino, un script puede **ocupar todos los horarios de llamada de 14 días** con citas falsas, y los clientes reales no encontrarían hueco. | (a) Cloudflare Turnstile (ya previsto en `.env.example`) verificado en el servidor antes de llamar a GHL. (b) Límite por IP y por celular (p. ej. regla de Vercel Firewall sobre los POST con cabecera `Next-Action`, o Upstash). (c) Máximo 1 cita futura por celular. (d) Lista cerrada de valores de `origen` (enum). | M |
| SEG-3 | **Media** | `src/app/actions/horarios.ts:14-23`; llamada desde `src/components/SelectorCita.tsx:61` | `obtenerHorarios` es una Server Action pública sin parámetros y **sin caché**: cada llamada hace un `GET /calendars/{id}/free-slots` a GHL con el token privado. Un script que la repita gasta el límite de peticiones de la API de GHL, que es el **mismo token** que usa `enviarLead`. | Código: `crearClienteGhl(config).horariosLibres()` en cada invocación; `cache: "no-store"` en ghl.ts:115. | Si se agota la cuota de GHL (no verificado el número exacto para esta cuenta), los leads reales fallan y caen en "No pudimos enviar tu solicitud". También sube el coste de funciones en Vercel. | Cachear el resultado entre 30 y 60 s en el servidor (`unstable_cache` o `"use cache"` con `cacheLife` corto; los datos no dependen de quién pregunta) y aplicarle el mismo límite por IP de SEG-2. | S |
| SEG-4 ✔ | **Media** (por línea base; riesgo real bajo) | `package.json` (`"zod": "^4.6.5"`), instalado `zod@4.6.5` | `npm audit --omit=dev` ya **no está en 0**: 1 aviso alto en zod < 4.6.6 (GHSA-mrhx-c7xc-m3w5, agotamiento de memoria al validar colecciones enormes con límites). | Salida de `npm audit --omit=dev` (§4). | Riesgo real bajo: los esquemas públicos (`leadSchema`) no tienen arrays. El único array es `caracteristicas` (`esquema.ts:112-124`) y solo lo usa `/admin` con sesión de administrador. Pero rompe la regla "`npm audit --omit=dev` debe seguir en 0". | Actualizar a `zod@4.6.6` (requiere OK: lista "Pregunta primero"). Ya está anotado en ROADMAP línea 35. | S |
| SEG-5 ✔ | Baja | `src/components/JsonLd.tsx:44` | El escape de `<` del JSON-LD **no hace nada**: `replace(/</g, "<")` en JS reemplaza `<` por el mismo carácter `<`. Lo correcto es `"\\u003c"`, como en `FichaPropiedad.tsx:74`. | Lectura del archivo: `JsonLd.tsx:44` usa `"<"` y `FichaPropiedad.tsx:74` usa `"\\u003c"`. | Hoy no se puede explotar: `jsonLdAgente` solo usa constantes de `src/lib/contact.ts`. Pasaría a ser XSS si algún día entra texto editable (por ejemplo desde `/admin`). | Cambiar a `"\\u003c"` y añadir una prueba unitaria. | S |
| SEG-6 | Baja | `src/app/propiedades/[slug]/ficha.pdf/route.ts:9-25`; `src/lib/ficha-pdf/generar.tsx:16-38` | Con un slug válido, cada petición que no viene de la CDN baja hasta 4 fotos de Supabase, las convierte con `sharp` y renderiza el PDF con `@react-pdf`. Solo hay caché en la CDN (`s-maxage=600`, línea 20). Es posible que variar la query string (`?a=1`, `?a=2`…) evite la caché (**no verificado**: no se probó para no generar carga). Con slug inexistente la respuesta es barata (búsqueda en el inventario cacheado → 404). | `curl` a un slug inexistente: 404, `X-Vercel-Cache: MISS`, `Cache-Control: public, max-age=0, must-revalidate` (§5). | Coste o agotamiento del plan de Vercel si alguien automatiza peticiones. No hay riesgo para los datos: solo se generan fichas de propiedades publicadas. | Cachear el PDF por slug en el servidor (`"use cache"` o `unstable_cache` con la etiqueta `propiedades`, que `/admin` ya invalida), o generarlo en el build con `generateStaticParams`. Ignorar la query string. | M |
| SEG-7 | Baja | `next.config.ts:33` | `serverActions.bodySizeLimit: "4.5mb"` se aplica a **todas** las Server Actions, también a las públicas (`enviarLead`, `obtenerHorarios`), que no necesitan más de unos KB. El valor por defecto es 1 MB. | Lectura de `next.config.ts`. | Cada petición abusiva puede mandar 4,5 MB de cuerpo, lo que agrava SEG-2 y SEG-3. Impacto bajo. | Subir las fotos de `/admin` con una URL firmada de Supabase Storage (o un Route Handler propio) y devolver el límite global a 1 MB. | M |
| SEG-8 | Baja | `src/lib/mantener-activo.ts:40-41` | El secreto del cron se compara con `===`, que no tarda lo mismo en todos los casos. Por lo demás, la ruta exige el secreto y, si falta, nadie pasa. | `curl` sin cabecera → **401** `{"ok":false}`; con `Bearer x` → **401** (§5). | Teórico: un ataque por tiempo de respuesta por la red contra un secreto aleatorio no es práctico. | `crypto.timingSafeEqual` sobre los buffers (comprobando antes que midan lo mismo). | S |
| SEG-9 | Baja | `src/proxy.ts:38-40` frente a `:44` | Cuando no hay sesión, la redirección a `/admin/ingresar` sale antes de poner `Cache-Control: private, no-store`. | `curl -I /admin` → `307`, `Cache-Control: public, max-age=0, must-revalidate`. `/admin/ingresar` sí sale con `private, no-cache, no-store`. | Mínimo: es una redirección sin datos. | Poner `no-store` también en la respuesta de redirección. | S |
| SEG-10 | Baja | `supabase/migrations/20261031000000_catalogo_propiedades.sql:178-179` | El bucket `propiedades` es público. Las fotos de propiedades en borrador o archivadas se pueden leer por URL directa. Las rutas son `<uuid>/<uuid>.webp` y no se pueden adivinar, pero una foto que se publicó (y quedó en caché o indexada) **sigue accesible** después de archivar la propiedad. Nadie sin sesión puede listar, subir ni borrar (las políticas de `storage.objects` son solo para `authenticated` + `es_admin()`). | Lectura de la migración (políticas en las líneas 182-197). | Bajo: alguien con el enlace antiguo puede seguir viendo las fotos de un inmueble retirado. | Aceptarlo y documentarlo, o borrar o mover las fotos al archivar. | S |
| SEG-11 | Baja (informativo) | `e2e/admin-con-supabase.ps1:5,12` | El script versionado lleva el **correo de la cuenta de administración** como valor por defecto y la URL y la clave **publicable** del proyecto de Pruebas. La clave publicable es pública por diseño (no es un secreto). | `git log -p --all` → 1 coincidencia de `sb_publishable_…` (enmascarada) en ese archivo. | El correo de inicio de sesión del administrador queda público en GitHub. Facilita phishing dirigido o probar contraseñas; Supabase limita los intentos (429, que `ingresar` maneja en `acciones.ts:66-68`). | Quitar el correo por defecto del parámetro (pedirlo al ejecutar). | S |
| SEG-12 | Informativo | `next.config.ts:4-12` | Sigue sin Content-Security-Policy (decisión D-23). Las demás cabeceras están bien en producción. | `curl -I` (§5). | Sin CSP, un XSS futuro no tendría una segunda barrera. | Probar primero la propuesta Report-Only de §2. | S-M |

---

## 4. Estado de las auditorías anteriores

Cada hallazgo de octubre se comprobó contra el código, `npm`/`grep` y `curl` a producción (tablas completas, con evidencia fila por fila, en el **anexo A**).

| Auditoría | Resuelto | Parcial | Sigue abierto | Empeoró | Bloqueado (cliente) | No verificable | Total |
|---|---|---|---|---|---|---|---|
| [AUDITORIA-WEB.md](AUDITORIA-WEB.md) (C1-C7, §3, §4 y los nuevos N1-N2) | 63 | 14 | 9 | **2** | 5 | 4 | 97 |
| [AUDITORIA-FUNCIONALIDADES.md](AUDITORIA-FUNCIONALIDADES.md) (41 funciones, "No existen", promesas, bloques A-I) | 48 | 23 | 19 | 0 | 7 | 2 | 99 |

- **C1-C7 casi todos resueltos.** Quedan parciales: el calendario del pie (va a WhatsApp, C1·e), el cronograma completo (solo 12 cuotas en pantalla, C1·g), el residuo de `portada.jpg` (C2, P-11) y TCEA/seguros en el simulador (C7·d).
- **Empeoró (2):** N1 = la ficha ficticia publicada (aquí SEO-1) y N2 = `npm audit --omit=dev` ya no está en 0 por `zod` 4.6.5 (aquí SEG-4; ya anotado en el ROADMAP, falta OK para actualizar).
- **Siguen abiertos y son accionables por desarrollo** (lista completa en el anexo A §4): afirmaciones de `/vender` (V-3), 404/`error.tsx` en español (O-7), h1 del hero con `opacity:0` (H-4), CTA de la calculadora de la home (F#13), anti-spam del embudo, alerta si falla GHL, menú móvil que no se cierra al tocar fuera ni bloquea el scroll, cronograma descargable, renta a 5 años constante (C7·h), borrador de `/vender`, UTM de la primera visita, `data-scroll-behavior="smooth"`, clase `hide-scrollbar` inexistente, Server Components, `GHLForm.tsx` muerto (borrarlo requiere OK), CSP Report-Only, e2e en CI y `README.md:5` desactualizado.

---

## 5. Qué no se pudo verificar y por qué

| Qué | Por qué | Cómo cerrarlo |
|---|---|---|
| **LCP e INP por ruta** | El panel del navegador integrado estuvo oculto toda la sesión: el navegador no registra LCP y frena las animaciones. CLS sí se midió (0) | Repetir con el panel visible o con Lighthouse (necesita tu OK por ser herramienta nueva) |
| Capturas fiables a 390/1280 px | Mismo motivo: con el panel oculto las animaciones de entrada no terminan y las capturas salen a medias. Por eso la evidencia visual es **medida** (contraste, tamaños, orden del DOM, solapes) y no capturas | Repetir `/probar-movil` con el panel visible |
| `prefers-reduced-motion` en navegador | El navegador integrado no emula esa preferencia. En código: `<MotionConfig reducedMotion="user">` en `Providers.tsx` y spinners con `motion-safe:` | Probar con la preferencia del sistema activada |
| Paso 2 y 3 del asistente de `/vender` a mano | Las transiciones con `AnimatePresence` no avanzan con el panel oculto. **Cubierto por la e2e** `vender.spec.ts` (7 pruebas: errores, sin cita, con cita, cita fallida, oportunidad fallida, GHL caído, selector con teclado) | — |
| `/admin` con sesión | No se entregaron credenciales de prueba. Se revisó el código de las acciones y páginas; la e2e `admin.spec.ts` cubre el flujo completo contra Supabase de Pruebas solo si se le pasan las variables `E2E_*` | Pasar un usuario de prueba de Pruebas y repetir |
| Avisos de seguridad de Supabase (`get_advisors`), RLS y Storage **vivos**, `disable_signup` | Sin autorización para el conector de Supabase. Se revisaron las migraciones | Autorizar solo lectura |
| Variables en Vercel (que producción apunte al proyecto del sitio y no al de Pruebas) | Sin autorización para el conector de Vercel y `.env*` bloqueado. Importa para SEO-1: la ficha `PRUEBA-1` sale de `qjspixcfvnrqhugtuadz` (el proyecto **del sitio**, según el `og:image`), así que está publicada en la base de producción | Revisarlo al archivar la ficha |
| Facebook `astupropiedadsac` | Facebook responde 400 a `curl` | Abrirlo en un navegador |
| Upsert de GHL frente a contactos existentes (SEG-1) | Prohibido enviar datos a GHL real; se deduce del código | Probar en una subcuenta de pruebas de GHL |
| Cuota de la API de GHL (SEG-3) y si la query string evita la caché del PDF (SEG-6) | No se quiso cargar producción ni consultar el plan de GHL | — |
| Contraste del hero a 1280 px | El cálculo por píxeles superó el tiempo máximo del navegador | Repetir con menos puntos |
| Indexación real, Rich Results, Core Web Vitals de campo | Requieren Search Console u otras herramientas externas | — |
| Lector de pantalla real (NVDA/VoiceOver) | Fuera del alcance de esta sesión (ya estaba pendiente desde D-21) | — |

---

## 6. Plan de arreglos propuesto

Una sesión = un objetivo verificable. Orden de CLAUDE.md: que no se pierda trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → resto. **No hay seguridad crítica**; la seguridad media del embudo va en cuanto se apruebe Turnstile/límite (sesión 3). La sesión 1 no es de código y conviene hacerla hoy.

| # | Sesión (objetivo verificable) | Hallazgos | Necesita OK o dato | Hecho cuando |
|---|---|---|---|---|
| 1 | **Sacar la ficha ficticia de producción** (sin código: archivarla en `/admin` del sitio y revisar PRUEBA-2/3) | SEO-1 | Que jforero la archive (o autorice a Claude con su sesión) | `curl` a la ficha → 404; no aparece en `/`, `/propiedades` ni `sitemap.xml` |
| 2 | **No perder trabajo:** borrador del asistente de `/vender` en `localStorage` y foco al primer error del formulario | UX-2, A11Y-3 | — | Recargar a mitad del asistente conserva los datos (e2e nueva); el foco va al primer campo inválido |
| 3 | **Embudo seguro:** límite por IP y por celular, Turnstile, caché de 30-60 s de `obtenerHorarios`, 1 cita futura por celular, `origen` cerrado, upsert sin pisar nombre/correo de un contacto existente, límite de cuerpo de 1 MB para las acciones públicas, `zod` 4.6.6 | SEG-1, SEG-2, SEG-3, SEG-4, SEG-7 | Turnstile (servicio externo) y actualizar `zod` | e2e: el envío 6 en un minuto se rechaza con mensaje claro; `npm audit --omit=dev` = 0 |
| 4 | **La pantalla no miente:** `noindex` para `PRUEBA-*`, encabezados del catálogo y de destacadas según haya o no propiedades, "Ver todo el catálogo", barra de proyección real o fuera, escape de `JsonLd.tsx`, corregir `INTEGRACIONES.md:233` | COPY-3, COPY-4, DIS-6, SEG-5/SEO-4 | — | Con catálogo vacío no aparece "Colección Exclusiva"; prueba unitaria del escape |
| 5 | **Que compartir funcione (host):** decidir P-12; mientras tanto `NEXT_PUBLIC_SITE_URL=https://web.astupropiedad.com` en Vercel Production y 308 desde `*.vercel.app`; YouTube correcto o fuera | SEO-2, SEO-3, SEO-6 | Decisión de jforero (dominio y `www`); canal de YouTube del cliente | `curl` a canonical, `og:image` y sitemap → 200; enlace de WhatsApp con imagen |
| 6 | **Estado vacío y errores:** `not-found.tsx` y `error.tsx` en español con salida a catálogo y WhatsApp | SEO-5, COPY-5 | — | Ruta inexistente → 404 en español con un solo `<title>` (e2e) |
| 7 | **Acción principal — hero y ficha:** hero legible en móvil (medir de nuevo), sin retrasos ni animaciones infinitas, foto limpia; en la ficha, título/precio/CTA antes de la descripción; resultados antes del formulario en `/simulador-inversion`; hover del botón de `/vender`; CTA de la calculadora de la home | A11Y-1, REN-2, REN-3, DIS-1/2/3/7/9, UX-1, UX-3, A11Y-4/SEO-7 | Foto limpia para el hero (P-11) | Contraste ≥ 4,5:1 en el 100 % de los puntos a 390 px; h1 visible en el HTML del servidor; captura a 390 y 1280 px |
| 8 | **Textos con respaldo:** `/vender` (titular y tarjetas), "No somos…" repetido, adjetivos huecos, mayúsculas a la inglesa, servicios sin muestra | COPY-1, COPY-2, COPY-6 a COPY-9, COPY-13, COPY-14 | Que el cliente confirme o descarte cada promesa | `grep` de las frases → 0; revisión con `design:ux-copy` |
| 9 | **Feedback del equipo:** alerta cuando falle el envío a GHL (correo o aviso, sin datos personales) | Anexo A (monitoreo) | Canal de aviso | Un fallo simulado genera el aviso |
| 10 | **Móvil:** menú que se cierra al tocar fuera y bloquea el scroll; objetivos de 44 px en el pie y la hamburguesa | A11Y-2, anexo A (F#2) | — | `/probar-movil` a 390 px |
| 11 | **Rendimiento:** framer-motion fuera del layout, Server Components para lo estático, Geist Mono solo en `/admin`, caché del PDF por slug | REN-1, REN-4, REN-5/SEG-6 | — | JS por ruta medido antes/después (meta: < 130 KB comprimido en `/privacidad`) |
| 12 | **Resto:** CSP Report-Only (anexo C), consistencia de radios y botones (`<BotonPrincipal>`), SEO bajas (lastmod, títulos de ficha, h2 del pie), e2e en CI, SEG-8/9/10/11 | SEG-8 a SEG-12, DIS-10 a DIS-24, SEO-7 a SEO-12 | CSP: probar en un preview | Cada ítem con su prueba |

**Primera sesión de código recomendada:** la **2** (no perder trabajo), pequeña y sin dependencias; pero antes, **la 1** (archivar la ficha de prueba), que son dos minutos en `/admin` y quita el problema más visible.

---

## 7. Verificación de esta sesión

Comandos del Protocolo de sesión, corridos al final (2026-11-05), con el resultado real:

| Comando | Resultado |
|---|---|
| `npm run typecheck` | OK (sin errores) |
| `npm run lint` | OK: 0 errores · 0 advertencias (línea base intacta) |
| `npm test` | 9 archivos · **121 pruebas OK** |
| `npm run test:e2e` | **41 OK · 2 omitidas** (las de `/admin` contra el Supabase de Pruebas: faltan `E2E_SUPABASE_URL`, `E2E_ADMIN_CORREO` y `E2E_ADMIN_CLAVE`) · 29,9 s |
| `npm run build` | OK (Next 16.4.2; 22 rutas; `/`, `/propiedades` y `sitemap.xml` con revalidación de 1 h) |
| `npm audit --omit=dev` | **1 alta** (`zod <4.6.6`, GHSA-mrhx-c7xc-m3w5): la línea base de 0 está rota (SEG-4) |
| `npm audit` completo | 14 (11 moderadas, 3 altas); solo `zod` llega a producción |

Solo cambió documentación: estas pruebas confirman que el código auditado compila y pasa sus pruebas, no que los hallazgos estén resueltos.

---

## Anexo A — Estado de cada hallazgo de octubre (detalle)

Comprobado por un subagente contra el código y producción (~25 `curl`), sin navegador. El conteo de §4 sale de estas tablas.

### 1. AUDITORIA-WEB.md

#### Críticos C1-C7

| ID | Hallazgo (oct) | Estado | Evidencia actual |
|---|---|---|---|
| C1·a | "ENVIAR DATOS PARA ANÁLISIS" (`/vender`) sin acción | Resuelto | `VenderClient.tsx:153-167` usa `LeadForm`, que llama a `enviarLead` (`actions/lead.ts:32`: honeypot, zod, API de GHL). En esta sesión no se envió ningún lead (la prueba con GHL real figura en ROADMAP con fecha 2026-10-31). |
| C1·b | Área y habitaciones no se guardan | Resuelto | `VenderClient.tsx:14-15,119,124` (estado) y `:159-160` (viajan en el lead). |
| C1·c | "PRE-CALIFICAR AHORA (GHL)" sin acción y con "(GHL)" visible | Resuelto | `grep "(GHL)"` en `src`: 0 resultados. `SimuladorHipotecarioClient.tsx:215-230`: `LeadForm` con el botón "Quiero orientación". |
| C1·d | "SOLICITAR REPORTE COMPLETO (GHL)" sin acción | Resuelto | `SimuladorInversionClient.tsx:177-191`: `LeadForm` con el botón "Hablar con un asesor". El PDF sigue sin existir (ver F#36). |
| C1·e | "ABRIR CALENDARIO GHL" sin acción | Parcial | `Footer.tsx:117-133`: ahora es "Coordinar por WhatsApp". Hay cita por API solo en `/vender` y en el asesor privado (`permiteCita`, `VenderClient.tsx:166`, `PersonalShopper.tsx:75`). No hay calendario en el pie ni página `/agendar`. |
| C1·f | "Contactar a un Broker" sin acción | Resuelto | `MortgageBasic.tsx:140-152`: `LeadForm` con `origen="home-hipoteca:cta"`. |
| C1·g | "Ver Tabla Completa": la tabla no existe | Parcial | `SimuladorHipotecarioClient.tsx:239-248`: tabla con las 12 primeras cuotas. El cronograma completo solo se pide por WhatsApp (`:274-284`) y no se puede descargar. |
| C1·h | "POSTULAR AL EQUIPO" es un `<div>` | Resuelto | `PhilosophyAndTeam.tsx:59-62`: `LeadForm` con `origen="home:reclutamiento"`. |
| C1·i | Hero → `#vender`, un ancla que no existe | Resuelto | `Hero.tsx:74-75`: `href="/vender"`. |
| C1·j | "Ver catálogo privado / Catálogo Completo" → `#contacto` | Resuelto | `FeaturedProperties.tsx:28,86`: `href="/propiedades"`. |
| C1·k | Redes sociales con `href="#"` | Resuelto | `grep 'href="#"'`: 0 resultados. `Footer.tsx:30-42` lee `REDES_SOCIALES` (`contact.ts:45-50`). |
| C1·l | Privacidad y Términos con `href="#"` | Resuelto | `Footer.tsx:145-148`. Las páginas responden 200 con `noindex` (curl). |
| C1·m | Flecha de las tarjetas y "Filtros" sin acción | Resuelto | `PropertyCard.tsx:35-38`: la tarjeta enlaza a la ficha. "Filtros" se quitó (D-20). |
| C2 | Teléfonos y dominios de relleno o inconsistentes | Parcial | El código está unificado: `contact.ts:11-16`, el botón flotante usa `waLink` (`FloatingWhatsApp.tsx:12`) y el pie usa `mailto:`/`tel:` (`Footer.tsx:95-104`). `grep 51900000000\|940428352\|astupropiedad.pe` solo encuentra `GHLForm.tsx:13,25` (código sin uso). Quedan dos residuos: (1) `portada.jpg`, fondo del Hero (`Hero.tsx:20`, precargada en producción), muestra 940 215 027 según P-11, que decide jforero; (2) `GHLForm.tsx` con el dominio `link.as-tupropiedad.pe`. |
| C3·a | Fotos del "equipo" que en realidad son edificios | Resuelto (las fotos reales: bloqueado por el cliente) | `grep "Team Member"`: 0 resultados. D-15: "Pronto conocerás al equipo". |
| C3·b | Propiedad de Unsplash y la misma foto en dos distritos | Resuelto | `grep -i unsplash` en `src` y `next.config.ts`: 0 resultados. La home lee del inventario (`page.tsx:18`) y muestra una tarjeta "Próximamente" (`FeaturedProperties.tsx:53-63`). |
| C3·c | Fichas que contradicen los flyers | Resuelto en código (inventario real: bloqueado por el cliente, P-13) | Datos retirados (D-20). Catálogo en Supabase (`data/inventario.ts`). **Ver N1:** en producción se publica una ficha ficticia. |
| C3·d | Imágenes del catálogo con texto incrustado | Resuelto en el catálogo | Ningún flyer se usa en tarjetas. Nota: los hero de `/nosotros` y `/vender` usan flyers como fondo (`NosotrosClient.tsx:16`, `VenderClient.tsx:28`). |
| C3·e | Cifras sin sustento ("+15 años", "$40M", "8.5 %"…) | Resuelto | `grep` de las cifras: 0 resultados. Los convenios bancarios se repusieron con dato de jforero; falta archivar el respaldo escrito (P-10, bloqueado por el cliente). |
| C3·f | "garantizado" / "100 % segura" | Resuelto | `grep -i garantiz` en el sitio público: 0 resultados (solo aparece la advertencia en `admin/FormPropiedad.tsx:233`). |
| C4·a | El mismo `<title>` en las 7 páginas | Resuelto | curl de 9 rutas: los 9 títulos son distintos. |
| C4·b | Meta description de 80 caracteres e idéntica en todas | Resuelto | curl: descripciones propias de unos 150-160 caracteres por ruta. |
| C4·c | Sin Open Graph ni Twitter | Resuelto | `og:image` presente en las 9 rutas. `/opengraph-image` responde 200 `image/png`. Existe `twitter-image.tsx`. |
| C4·d | Sin canonical ni `metadataBase` | Resuelto (el dominio depende de P-12) | `layout.tsx:33`. El canonical apunta a `https://astupropiedad.com`, que todavía sirve la web anterior (P-12, decisión de jforero). |
| C4·e | `robots.txt` y `sitemap.xml` dan 404 | Resuelto | curl: los dos responden 200. **Ver N1:** el sitemap incluye la ficha de prueba. |
| C4·f | Sin JSON-LD | Resuelto | curl `/`: `RealEstateAgent` con dirección, horario y `sameAs`. La ficha lleva `RealEstateListing`, `Offer` y `Apartment`. No hay `FAQPage` porque no hay FAQ (ver Bloque I). |
| C4·g | `lang="es"` (mejor `es-PE`) | Resuelto | `layout.tsx:53` `lang="es-PE"`. |
| C4·h | No existen páginas de detalle de propiedad | Resuelto | `src/app/propiedades/[slug]/page.tsx`. curl de una ficha: 200. |
| C4·i | Causa raíz: las páginas son `"use client"` | Resuelto | Cada `page.tsx` es un Server Component con `rutaMetadata` y su parte interactiva va en `*Client.tsx`. |
| C5 | Menú invisible en `/propiedades` | Resuelto | `Navbar.tsx:12-27`: `/propiedades` no está en `RUTAS_CON_HERO_OSCURO`, así que la barra sale sólida. `aria-label` en `:119`. |
| C6 | `next` 16.2.0 con vulnerabilidad crítica | Resuelto (**ver N2**) | `node -p require('next/package.json').version` → 16.4.2. Ahora `npm audit --omit=dev` marca 1 alta en `zod`. |
| C7·a | `$∞` y cuotas negativas | Resuelto | `finance.ts:38` (`LIMITES`) con resultados tipados `ok/errores`. `npm test`: 121 OK. |
| C7·b | "Relación cuota/ingreso" fija en 3.5x | Resuelto | `SimuladorHipotecarioClient.tsx:27,42-49`: se calcula con el ingreso que escribe la persona. |
| C7·c | TEA tratada como tasa nominal | Resuelto | `finance.ts:89-90`: `(1+TEA)^(1/12)−1`. |
| C7·d | Sin seguros, comisiones ni TCEA | Parcial | Aviso explícito en `SimuladorHipotecarioClient.tsx:199` ("No incluye seguros… no es la TCEA"). El cálculo no existe (`grep tcea\|seguro` en `finance.ts`: 0). |
| C7·e | Moneda y tasa de referencia sin confirmar | Bloqueado (cliente) | USD/PEN con tipo de cambio que escribe la persona. La TEA de ejemplo de 8,5 % no tiene respaldo (D-19, pendiente de validar). |
| C7·f | Alcabala y plusvalía sin campo para editarlas | Resuelto | `SimuladorInversionClient.tsx:30,32,154,166`. |
| C7·g | El "cap rate" de la home es en realidad rentabilidad bruta | Resuelto | `InvestmentSmarter.tsx:63,73`: "Rentabilidad bruta anual". |
| C7·h | La renta acumulada a 5 años asume una renta constante | Sigue abierto | `SimuladorInversionClient.tsx:273-274`: `ingresoNetoAnual * ANIOS_PROYECCION`, sin crecimiento. |
| C7·i | Campos sin `min`/`max` ni validación | Resuelto | Se valida en `finance.ts` con mensajes por campo (`simuladores.tsx:73-88`, `aria-invalid` y mensaje). |

#### §3 Catálogo

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| Cat-1 | La vista lista no hace nada | Resuelto | El botón se quitó (D-20). `grep viewMode`: 0 resultados. |
| Cat-2 | El chip "Alquiler" siempre da 0 | Resuelto | `PropiedadesClient.tsx:16-19`: solo se muestran operaciones que tienen propiedades. |
| Cat-3 | La clase `hide-scrollbar` no existe | Sigue abierto | Se usa en `PropiedadesClient.tsx:72` y `globals.css` no la define (solo `::-webkit-scrollbar` global, `:39-49`). |
| Cat-4 | "Filtros" y la lupa no hacen nada | Resuelto | "Filtros" se quitó. La lupa es decorativa (`aria-hidden`, `:59-61`) y el filtro funciona en vivo. |
| Cat-5 | Sin estados de carga ni de error | Parcial | Hay estado vacío y "sin resultados" (`:118-155`). No hay `loading.tsx` ni `error.tsx` en el sitio público (solo en `admin/`). |

#### §3 Home y hero

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| H-1 | El fondo del hero es el banner con logo y teléfono viejo | Bloqueado (cliente, P-11 y foto real) | `Hero.tsx:20` sigue usando `portada.jpg` (46 KB, ahora con `next/image`). |
| H-2 | Contraste de `white/70` sobre un degradado que termina transparente | No verificable | Sin navegador en esta sesión. El código no cambió: `Hero.tsx:28` (`to-transparent`) y `:56` (`text-white/70`). |
| H-3 | El botón flotante de WhatsApp tapa "Vender mi propiedad" a 390 px | No verificable | Hace falta navegador. ROADMAP lo da por revisado el 2026-10-23. |
| H-4 | El `<h1>` sale con `opacity:0` y retrasa el LCP | Sigue abierto | curl `/`: `<h1 … style="opacity:0;transform:translateY(30px)">`. `Hero.tsx:42-45` (retraso de 0.7 s). |
| H-5 | Indicador de scroll hecho con `<div onClick>` | Resuelto | `Hero.tsx:85-92`: `motion.button` con `aria-label`. |

#### §3 Enlazado interno

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| EI-1 | El pie usa `<a>` en vez de `next/link` | Resuelto | `Footer.tsx:52-86`: `Link`. |
| EI-2 | Los CTA llevan a anclas del mismo documento | Resuelto | `Hero.tsx:68-75`, `FeaturedProperties.tsx:28,86`. |
| EI-3 | Las tarjetas no son enlaces y no hay migas de pan | Parcial | Las tarjetas ya enlazan (`PropertyCard.tsx:35`). Sin migas de pan ni `BreadcrumbList`: solo "Volver al catálogo" (`FichaPropiedad.tsx:81-85`). |

#### §3 Cumplimiento (Perú)

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| L-1 | Privacidad y términos en `#`; sin consentimiento | Parcial · Bloqueado (asesoría legal) | Páginas en borrador con `noindex` (curl `<meta name="robots" content="noindex, nofollow">`). Casilla `ConsentCheckbox.tsx`. Falta la revisión legal (D-22). |
| L-2 | Libro de Reclamaciones, razón social, RUC | Bloqueado (cliente) | `[PENDIENTE]` decididos (D-22; ROADMAP → Bloqueos). |
| L-3 | Registro de agente inmobiliario | Bloqueado (asesoría legal) | Pregunta anotada en ROADMAP P3. |
| L-4 | El simulador no avisa que no es una oferta vinculante | Resuelto (la TCEA sigue en C7·d) | `SimuladorHipotecarioClient.tsx:199,209`. |
| L-5 | Estadísticas y "garantizado" | Resuelto | Ver C3·e y C3·f. |

#### §3 Accesibilidad (tabla 1-12)

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| A11y-1 | Hamburguesa y botones de icono sin nombre accesible | Resuelto | `Navbar.tsx:119-121` (`aria-label`, `aria-expanded`, `aria-controls`). `FloatingWhatsApp.tsx:20`. |
| A11y-2 | Etiquetas no asociadas a su campo en los simuladores | Resuelto | `simuladores.tsx:61` (`htmlFor={id}`) y `:71` (`id`). |
| A11y-3 | `/vender` solo con placeholder, sin `required` ni `autocomplete` | Resuelto | `LeadForm.tsx:213-243` (`label htmlFor`, `autoComplete="name"/"tel"`, `required`, `type="tel"`). `VenderClient.tsx:116`. |
| A11y-4 | Contrastes por debajo de 4.5:1 | Resuelto (en código) | Los `text-gray-300/400` que quedan están sobre fondos oscuros (`Footer`, hero de `NosotrosClient.tsx:36` y `VenderClient.tsx:44`, `simuladores.tsx:21-24` en la variante oscura). Tokens `secondary-dark` y `muted` (D-21). Sin medición instrumentada en esta sesión. |
| A11y-5 | Texto de 9-10 px | Resuelto | `grep "text-\[(9|10|11)px\]"`: 0 resultados. |
| A11y-6 | Sin `:focus-visible` propio | Resuelto | `globals.css:54-57` (foco global). `PropertyCard.tsx:37` quita el contorno del enlace, pero el `article` lo compensa con `focus-within:ring-2` (`:12`). |
| A11y-7 | Controles hechos con `<div>`/`<li>` clicables | Resuelto | `grep "<div[^>]*onClick\|<li[^>]*onClick"`: 0 resultados. |
| A11y-8 | Animaciones infinitas sin `prefers-reduced-motion` | Resuelto en código (no probado en navegador) | `Providers.tsx:8` `<MotionConfig reducedMotion="user">`. |
| A11y-9 | Falta `<main>`; `<nav>` sin etiqueta | Resuelto | `layout.tsx:71` `<main id="contenido">`. `Navbar.tsx:60` `aria-label="Principal"`. |
| A11y-10 | `alt` genéricos ("Team Member", "AS Logo") | Resuelto | `grep`: 0 resultados. `Footer.tsx:19` con `alt` descriptivo. |
| A11y-11 | Números usados como títulos y saltos de nivel | Resuelto | Se quitaron las cifras. `NosotrosClient.tsx:66` `h3` con el título del valor. |
| A11y-12 | Objetivos táctiles de menos de 44 px | Parcial | Hamburguesa: `p-2` + icono de 24 px = 40 px (`Navbar.tsx:118`). Cumple 2.5.8 AA (24 px), no 2.5.5 AAA (44 px). El conmutador se quitó. |

#### §3 Rendimiento

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| R-1 | Todo es `"use client"` y se hidrata entero | Parcial | Las páginas ya son de servidor y el `Footer` también. Pero hay 31 archivos con `"use client"`, entre ellos contenido estático: `Hero`, `PropertyZones`, `NosotrosClient`, `ServiciosClient`, `VenderClient` y `FeaturedProperties` (ROADMAP P2 lo anota como pendiente). |
| R-2 | `<img>` crudas y flyers PNG de ~1 MB | Resuelto | `grep "<img"` en el sitio público: 0 (solo `og-image.tsx:45`, que es la imagen OG). Ninguno de los 3 PNG de 1.1-1.26 MB está referenciado en `src`. Siguen en `public/imagenes`, junto con otras 6 imágenes sin uso. |
| R-3 | Preload de imágenes bajo el pliegue; hero como fondo CSS | Resuelto | curl `/`: un solo `<link rel="preload" as="image">` (portada). `Hero.tsx:19-25` `Image fill priority`. |
| R-4 | Imagen remota de Unsplash | Resuelto | Ver C3·b. |
| R-5 | Geist Mono se descarga sin usarse | Parcial | `layout.tsx:20-23,54` la sigue cargando en todo el sitio. Solo se usa en `admin/ui.tsx:51-53`. |
| R-6 | `scroll-smooth` sin `data-scroll-behavior="smooth"` | Sigue abierto | `layout.tsx:54` lleva `scroll-smooth`. `grep data-scroll-behavior`: 0 resultados. |

#### §3 Seguridad y configuración

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| S-1 | Sin cabeceras de seguridad; `X-Powered-By` activo | Resuelto (la CSP sigue pendiente por D-23) | curl `-I /`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` y HSTS, sin `X-Powered-By`. `next.config.ts:4-12,24`. No hay CSP, ni siquiera en Report-Only. |
| S-2 | `GHLForm.tsx` inserta un `<script>` crudo y es código muerto | Sigue abierto | `GHLForm.tsx:25` sigue igual. `grep GHLForm` fuera del propio archivo: 0 importaciones. |
| S-3 | Sin secretos en el repo | Resuelto | `.gitignore` ignora `.env` y `.env.*` (salvo `.env.example`). No se leyeron `.env*`. |

#### §3 Higiene del repositorio

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| Hg-1 | `.gitignore` incompleto | Resuelto | `.gitignore`: `node_modules`, `.next`, `.env*`, `*.tsbuildinfo`, `.vercel`, Playwright. |
| Hg-2 | `Imagenes/` duplicada, SVG de plantilla, jpg sin uso, README de plantilla, `legacy/` | Parcial | `public/` solo contiene `imagenes/`, sin SVG de plantilla. `legacy/` e `Imagenes/` ya no existen (D-12). El README es propio pero está desactualizado: `README.md:5` dice "captura de leads… SEO base pendientes". 9 imágenes de `public/imagenes` no se referencian. |
| Hg-3 | Lint con 6 errores y 17 advertencias | Resuelto | `npm run lint`: sin salida de problemas (0/0). |
| Hg-4 | `group-hover` sin `group` padre; iconos sin usar | Parcial | Iconos: lint en 0. `group-hover:brightness-100` sigue sin un `group` padre (`PersonalShopper.tsx:33`; contenedor en `:19-24`). |

#### §3 Voz y contenido

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| V-1 | Mezcla de inglés y español (Elite Portfolio, Off-Market, "(Firm)"…) | Resuelto | `grep` de esos términos: 0 resultados (D-16). |
| V-2 | Abuso de `font-light` gris y mayúsculas, aspecto de plantilla | No verificable | Es un juicio visual y en esta sesión no hubo navegador. |
| V-3 *(relacionado con C3, anotado en el ROADMAP del 2026-10-23)* | Afirmaciones sin respaldo en `/vender` y `/servicios` | Sigue abierto | `VenderClient.tsx:41` ("Vendemos más rápido. A mejor precio."), `:45` ("inteligencia artificial, marketing de ultra-lujo, base de datos privada de inversores"), `:63` ("Valoración Gratuita"), `:195` ("inversores pre-aprobados"), `:200` ("IA… tiempo récord"). `ServiciosClient.tsx:16` ("recorridos virtuales 360°"). `Hero.tsx:59` ("activos de élite"). |

#### §4 Oportunidades

| ID | Oportunidad | Estado | Evidencia actual |
|---|---|---|---|
| O-1 | Fichas `/propiedades/[slug]` | Resuelto | Ver C4·h. Faltan mapa, compartir y agendar visita (Bloque C). |
| O-2 | Landings por distrito | Sigue abierto | `ls src/app`: no existen esas rutas. `PropertyZones.tsx` no tiene enlaces. |
| O-3 | Blog y guías | Sigue abierto | No hay rutas de blog ni MDX. |
| O-4 | Prueba social (testimonios, reseñas, RUC) | Bloqueado (cliente) | No hay contenido. |
| O-5 | Medición GA4/Meta y eventos | Parcial · Bloqueado (P-14) | El código existe (`Analitica.tsx`, `analytics.ts`, `BannerCookies.tsx`). curl `/`: no aparece `googletagmanager` ni `connect.facebook`, es decir, sin IDs en producción. |
| O-6 | Imagen OG, favicon, `manifest` | Parcial | OG y favicon existen (`opengraph-image.tsx`, `favicon.ico`). No hay `manifest` en `src/app`. |
| O-7 | `not-found`, `error` y `loading` en español | Sigue abierto | curl `/no-existe-xyz` → 404 con "404: This page could not be found." (en inglés). No hay `not-found.tsx` ni `error.tsx` públicos. |
| O-8 | `EmptyState` en el catálogo | Resuelto | `PropiedadesClient.tsx:118-155`. |
| O-9 | Pase visual | No verificable | Es trabajo de diseño visual y se hace con navegador. |

#### Hallazgos nuevos (no estaban en octubre)

| ID | Hallazgo | Estado | Evidencia actual |
|---|---|---|---|
| **N1** | **Propiedad ficticia publicada en producción como real e indexable** | **Empeoró** (frente a C3) | curl `/propiedades/prueba-departamento-miraflores`: `<title>[Prueba] Departamento con vista al parque…`, **sin `noindex`**, JSON-LD `Offer` con `"price":250000,"priceCurrency":"USD"`, PDF 200. Aparece en `sitemap.xml` y la home la enlaza (`href="/propiedades/prueba-departamento-miraflores"`). `docs/INTEGRACIONES.md:233` dice que las PRUEBA-1..3 están "en borrador en el sitio": la documentación contradice producción. El `noindex` solo se aplica a ids `EJEMPLO*` (`propiedades/[slug]/page.tsx:45`). No pude ver la causa (base de producción con la ficha publicada o Vercel apuntando a Pruebas) porque no se leen variables. |
| **N2** | `npm audit --omit=dev`: 1 alta en `zod` 4.6.5 | Empeoró (la línea base del ROADMAP es 0) | Salida de `npm audit`: `zod <4.6.6 Severity: high`. `package.json:26` `"zod": "^4.6.5"`. Ya está anotado en el ROADMAP P0. Actualizar requiere OK. |


### 2. AUDITORIA-FUNCIONALIDADES.md

#### Inventario §2 (funciones 1-41)

| # | Función | Estado | Evidencia actual |
|---|---|---|---|
| 1 | Navbar de escritorio | Resuelto | `Navbar.tsx:87-111`. "Contacto Directo" va a `waLink()`. |
| 2 | Menú móvil (aria, Esc, clic fuera, bloqueo de scroll) | Parcial | Resuelto: `aria-*` (`:119-121`) y Esc (`:38-47`). Falta: no se cierra al tocar fuera y no bloquea el scroll del fondo (no hay manejador ni `overflow` en `Navbar.tsx`). |
| 3 | Navbar visible en todas las páginas | Resuelto | Ver C5. |
| 4 | Enlaces del pie | Resuelto | Ver EI-1 y C1·k-l. |
| 5 | Anclas internas (`#vender`) | Resuelto | El Hero va a `/vender`. Las anclas `#inversores`, `#hipoteca` y `#servicios` existen (`InvestmentSmarter.tsx:27`, `MortgageBasic.tsx:47`, `PersonalShopper.tsx:11`). |
| 6 | Página 404 en inglés | Sigue abierto | Ver O-7. |
| 7 | Buscador global | Sigue abierto | No existe. |
| 8 | `/contacto` | Sigue abierto | No existe en `src/app`. El contacto está en el pie, en WhatsApp y en los formularios. |
| 9 | `/privacidad` y `/terminos` | Parcial · Bloqueado (asesoría legal) | Ver L-1. |
| 10 | Hero: "Explorar Catálogo" | Resuelto | `Hero.tsx:68-69` → `/propiedades`. |
| 11 | Hero: "Vender mi propiedad" | Resuelto | `Hero.tsx:74-75`. |
| 12 | Indicador "Scroll" | Resuelto | Ver H-5. |
| 13 | Calculadora de retorno (sin acción al terminar) | Parcial | Rotulada "bruta" (resuelto). No tiene CTA ni enlace: `InvestmentSmarter.tsx` no contiene ningún `Link` ni `href`, y en `:73` el simulador de inversión se menciona en texto plano. |
| 14 | Calculadora hipotecaria rápida | Resuelto | Validación de `finance.ts` (`MortgageBasic.tsx:25-38`) y CTA en `:140-152`. |
| 15 | Propiedades destacadas | Parcial | El código está bien: lee del inventario (`page.tsx:18`) y las tarjetas enlazan. En producción muestra la ficha `[Prueba]` (N1). |
| 16 | "Ver catálogo privado" / "Catálogo Completo" | Resuelto | Ver C1·j. |
| 17 | "Solicitar Asesor Privado" | Resuelto | `PersonalShopper.tsx:69-75` (`LeadForm` con cita). |
| 18 | "Postular al equipo" | Resuelto | Ver C1·h. |
| 19 | Zonas sin enlaces | Sigue abierto | `PropertyZones.tsx:7-44`: solo texto, sin `Link`. |
| 20 | Filtro por tipo ("Alquiler" vacío) | Resuelto | Ver Cat-2. |
| 21 | Búsqueda por distrito (espacios; solo distrito) | Parcial | Recorta espacios e ignora tildes (`PropiedadesClient.tsx:10,23`). Sigue buscando solo por distrito. |
| 22 | Estado vacío genérico | Resuelto | "Ver todas" y WhatsApp (`:136-155`). |
| 23 | Vista cuadrícula/lista | Resuelto (se quitó) | D-20. |
| 24 | Botón "Filtros" | Resuelto (se quitó) | D-20. |
| 25 | Lupa | Resuelto | Decorativa (`:59-61`). |
| 26 | Clic en una propiedad | Resuelto | Ver C1·m y C4·h. |
| 27 | Filtros de precio, dormitorios y m², orden, paginación, mapa, favoritos, compartir, comparar | Sigue abierto | Ninguno existe en `PropiedadesClient.tsx` (ROADMAP P2). |
| 28 | Asistente pasos 1-2 (Atrás, estado, borrador) | Parcial | Botón Atrás (`VenderClient.tsx:131-133`; `onAtras` en `:165`). Área y habitaciones se guardan. No hay borrador: `localStorage` solo aparece en `lib/consentimiento.ts`. |
| 29 | Paso 3: envío | Resuelto | Ver C1·a. Teléfono `type="tel"` validado con zod. Consentimiento con `ConsentCheckbox`. |
| 30 | Promesa "análisis en 10 minutos" | Resuelto (el SLA real está bloqueado, P-9) | `grep "10 minutos"`: 0 resultados. `VenderClient.tsx:164` sin plazo. |
| 31 | Hipotecario: cuota, intereses, total | Parcial | TEA y validación resueltas (C7). Faltan seguros y TCEA (C7·d). |
| 32 | Relación cuota/ingreso | Resuelto | Ver C7·b. |
| 33 | Cronograma completo | Parcial | Ver C1·g. |
| 34 | "PRE-CALIFICAR (GHL)" | Resuelto | Ver C1·c. |
| 35 | Inversión: alcabala y plusvalía sin control | Resuelto | Ver C7·f. Notariales e IR también se pueden editar (`SimuladorInversionClient.tsx:30-73`). |
| 36 | "SOLICITAR REPORTE (GHL)" / PDF | Parcial | La promesa del PDF se retiró y el botón es "Hablar con un asesor" (`:191`). El PDF del simulador no existe (solo hay PDF de las fichas de propiedad). |
| 37 | Botón flotante de WhatsApp | Resuelto (que tape el CTA: no verificable) | `FloatingWhatsApp.tsx:12` con `waLink()` (51977588905 y mensaje prellenado). Ver H-3. |
| 38 | "Contacto Directo" | Resuelto | Número oficial de `contact.ts:11`. Mensaje prellenado (`contact.ts:68-73`). |
| 39 | Calendario de videollamada | Parcial | Ver C1·e. |
| 40 | Correo y teléfono del pie sin `mailto:`/`tel:` | Resuelto | `Footer.tsx:95-104`. |
| 41 | Redes sociales | Resuelto | Ver C1·k. |

#### §2 "No existen" (lista final)

| Función | Estado | Evidencia actual |
|---|---|---|
| Analítica y medición de conversiones | Parcial · Bloqueado (P-14) | Ver O-5. |
| Banner de cookies | Resuelto en código | `BannerCookies.tsx`, `PreferenciasCookies` en el pie. Solo aparece cuando hay IDs (D-26), y en producción no los hay. |
| CRM o backend propio | Resuelto | `lib/ghl.ts` (API v2: contacto, oportunidad y cita) y `actions/lead.ts`. |
| Notificaciones al asesor | No verificable | Se configuran en los flujos de GHL (P-5: flujo de atención y SLA abiertos). |
| Panel para editar propiedades | Resuelto | `src/app/admin/**` con Supabase. curl `/admin` → 307 al ingreso, con `noindex`. |
| Blog | Sigue abierto | Ver O-3. |
| Testimonios | Bloqueado (cliente) | Ver O-4. |
| FAQ | Sigue abierto | No existe en ninguna ruta. |
| Libro de Reclamaciones | Bloqueado (cliente o asesoría legal) | Ver L-2. |
| Privacidad y términos | Parcial · Bloqueado | Ver L-1. |
| Envío de resultados por correo | Sigue abierto | No existe. El resultado viaja al CRM en el lead (`leads.ts:111-121`), no se envía al usuario. |
| PDF o versión imprimible de los simuladores | Sigue abierto | Ver F#36. |

#### §3 Promesas que el sitio no entregaba

| Promesa | Estado | Evidencia actual |
|---|---|---|
| "Análisis en 10 minutos" | Resuelto | Se retiró (F#30). |
| "Reporte PDF para tu banco" | Resuelto | Se retiró. `grep -i pdf` en `SimuladorInversionClient.tsx`: 0 resultados. |
| "Amortización mes a mes" | Parcial | Se muestran 12 cuotas (C1·g). |
| "Pre-calificaciones / ejecutivos asignados" | Resuelto | `grep "pre-calif\|ejecutivos"`: 0 resultados. |
| "Videollamada de 15 min" | Resuelto | `Footer.tsx:121` "coordinamos una videollamada", sin plazo. |
| "Catálogo privado / Off-Market" | Parcial | "Off-Market" se quitó. El texto "Ver catálogo privado" sigue (`FeaturedProperties.tsx:35`) y lleva al catálogo público. |
| "Tour 360°, home staging, campañas con IA" | Sigue abierto | Ver V-3. |
| "Asesor exclusivo" (Personal Shopper) | Resuelto | Hay formulario de intake (F#17). |
| "Portal de Consultores" | Resuelto | `grep`: 0 resultados. Hay formulario de reclutamiento (F#18). |

#### §4 Bloques A-I

| Bloque | Punto | Estado | Evidencia actual |
|---|---|---|---|
| A | Server Action, zod, honeypot, GHL | Resuelto | `actions/lead.ts:32`, `lib/leads.ts:5`, `LeadForm.tsx:190-191` (honeypot). |
| A | Turnstile o reCAPTCHA y límite por IP | Sigue abierto | En `actions/lead.ts` no hay captcha ni límite. Anotado en ROADMAP. |
| A | `after()` para analítica y logs | Resuelto | `actions/lead.ts:26`. |
| A | UTM en el lead | Parcial | Solo se leen de la URL actual (`LeadForm.tsx:62-66`). No se guardan desde la primera visita (pendiente en ROADMAP). |
| A | Plan B por WhatsApp con mensaje armado | Resuelto | `mensajeWhatsApp` en `LeadForm` (`VenderClient.tsx:162`). |
| A | SLA, aviso al asesor y horario visible | Bloqueado (cliente, P-5 y P-9) | El horario se ve en el pie (`Footer.tsx:110-113`). El SLA no está definido. |
| A | Calendario `/agendar` | Parcial | Ver C1·e. |
| B | Fuente única de propiedades | Resuelto | `data/inventario.ts` (Supabase, D-30), con el mismo tipo `Property`. |
| B | Datos y fotos reales | Bloqueado (cliente) | P-13. |
| C | Fichas: galería, WhatsApp prellenado, JSON-LD, similares, PDF | Resuelto | `FichaPropiedad.tsx:160` (WhatsApp), `:171` (PDF), `:184-186` (similares). JSON-LD visto por curl. |
| C | Fichas: mapa, "Agendar visita", compartir, zoom | Sigue abierto | `grep "navigator.share\|mapa\|Agendar"` en la ficha: 0 resultados. |
| C | Catálogo: filtros avanzados, estado en la URL, favoritos, paginación | Sigue abierto | Ver F#27. `grep useSearchParams`: 0 resultados. |
| C | Tarjetas como `<Link>` con `next/image` | Resuelto | `PropertyCard.tsx:14-20,35`. |
| D-1 | `finance.ts` con pruebas | Resuelto | `finance.test.ts`. 121 pruebas OK en total. |
| D-2 | Hipotecario v2 (TEA→TEM, cronograma, capacidad de pago, PEN/USD) | Parcial | Resueltos: TEM, capacidad de pago e ingreso, moneda y cronograma de 12 cuotas. Faltan: seguros, TCEA, descarga CSV/PDF, comparador de plazos y prepagos. |
| D-3 | Inversión v2 | Parcial | Se pueden editar alcabala, plusvalía, notariales e IR, y hay cap rate neto frente a bruta. Faltan: vacancia, comisión de gestión, financiamiento, renta creciente (C7·h), horizonte a 10 años y escenarios. |
| D-4 | Validación de entradas | Resuelto | Ver C7·a e i. |
| D-5 | El resultado viaja como lead | Resuelto | `leads.ts:111-121` (`ctx_*`, incluido `ctx_cap_rate_neto`). Falta el PDF después del lead. |
| D-6 | Guardar el cálculo en `localStorage` o en la URL | Sigue abierto | `grep localStorage\|searchParams` en el sitio: solo `consentimiento.ts`. |
| E | Valoración: Atrás, progreso, área y habitaciones, promesa reformulada | Resuelto | `VenderClient.tsx:57,66` ("Paso N de 3" con `aria-live`), `:131-133` y `:159-164`. |
| E | Borrador en `localStorage` | Sigue abierto | Ver F#28. |
| F | Privacidad, términos, consentimiento y banner | Parcial · Bloqueado (asesoría legal) | Ver L-1 y la fila del banner de cookies. |
| F | RUC, razón social, Libro de Reclamaciones | Bloqueado (cliente) | Ver L-2. |
| F | Cifras y "garantizado" | Resuelto | Ver C3·e y f. Siguen afirmaciones sin respaldo en `/vender` (V-3). |
| G | Analítica y eventos | Parcial · Bloqueado (P-14) | Ver O-5. Falta el evento `filtro_usado` (ROADMAP). |
| G | Aviso inmediato al asesor y recordatorio | No verificable | Depende de los flujos de GHL. |
| G | Monitoreo de errores y alerta si falla GHL | Sigue abierto | Solo hay `console.error` (`actions/lead.ts:121,127,152,159`). Sin Sentry ni alerta. |
| G | Tablero de conversión | Bloqueado o no verificable | Depende de los IDs y de GHL. |
| H | Vitest | Resuelto | `npm test`: 9 archivos, 121 pruebas OK. |
| H | Playwright | Resuelto (no ejecutado en esta sesión) | `e2e/*.spec.ts`: 6 archivos (rutas, navegación, simuladores, vender, analítica, admin). |
| H | CI | Parcial | `.github/workflows/ci.yml:31-43`: typecheck, lint, test y build. No corre las e2e. |
| H | `.gitignore`, README, `.env.example`, actualizar `next` | Parcial | `.gitignore`, `.env.example` y `next` 16.4.2 resueltos. README desactualizado (Hg-2). Vulnerabilidad nueva en `zod` (N2). |
| I | Blog en MDX | Sigue abierto | Ver O-3. |
| I | Landings por distrito | Sigue abierto | Ver O-2. |
| I | Testimonios y reseñas | Bloqueado (cliente) | — |
| I | FAQ | Sigue abierto | No existe. |
| I | Alertas de nuevas propiedades | Parcial | Solo un "avísame" por WhatsApp manual (`PropiedadesClient.tsx:121-124`, `FeaturedProperties.tsx:73`). No hay suscripción. |

---


### 4. Siguen abiertos y son accionables por desarrollo (sin depender del cliente)

Ordenados según la regla del repo: que la pantalla no mienta → acción principal → feedback → móvil → resto. Los que piden OK por "Pregunta primero" van marcados.

1. **N1 · Ficha `[Prueba]` publicada en producción**, con `Offer` de USD 250 000, sin `noindex`, en el sitemap y enlazada desde la home. Hay que despublicarla o archivarla en `/admin` del sitio, o confirmar que Vercel no apunta al proyecto de Pruebas. Además, conviene dar `noindex` a todo id `PRUEBA*` igual que a `EJEMPLO*` (`propiedades/[slug]/page.tsx:45`) y corregir `INTEGRACIONES.md:233`.
2. **V-3 · Afirmaciones sin respaldo** en `/vender` (`VenderClient.tsx:41,45,63,195,200`), `/servicios` (`:16`) y Hero (`:59`): reescribir según la regla 4 (también se puede confirmar con el cliente, pero la reescritura no depende de él).
3. **N2 · `zod` 4.6.5 con vulnerabilidad alta**: subir a ≥ 4.6.6 (*requiere OK: dependencias*).
4. **O-7 / F#6 · `not-found.tsx` y `error.tsx` en español** (hoy el 404 sale en inglés en producción).
5. **H-4 · El `<h1>` del Hero sale con `opacity:0`** (afecta al LCP): la animación de entrada no debería ocultar el titular en el HTML del servidor.
6. **F#13 · La calculadora de rentabilidad de la home no tiene CTA**: enlazar al simulador de inversión o poner un `LeadForm`.
7. **Anti-spam del embudo**: Turnstile y límite por IP en `enviarLead` (*Turnstile es un servicio externo: pedir OK*).
8. **Monitoreo**: alerta cuando falle el envío a GHL (hoy solo hay `console.error`).
9. **F#2 · Menú móvil**: que se cierre al tocar fuera y que bloquee el scroll del fondo. Hamburguesa de 40 px → 44 px (A11y-12).
10. **C1·g / F#33 · Cronograma completo** en pantalla o descargable (CSV), en lugar de solo por WhatsApp.
11. **C7·h · Renta acumulada a 5 años constante**: rotularla así o añadir un crecimiento editable. Resto del Bloque D-3 (vacancia, comisión, escenarios).
12. **E / F#28 · Borrador del asistente de `/vender`** en `localStorage`. **D-6**: guardar el cálculo de los simuladores en la URL.
13. **UTM desde la primera visita** (hoy solo de la URL actual) y el evento `filtro_usado`.
14. **R-6 · `data-scroll-behavior="smooth"`** en `<html>` (`layout.tsx:54`). **R-5 · Geist Mono** cargada en todo el sitio solo por `/admin`.
15. **Cat-3 · Clase `hide-scrollbar`** que no existe. **Hg-4 · `group-hover` sin `group`** (`PersonalShopper.tsx:33`).
16. **R-1 · Server Components para contenido estático** (`PropertyZones`, partes de `Hero`, `Nosotros`, `Servicios` y `Vender`).
17. **S-2 · `GHLForm.tsx`**: código muerto con `<script>` crudo y el dominio viejo `as-tupropiedad.pe` (*borrarlo requiere OK*). **S-1 · CSP en modo Report-Only** (D-23).
18. **CI**: añadir las e2e. **README.md:5** desactualizado.
19. **Bloque C**: ficha con compartir (Web Share), mapa de zona aproximada, "Agendar visita" y migas de pan con `BreadcrumbList`. Catálogo avanzado (F#27). Zonas enlazadas al catálogo (F#19). Búsqueda por más campos que el distrito (F#21).
20. **Bloque I y O**: FAQ, guías o blog, landings por distrito, `manifest`, suscripción a alertas. Su contenido debe cumplir la regla 1, pero la estructura no depende del cliente.

## Anexo B — Metadata por ruta, JSON-LD, sitemap, enlaces y duplicados (producción)

Longitudes medidas en caracteres sobre el texto decodificado. Canonical = `<link rel="canonical">`. Robots = `<meta name="robots">` (+ `X-Robots-Tag` cuando existe).

| Ruta | HTTP | Title (long.) | Description (long.) | Canonical | Robots | Código |
|---|---|---|---|---|---|---|
| `/` | 200 | AS Tupropiedad \| Departamentos y casas en Lima (46) | Boutique inmobiliaria en Lima: compra, vende o invierte… (154) | `https://astupropiedad.com` | — (indexable) | `src/lib/rutas.ts:19-24`, `src/app/layout.tsx:32-44`, `src/lib/seo.ts:14-43`, `src/app/page.tsx:12` |
| `/propiedades` | 200 | Departamentos y casas en venta en Lima \| AS Tupropiedad (55) | Explora departamentos y casas en venta en Lima… (159) | `…/propiedades` | — | `rutas.ts:25-31`, `src/app/propiedades/page.tsx:6` |
| `/vender` | 200 | Vende tu departamento o casa en Lima \| AS Tupropiedad (53) | ¿Quieres vender tu departamento o casa en Lima?… (159) | `…/vender` | — | `rutas.ts:32-38`, `src/app/vender/page.tsx:5` |
| `/simulador-hipotecario` | 200 | Simulador de crédito hipotecario \| AS Tupropiedad (49) | Calcula la cuota mensual, los intereses… (160) | `…/simulador-hipotecario` | — | `rutas.ts:39-45` |
| `/simulador-inversion` | 200 | Calculadora de rentabilidad inmobiliaria \| AS Tupropiedad (57) | Estima la rentabilidad, el flujo mensual… (155) | `…/simulador-inversion` | — | `rutas.ts:46-52` |
| `/servicios` | 200 | Servicios inmobiliarios en Lima \| AS Tupropiedad (48) | Representación de comprador (Personal Shopper)… (159) | `…/servicios` | — | `rutas.ts:53-59` |
| `/nosotros` | 200 | Quiénes somos, boutique inmobiliaria \| AS Tupropiedad (53) | Conoce AS Tupropiedad, boutique inmobiliaria de Lima… (150) | `…/nosotros` | — | `rutas.ts:60-66` |
| `/privacidad` | 200 | Política de privacidad \| AS Tupropiedad (39) | Cómo AS Tupropiedad trata tus datos personales… (**167**) | `…/privacidad` | `noindex, nofollow` (D-22) | `rutas.ts:67-74`, `seo.ts:25`, `src/lib/legal.ts:9` |
| `/terminos` | 200 | Términos y condiciones \| AS Tupropiedad (39) | Condiciones de uso del sitio web… (**141**) | `…/terminos` | `noindex, nofollow` (D-22) | `rutas.ts:75-82` |
| `/propiedades/prueba-departamento-miraflores` (única ficha publicada) | 200 | [Prueba] Departamento con vista al parque \| AS Tupropiedad (58) | Departamento en venta en Miraflores: 110 m², 3 dormitorios… Propiedad ficticia… (158) | `…/propiedades/prueba-departamento-miraflores` | — (**indexable**) | `src/app/propiedades/[slug]/page.tsx:23-46` |
| `/propiedades/…/ficha.pdf` | 200 `application/pdf` | — | — | — | `X-Robots-Tag: noindex` | `src/app/propiedades/[slug]/ficha.pdf/route.ts:22` |
| `/admin` | 307 → `/admin/ingresar` | — | — | — | `X-Robots-Tag: noindex, nofollow` | `next.config.ts:39-40`, `src/proxy.ts:37-41` |
| `/admin/ingresar` | 200 | Ingresar \| Administrador (24) | (hereda la de la home, 154) | ninguno | meta `noindex, nofollow` + `X-Robots-Tag: noindex, nofollow`; `Cache-Control: private, no-store` | `src/app/admin/layout.tsx:4-7`, `src/app/admin/ingresar/page.tsx:9` |
| `/ruta-que-no-existe-xyz` | **404** real | **dos `<title>`**: "AS Tupropiedad \| Departamentos y casas en Lima" y "404: This page could not be found." | (la de la home) | ninguno | `noindex` | sin `src/app/not-found.tsx` |

Open Graph / Twitter en todas las públicas: `og:title`, `og:description`, `og:url` (absoluta a `astupropiedad.com`), `og:site_name`, `og:locale=es_PE`, `og:type=website`, `og:image=https://astupropiedad.com/opengraph-image` (1200×630, alt), `twitter:card=summary_large_image`, `twitter:title/description/image`. En la ficha la imagen es la portada de Supabase (200, `image/webp`, 104 KB). `<html lang="es-PE">` en todas.

### 2. JSON-LD

| Página | Bloque | JSON válido | `<` crudo | Tipos |
|---|---|---|---|---|
| Todas (incluidas `/admin/ingresar` y 404) | `RealEstateAgent` (`src/components/JsonLd.tsx:16-38`, insertado en `layout.tsx:57`) | Sí | No | `RealEstateAgent` + `PostalAddress` + `OpeningHoursSpecification` + `sameAs` (4 redes). Datos de `contact.ts` (D-9, D-28): sin inventar. |
| Ficha | `RealEstateListing` (`src/components/FichaPropiedad.tsx:31-53`, `:72-75`) | Sí | No | `RealEstateListing` con `offers` (`Offer`, `price`, `priceCurrency`, `availability` mapeado a InStock/LimitedAvailability/SoldOut) y `about` (`Apartment`, `numberOfBedrooms`, `numberOfBathroomsTotal`, `floorSize` en `MTK`, `PostalAddress`). Estructura correcta para schema.org. |

- El escape de `<`: la ficha lo hace bien (`"\\u003c"`, FichaPropiedad.tsx:74). El de la marca **no escapa nada** (ver SEO-4).
- `logo` del agente = `https://astupropiedad.com/imagenes/logo-as-tupropiedad.png` → hoy 301 → `www` → **404** (ver SEO-2). En el host del proyecto el archivo existe (200, PNG 410×410).
- `sameAs` incluye un YouTube que da 404 (SEO-6). La ficha de prueba emite una `Offer` de US$ 250,000 "InStock" de un inmueble ficticio (SEO-1).
- Opcional (no es error): `RealEstateListing` no tiene resultado enriquecido propio en Google; `datePosted` sería útil cuando haya fichas reales (la tabla tiene `actualizada_en`, `src/lib/catalogo/mapeo.ts:41`).

### 3. Sitemap, robots y `/admin`

- `robots.txt` (200): `User-Agent: *` / `Allow: /` / `Sitemap: https://astupropiedad.com/sitemap.xml` (`src/app/robots.ts:4-9`). No bloquea `/admin` a propósito (D-30): correcto.
- `sitemap.xml` (200, `src/app/sitemap.ts:11-22`): 7 rutas de `RUTAS` (sin `/privacidad` ni `/terminos`, correcto por D-22) + 1 ficha (`/propiedades/prueba-departamento-miraflores`). No falta ninguna ruta pública; sobra la ficha ficticia (SEO-1). Sin `<lastmod>` (decidido en el comentario de `sitemap.ts:10`; para fichas sí existe fecha real, SEO-10). Host de todas las `<loc>`: `https://astupropiedad.com` (P-12).
- La URL del sitemap anunciada en robots: `https://astupropiedad.com/sitemap.xml` → 301 → `https://www.astupropiedad.com/sitemap.xml` → **404** (servidor `nginx/1.23.3`, la web anterior).
- `/admin`: `curl -I` → `307`, `Location: /admin/ingresar`, `X-Robots-Tag: noindex, nofollow`. `/admin/ingresar`: `200`, `X-Robots-Tag: noindex, nofollow`, meta robots `noindex, nofollow`. Correcto.
- Ficha PDF: `X-Robots-Tag: noindex` ✔ (route.ts:22).

### 4. Página 404

`GET /ruta-que-no-existe-xyz` → `HTTP/1.1 404 Not Found` (no es un 404 suave) con `noindex`. Pero el contenido es el de Next en inglés ("404" / "This page could not be found."), con **dos `<title>`** en el HTML. Mantiene barra y pie, así que hay enlaces de vuelta. No existen `src/app/not-found.tsx` ni `src/app/error.tsx` (solo `src/app/admin/error.tsx`). Ya está anotado en `docs/SEO.md:62` y `docs/ROADMAP.md:69`.

### 5. Enlaces

Internos encontrados en el HTML de las 11 páginas: `/`, `/nosotros`, `/privacidad` (y `/privacidad#cookies`, el `id="cookies"` existe), `/propiedades`, `/propiedades/prueba-departamento-miraflores`, su `ficha.pdf`, `/servicios`, `/simulador-hipotecario`, `/simulador-inversion`, `/terminos`, `/vender`, `#contenido`: **todos 200**. En `src/` (grep) solo aparecen además rutas de `/admin` (existen). El pie usa `next/link` (Footer.tsx:52-82, 145-148), ya no `<a>`.

Externos:

| URL | Resultado |
|---|---|
| `https://wa.me/51977588905?text=…` (6 variantes, `encodeURIComponent` correcto) | 200 tras 1 redirección a `api.whatsapp.com` |
| `mailto:ventas@astupropiedad.com`, `tel:+51977588905` | bien formados (`contact.ts:76-77`) |
| `https://www.instagram.com/as.tupropiedad` | 200 |
| `https://www.linkedin.com/company/as-tupropiedad` | 200 |
| `https://www.youtube.com/@AS_Tupropiedad` | **404** (también `@as_tupropiedad` y `/videos`; control `@YouTube` = 200 con el mismo cliente) |
| `https://www.facebook.com/astupropiedadsac` | 400 a `curl` incluso con user-agent de navegador: **no verificado** (Facebook bloquea clientes no navegador) |

### 6. Duplicados indexables

| Host | Estado | Canonical servido | Robots |
|---|---|---|---|
| `web-as-tupropiedad.vercel.app` | 200 | `https://astupropiedad.com` | sin meta robots, sin `X-Robots-Tag`; robots.txt `Allow: /` |
| `web.astupropiedad.com` | 200 | `https://astupropiedad.com` | igual; robots.txt idéntico; sitemap con 8 `<loc>` |
| `astupropiedad.com` | 301 → `https://www.astupropiedad.com/` (nginx, web anterior) | — | — |
| `www.astupropiedad.com/propiedades`, `/simulador-hipotecario`, `/sitemap.xml` | **404** | — | — |

Los dos hosts del sitio nuevo son indexables y su canonical apunta a URLs que, hoy, redirigen y terminan en 404 (salvo la home, que acaba en la web anterior). Previews de rama: **no verificado** (no se tiene una URL de preview; Vercel suele añadir `X-Robots-Tag: noindex` a esas URLs, pero no se comprobó).

### 7. Encabezados (extraídos del HTML)

Un solo `h1` en cada página. Detalle:
- `/`: h1 "Tu patrimonio en buenas manos." → h2/h3 en orden.
- `/propiedades`: h1 "Catálogo de Inmuebles" → h2 Resultados → h3 tarjetas.
- `/vender`: h1 "Vendemos más rápido. A mejor precio." → h2 "Valoración Gratuita", h2 "¿Por qué elegir…?" → h3.
- `/simulador-hipotecario`: h1 "Simulador Hipotecario Calcula tu cuota." (con `<br/>`) → h2 → h3.
- `/simulador-inversion`, `/servicios`, `/nosotros`, `/privacidad`, `/terminos`: jerarquía correcta.
- Ficha: **h2 "Descripción" aparece antes del h1** en el DOM (SEO-7).
- Todas: el pie añade h2 "Explorar", "Contacto Directo", "¿Hablamos de negocios?" (SEO-12).
- 404: h1 "404", h2 "This page could not be found.".

### 8. Imagen OG

`/opengraph-image` y `/twitter-image` en el host del proyecto: 200, `image/png`, 55 KB, **1200×630** (leído de la cabecera PNG). Correcto. Pero las metaetiquetas las anuncian como `https://astupropiedad.com/opengraph-image`, que da 301 → `www` → **404** (`curl -L`: `404 1 https://www.astupropiedad.com/opengraph-image text/html`). Al compartir hoy un enlace del sitio nuevo, WhatsApp/Facebook no tendrán imagen.

## Anexo C — Propuesta de Content-Security-Policy en modo Report-Only (NO activada, D-23)

Pensada para el sitio actual:
- Las páginas se prerenderizan (SSG/ISR), así que no hay *nonce* por petición y Next mete scripts en línea para la hidratación.
- GA4 y Meta se cargan con `next/script` solo tras el consentimiento.
- framer-motion usa `style=""` en línea y `next/font` sirve las fuentes desde el propio sitio.
- Las fotos vienen del bucket de Supabase (vía `/_next/image` y de forma directa).
- GHL solo se llama desde el servidor.
- `/admin` previsualiza fotos con `blob:` y lienzos (`reducir.ts`).
- El navegador no usa `supabase-js`: el ingreso es una Server Action.

```
Content-Security-Policy-Report-Only:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://<PROYECTO>.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://www.facebook.com;
  font-src 'self';
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net;
  frame-src 'none';
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  worker-src 'self' blob:;
  upgrade-insecure-requests;
  report-uri /api/csp-report
```

Notas:
- `<PROYECTO>` se obtiene de `NEXT_PUBLIC_SUPABASE_URL`, igual que `hostSupabase` en `next.config.ts` (y `SUPABASE_PRUEBAS_URL` en los previews).
- En desarrollo hay que añadir `'unsafe-eval'` a `script-src` (Turbopack/React Refresh). Si no, la CSP solo se aplica en producción.
- `'unsafe-inline'` en `script-src` es necesario mientras las páginas sean estáticas (un *nonce* obliga a renderizado dinámico; ver `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`). Aun así, la CSP aporta `object-src`, `base-uri`, `form-action`, `frame-ancestors` y la lista de orígenes.
- Si algún día se usa `GHLForm` (iframe) o un calendario embebido de GHL, añadir su dominio a `frame-src`.
- `report-uri` requiere un Route Handler mínimo que solo registre `effective-directive` y `blocked-uri` (sin datos personales). También se puede omitir y revisar la consola del navegador.
- Plan: una semana en Report-Only en un preview, recorrer las 9 rutas públicas + `/admin` con y sin consentimiento, ajustar y luego decidir si se activa (actualizar D-23).

## Anexo D — Seguridad: revisión por zona, `npm audit` y `curl`

### 3. Revisión por zona (lo que se comprobó)

#### 3.1 `/admin`
- **Cada Server Action exportada** de `src/app/admin/acciones.ts` llama a `requerirAdmin()` como primera instrucción: `guardarPropiedad` :111, `cambiarEstado` :150, `cambiarVisibilidad` :169, `subirFoto` :188, `actualizarAlt` :242, `moverFoto` :260, `ordenarFotos` :277, `quitarFoto` :297. Las excepciones son `ingresar` (:52, pública por naturaleza; tras iniciar sesión comprueba `es_admin` y cierra la sesión si no lo es, :71-75) y `salir` (:79, inofensiva).
- `requerirAdmin` (`src/lib/admin/sesion.ts:16-33`) usa `auth.getUser()`, que valida el token con Supabase (no solo lee la cookie), y además `rpc("es_admin")`. Todas las páginas del panel lo llaman (`(panel)/layout.tsx:10`, `page.tsx:20`, `nueva/page.tsx:12`, `[id]/page.tsx:21`, `vista-previa/page.tsx:17`).
- `proxy.ts` solo filtra a quien no tiene sesión (correcto: no es la barrera que manda).
- **Validación:** zod en todos los campos (`esquema.ts`), con límites iguales a los `check` de la migración. Los ids se comprueban con `esUuid`. Los valores de estado y visibilidad se validan con `z.enum`. `moverFoto` valida `direccion` contra una lista cerrada.
- **Fotos:** se rechaza por el tipo declarado (`acciones.ts:196`) y además se comprueba el **formato real** con `sharp().metadata()` (`fotos.ts:22-31`; solo jpeg, png o webp). Límite de 4 MB (`esquema.ts:198`) y `limitInputPixels` de 50 MP (`fotos.ts:15`). Se quitan EXIF y GPS. La ruta en Storage la genera el servidor (`${id}/${randomUUID()}.webp`, `acciones.ts:212`; `id` ya pasó `esUuid`). La base la vuelve a validar con una regex (`migración:121`): **no hay path traversal**. El bucket solo acepta `image/webp` ≤ 5 MB (`migración:178-179`).
- **Orden de fotos:** `ordenarFotos` exige UUIDs y una permutación exacta de las fotos actuales (`acciones.ts:278-285`; `fotos.ts:46-47`). La RPC `ordenar_fotos` es `security invoker` con `search_path = ''` (la RLS se sigue aplicando) y además filtra por `propiedad_id`.
- **Búsqueda:** el filtro `.or()` de PostgREST quita `,()%*\` antes de interpolar (`catalogo/admin.ts:34-35`). Solo lo usa un administrador y la RLS manda.
- **Errores:** los registros solo llevan códigos (`acciones.ts:34-35`). Al cliente le llegan mensajes genéricos. Cuando `cargar` lanza un `Error`, Next lo oculta en producción.
- **Ingreso:** mismo mensaje para un correo inexistente y para una contraseña errónea; el 429 de Supabase se traduce (`acciones.ts:61-69`).
- CSRF de las Server Actions: Next compara Origin con Host (comportamiento del framework; no se cambió).

#### 3.2 Supabase (migraciones)
- `administradores`: RLS activa. Cada usuario solo ve **su propia fila**. No hay políticas de insert, update ni delete: nadie puede darse de alta como administrador por la API.
- `es_admin()`: `security definer` + `set search_path = ''` + nombres calificados; `EXECUTE` quitado a `public` y a `anon` (`20261104…sql:6`). Devuelve solo un booleano.
- `propiedades` y `fotos_propiedad`: `anon` solo puede hacer SELECT de lo `publicada`. Escribir exige `authenticated` + `es_admin()`. No hay DELETE en `propiedades`. Un usuario con sesión que no administra solo ve lo publicado.
- `ordenar_fotos`: `security invoker`, `EXECUTE` quitado a `anon`.
- Storage: lectura pública por URL. Listar, subir, actualizar y borrar exigen `authenticated` + `es_admin()`. **Un anónimo no puede subir ni borrar.**
- `rls_auto_enable()`: `EXECUTE` quitado si existe.
- **Clave de servicio:** no existe en el código (`config.ts` solo lee la URL y la clave publicable). `service_role` y `sb_secret_` tienen 0 coincidencias en todo el historial.
- **Registro público:** `docs/INTEGRACIONES.md:232` dice que se apagó el 2026-11-04 y se comprobó con `GET /auth/v1/settings` (`disable_signup: true`) — **no lo verifiqué yo** (sin MCP de Supabase). Es importante porque `proxy.ts` deja pasar a cualquier usuario autenticado, aunque `requerirAdmin` lo frena después.

#### 3.3 Leads, GHL y horarios
- Validación con zod (`leads.ts:52-78`); celular normalizado a E.164; el consentimiento es obligatorio; `contexto` y `utm` con límites por campo; `pagina` admite cualquier texto ≤ 200 que empiece por `/` (va a un campo de GHL; sin impacto).
- Honeypot (`lead.ts:41-43`). **No hay rate limit ni Turnstile** → SEG-2.
- Si GHL falla: paso y estado en el log (`describir`, `ghl.ts:362-363`); al usuario, un mensaje genérico con WhatsApp como alternativa (`lead.ts:168-174`). No se reintenta (no duplica citas). Si la cita falla, el lead se conserva.
- **Logs:** no registran datos personales (solo `origen`, `interes`, `motivo` y el paso/estado de GHL). El token nunca se registra. `fetch` del webhook: solo `error.name` (`lead.ts:127`).
- `obtenerHorarios` → SEG-3.
- `horarioValido` (`src/lib/horarios.ts:33-40`) acota la cita a una fecha ISO, con margen de 60 min y como mucho 15 días.

#### 3.4 Cron `/api/mantener-activo`
- Exige `Authorization: Bearer <CRON_SECRET>`; sin secreto configurado, nadie pasa (`mantener-activo.ts:40-41`). Producción: **401 sin cabecera y 401 con Bearer falso**. La lectura que hace usa la clave publicable (respeta la RLS). Solo SEG-8 (teórico).

#### 3.5 Ficha PDF
- Slug inexistente → 404 barato. Slug largo o raro: solo se compara con `===` contra los slugs publicados; no llega a ninguna consulta ni a disco.
- **Sin SSRF:** las URLs de las fotos se construyen con la URL del proyecto (variable de entorno) + `ruta`, que la base restringe por regex. La rama `url.startsWith("/")` solo la usa la ficha de EJEMPLO, que no aparece en producción con Supabase configurado.
- `Content-Disposition` con un nombre de archivo saneado (`generar.tsx:44-45`). `X-Robots-Tag: noindex`.
- Coste por petición → SEG-6.

#### 3.6 Cabeceras (`next.config.ts` y producción)
Bien: `poweredByHeader: false`, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`, HSTS (lo pone Vercel), `X-Robots-Tag: noindex, nofollow` en `/admin`. `images.remotePatterns` está limitado al bucket de Supabase. Sin CSP → SEG-12.

#### 3.7 Variables `NEXT_PUBLIC_*`
En el código: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SITE_URL`. En `.env.example` además: `NEXT_PUBLIC_GHL_CALENDAR_URL` (sin uso) y `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (la *site key* es pública por diseño). **Ninguna es secreta.** Los secretos (`GHL_API_TOKEN`, `GHL_WEBHOOK_URL`, `CRON_SECRET`, `TURNSTILE_SECRET_KEY`) no llevan el prefijo.

#### 3.8 Historial git
74 commits (`git log --all`). Patrones buscados con `git log -p --all`: `sb_secret_` 0, `service_role` 0, `eyJhbGci` 0, `pit-` 0, `api_key` 0, `sk_live` 0, `-----BEGIN` 0, `GHL_API_TOKEN=<valor>` 0. `Bearer ` 13: todas son plantillas de código (`Bearer ${config.token}`) o valores de prueba (`token-e2e`, `token-de-prueba`, `abc`). `CRON_SECRET=` 1: vacío, en `.env.example`. `sb_publishable_…` 1: clave publicable (pública) en `e2e/admin-con-supabase.ps1` → SEG-11. El único `.env*` del historial es `.env.example`. **Sin secretos reales en el historial.**

#### 3.9 Analítica y consentimiento
- `Analitica.tsx:58` devuelve `null` (no carga ningún script) si el visitante no aceptó. Cada `<Script>` solo se monta si existe `GA_ID` o `META_PIXEL_ID`.
- Los IDs se validan con una regex antes de interpolarlos en el script en línea (`consentimiento.ts:18-23`): no se puede inyectar código por la variable.
- `track()` no hace nada sin consentimiento ni sin IDs (`src/lib/analytics.ts:52-64`) y filtra claves o valores con aspecto de dato personal.
- Al rechazar: `consent update denied`, `fbq consent revoke` y se borran las cookies `_ga`, `_gid`, `_fbp` y `_fbc`.
- **GA4/Meta no pueden cargar sin consentimiento ni sin ID.**

#### 3.10 Otros
- `dangerouslySetInnerHTML`: solo en los dos JSON-LD. `FichaPropiedad.tsx:74` escapa bien (los datos vienen de `/admin`); `JsonLd.tsx:44` no → SEG-5.
- Sin open redirects: todos los `redirect()` van a rutas fijas o a `/admin/propiedades/${uuid}` que devuelve la base.
- `GHLForm.tsx` (iframe) no se usa.
- `robots.txt` en producción: `Allow: /` sin `Disallow: /admin` (lo cubre `X-Robots-Tag`; es tema de SEO, no de seguridad).

---

### 4. `npm audit`

`npm audit --omit=dev`:
```
zod  <4.6.6
Severity: high
Zod can exhaust memory while validating oversized constrained collections - GHSA-mrhx-c7xc-m3w5
fix available via `npm audit fix`
1 high severity vulnerability
```
→ **La línea base "0" está rota** (ya anotado en ROADMAP línea 35; pendiente de OK para actualizar). Ver SEG-4.

`npm audit` completo: **14 vulnerabilidades (11 moderadas, 3 altas)**.
- Altas: `zod` (producción), `brace-expansion`, `js-yaml` (desarrollo).
- Moderadas (todas de desarrollo): `@humanfs/node`, la cadena `typescript-eslint`/`@typescript-eslint/*` → `minimatch`, `eslint-config-next`, `vitest`/`@vitest/mocker`.

Antes (ROADMAP:101): 8 (1 moderada, 7 altas). Las de desarrollo no llegan al sitio.

---

### 5. `curl` contra producción (`https://web-as-tupropiedad.vercel.app`, 2026-11-06 03:18 UTC)

| Petición | Resultado |
|---|---|
| `GET /api/mantener-activo` sin cabecera | **401**, cuerpo `{"ok":false}` |
| `GET /api/mantener-activo` con `Authorization: Bearer x` | **401** |
| `GET /propiedades/no-existe-auditoria-2026/ficha.pdf` (1 petición) | **404**, `text/plain`, `Cache-Control: public, max-age=0, must-revalidate`, `X-Vercel-Cache: MISS`, `X-Matched-Path: /propiedades/[slug]/ficha.pdf`, con todas las cabeceras de seguridad |
| `HEAD /` | 200 · `X-Content-Type-Options: nosniff` · `Referrer-Policy: strict-origin-when-cross-origin` · `X-Frame-Options: DENY` · `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` · `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` · sin `X-Powered-By` · **sin CSP** |
| `HEAD /admin` | **307** → `/admin/ingresar`, `X-Robots-Tag: noindex, nofollow`, `Cache-Control: public, max-age=0, must-revalidate` (SEG-9), las mismas cabeceras de seguridad |
| `HEAD /admin/ingresar` | 200, `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Robots-Tag: noindex, nofollow` |
| `HEAD /propiedades` | 200, las mismas cabeceras que `/`, sin CSP |

---

### 6. Lo que está bien
- La autorización de `/admin` tiene dos capas y es consistente: `requerirAdmin()` en cada página y en cada acción, y RLS + `es_admin()` en la base.
- Subida de fotos robusta: tipo real con sharp, límite de píxeles, se quitan EXIF y GPS, la ruta la genera el servidor, regex en la base, y el bucket solo acepta WebP de 5 MB como máximo.
- Sin clave de servicio, ni en el código ni en el historial; RLS en todas las tablas.
- Errores y logs sin datos personales ni token; mensajes honestos al usuario con WhatsApp como alternativa.
- El cron exige el secreto (comprobado en producción).
- La analítica solo carga con consentimiento y con un ID válido; los IDs se validan antes de interpolarlos.
- Cabeceras de seguridad presentes en producción; HSTS con preload.
- JSON-LD de la ficha (datos editables) bien escapado.

### 7. No verificado (y por qué)
- **Que las políticas RLS y de Storage vivas coincidan con las migraciones**, y los avisos del asesor de Supabase: no hay autorización para usar el MCP de Supabase.
- **`disable_signup: true`**: documentado como comprobado el 2026-11-04 (`docs/INTEGRACIONES.md:232`); no lo comprobé (no tengo la URL ni la clave a mano sin leer `.env`, y solo podía hacer `curl` contra vercel.app).
- **Variables de entorno en Vercel** (que `CRON_SECRET` esté marcado como secreto y que no exista ninguna clave de servicio): no hay autorización para usar el MCP de Vercel.
- **Si la query string evita la caché de la CDN para la ficha PDF** (SEG-6) y el coste real por PDF: no se probó, para no generar carga en producción.
- **Límites de peticiones de la API de GHL** para esta cuenta (SEG-3): dependen del plan; no se consultaron.
- **Comportamiento exacto del upsert de GHL** frente a contactos existentes (SEG-1): se deduce del código, que envía nombre y correo sin condiciones, y de la semántica de "upsert" documentada en `ghl.ts:131`. No se probó contra GHL real (prohibido enviar datos).
- Pruebas dinámicas de `/admin` con sesión: no había credenciales de prueba en esta subtarea; la revisión es del código.
