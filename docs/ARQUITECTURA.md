# Arquitectura

Estado actual del código (oct 2026) y arquitectura objetivo. Las referencias `C1…C7` apuntan a [AUDITORIA-WEB.md](auditorias/AUDITORIA-WEB.md); los "Bloques A…I" a [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md).

## 1. Resumen

- **Mayormente estático:** las páginas públicas se prerenderizan (home, catálogo, fichas y sitemap con revalidación de 1 h y al guardar en `/admin`). Hay Server Actions (leads, horarios, `/admin`), `proxy.ts` solo para `/admin` y una base de datos (Supabase, D-30).
- **Páginas = Server Components** (sesión 04): cada `page.tsx` exporta su `metadata` y renderiza un `*Client.tsx` con lo interactivo (la home compone directamente sus secciones, que ya son cliente). SEO técnico en [SEO.md](SEO.md).
- **Propiedades en Supabase** (sesión 16, D-30): se editan en `/admin` (ruta protegida, dinámica, `noindex`) y el sitio las lee en caché desde `src/data/inventario.ts`; sin variables de Supabase el catálogo queda vacío (D-20). Cifras, textos y contacto siguen escritos en el código.
- **`src/proxy.ts`** solo corre en `/admin` (refresca la sesión y redirige sin sesión). Home, catálogo, fichas y sitemap son estáticos con revalidación (1 h y al guardar en `/admin`).
- **`Navbar`, `Footer` y `FloatingWhatsApp` viven en `src/app/layout.tsx`** (Server Component) junto con el único `<main id="contenido">` y el enlace "Saltar al contenido" (sesión 01, 2026-10-05). Las páginas ya no los importan ni llevan `<main>`.

## 2. Mapa de rutas

| Ruta | Archivo | Secciones | Estado interno |
|---|---|---|---|
| `/` | `src/app/page.tsx` | `Hero`, `InvestmentSmarter`, `FeaturedProperties`, `PersonalShopper`, `PropertyZones`, `MortgageBasic`, `PhilosophyAndTeam` | solo los de cada componente |
| `/nosotros` | `src/app/nosotros/NosotrosClient.tsx` | hero, cultura, 4 estadísticas, 3 "especialistas" | ninguno |
| `/servicios` | `src/app/servicios/ServiciosClient.tsx` | hero + 4 tarjetas de servicio | ninguno |
| `/propiedades` | `src/app/propiedades/page.tsx` (servidor) + `PropiedadesClient.tsx` | búsqueda por distrito, chips de operación (solo las que tienen propiedades), tarjetas `PropertyCard`, estados vacíos con acción | `operacion`, `distrito` |
| `/propiedades/[slug]` | `src/app/propiedades/[slug]/page.tsx` → `FichaPropiedad` | ficha: galería, datos clave, WhatsApp prellenado, JSON-LD `RealEstateListing`, similares; `generateStaticParams` con las publicadas; una publicada después se genera en la primera visita; slug inexistente o archivada → 404 | — |
| `/propiedades/[slug]/ficha.pdf` | `src/app/propiedades/[slug]/ficha.pdf/route.ts` → `src/lib/ficha-pdf/` | ficha A4 en PDF generada en el servidor con `@react-pdf/renderer` (D-31): mismos datos que la ficha web, fotos a JPG con `sharp`, caché de 10 min en la CDN, `noindex`; inexistente → 404 | — |
| `/admin` | `src/app/admin/(panel)/page.tsx` | listado con filtros (texto, operación, estado, visibilidad), estados vacío y "sin resultados" | filtros en la URL |
| `/admin/ingresar` | `src/app/admin/ingresar/` | correo y contraseña (Supabase Auth); aviso si Supabase no está configurado o el acceso está suspendido; con contraseña temporal lleva a `/admin/cuenta` | — |
| `/admin/usuarios` | `src/app/admin/(panel)/usuarios/` | **solo rol administrador** (D-35): dar acceso con rol (contraseña temporal que se ve una vez), cambiar rol, suspender/reactivar, contraseña temporal nueva, quitar acceso; último ingreso y estado; registro de cambios. Sin `SUPABASE_SECRET_KEY` se ve la lista con todo desactivado | acciones en `src/app/admin/acciones-usuarios.ts` |
| `/admin/cuenta` | `src/app/admin/(panel)/cuenta/` | "Mi cuenta": cambiar la propia contraseña (pide la actual salvo con contraseña temporal, que obliga a cambiarla antes de seguir) | `cambiarMiClave` |
| `/admin/propiedades/nueva` · `/admin/propiedades/[id]` · `…/vista-previa` | `src/app/admin/(panel)/propiedades/` | crear (borrador); editar datos, fotos (`GestorFotos`), publicación y estado (`Publicacion`); vista previa con `FichaPropiedad` | formulario sin vaciarse al fallar; aviso de cambios sin guardar |
| `/vender` | `src/app/vender/VenderClient.tsx` | hero + asistente de 3 pasos + 3 ventajas | `step`, `propertyType`, `district` |
| `/simulador-hipotecario` | `src/app/simulador-hipotecario/SimuladorHipotecarioClient.tsx` | formulario + 4 resultados + CTA | `loanAmount`, `years`, `rate` + 2 derivados |
| `/simulador-inversion` | `src/app/simulador-inversion/SimuladorInversionClient.tsx` | sliders + KPIs + proyección 5 años | 6 inputs + 4 derivados |
| `/_not-found` | automático | 404 por defecto de Next (en inglés) | — |

Existen `/privacidad` y `/terminos` (borrador, `noindex`, ver `src/lib/legal.ts`). No existen: `/contacto`, `/agendar`, `/unete`.

## 3. Componentes (`src/components/`)

| Componente | Cliente | Qué hace | Notas |
|---|---|---|---|
| `Navbar` | sí | Barra fija en el layout; transparente con texto blanco solo en las rutas con hero oscuro (lista `RUTAS_CON_HERO_OSCURO`) y sólida en las demás (p. ej. `/propiedades`); también se vuelve sólida al hacer scroll > 50 px. Menú móvil con `aria-label`/`aria-expanded`, se cierra al cambiar de ruta | **Ruta nueva con hero oscuro → añádela a `RUTAS_CON_HERO_OSCURO`**; si no, la barra será sólida desde el inicio (el fallo seguro) |
| `Hero` | sí | Portada con fondo `portada.jpg` (es un banner con el logo) y 2 CTAs | `#vender` no existe; animación infinita |
| `InvestmentSmarter` | sí | Calculadora "Cap Rate" (en realidad rentabilidad bruta) | `useEffect`+`setState` (lint) |
| `FeaturedProperties` | sí | Recibe las propiedades destacadas por props (la home las lee de `src/data/properties.ts`) + tarjeta "Próximamente" | Sin destacadas, solo se ve la tarjeta "Próximamente" |
| `PropertyCard` | no | Tarjeta de propiedad compartida por catálogo, home y similares; enlace a la ficha + botón de WhatsApp | — |
| `PersonalShopper` | sí | Sección de servicio + imagen | CTA a `#contacto` |
| `PropertyZones` | sí | Miraflores / San Isidro / Surco | Solo texto |
| `MortgageBasic` | sí | Calculadora hipotecaria rápida + formulario "Habla con un asesor" (`LeadForm`, origen `home-hipoteca:cta`) | `$∞` con plazo 0 (sesión 06) |
| `PhilosophyAndTeam` | sí | Filosofía + formulario de reclutamiento (`LeadForm`, origen `home:reclutamiento`) | — |
| `Footer` | no declarado | Marca, redes, enlaces, contacto (correo, teléfono, dirección y horario de `contact.ts`), "calendario GHL", legal | En el layout; enlaces internos con `next/link`; redes sociales de `REDES_SOCIALES` (sin TikTok); enlaces Privacidad y Términos en la barra inferior; CTA de videollamada por WhatsApp; logo con `next/image` |
| `Providers` | sí | `<MotionConfig reducedMotion="user">` que envuelve Navbar, páginas y footer en el layout | Un componente de animación nuevo lo hereda solo |
| `FloatingWhatsApp` | sí | Botón flotante en el layout (todas las rutas); 56 px en móvil y 64 px desde `md`; `aria-label` | Número desde `contact.ts` |
| `LeadForm` | sí | Formulario reutilizable de leads (`useActionState` + `enviarLead`): etiquetas, errores por campo, estado "enviando", consentimiento, éxito real y plan B de WhatsApp. Props: `interes`, `origen`, `contexto`, `mensajeWhatsApp`, `variante` (`claro`/`oscuro`), `onAtras`, `permiteCita` | Usa `ConsentCheckbox` y, con `permiteCita`, `SelectorCita` |
| `SelectorCita` | sí | Casilla "Quiero agendar una llamada" + día y hora libres del calendario de GHL (`obtenerHorarios`), en hora de Lima, con estados de carga, vacío y error (con WhatsApp). Solo en `/vender` y el asesor privado de la home (D-27) | Radios nativos (teclado) |
| `BannerCookies` | sí | Banner de cookies (solo si hay `NEXT_PUBLIC_GA_ID` o `NEXT_PUBLIC_META_PIXEL_ID`): Aceptar/Rechazar con el mismo peso; decisión en `localStorage` | Va en el layout justo tras "Saltar al contenido" (sesión 13, D-26) |
| `Analitica` | sí | Carga GA4/píxel de Meta con `next/script` solo tras aceptar; oyente global de clics a `wa.me` (`cta_whatsapp_click`, origen en `data-origen`) | Eventos en `src/lib/analytics.ts`; detalle en INTEGRACIONES §4 |
| `PreferenciasCookies` | sí | Botón "Preferencias de cookies" del pie (reabre el banner) | Oculto sin IDs |
| `FichaPropiedad` | no | Ficha completa de una propiedad (galería, datos, WhatsApp, descarga del PDF, similares, JSON-LD). La usan `/propiedades/[slug]` y la vista previa de `/admin` (`vistaPrevia`: sin JSON-LD ni analítica) | — |
| `SoloSitioPublico` | sí | Oculta en `/admin` la barra, el pie, el WhatsApp flotante, el banner de cookies y la analítica | En el layout |
| `admin/Usuarios` · `admin/FormClave` | sí | Alta de usuarios (`FormNuevoUsuario`), fila con acciones (`FilaUsuario`), panel de contraseña temporal de un solo uso e insignias de rol y estado; formulario de "Mi cuenta". Reglas en `src/lib/admin/roles.ts` (puras, con pruebas), lecturas en `src/lib/admin/usuarios.ts`, sesión y rol en `src/lib/admin/sesion.ts` (`requerirAdmin`, `requerirAdministrador`), clave secreta en `src/lib/supabase/servicio.ts` | D-35 |
| `admin/FormPropiedad` · `admin/GestorFotos` · `admin/SubirFotos` · `admin/Publicacion` · `admin/Insignias` · `admin/ui` | sí / no | Formulario de propiedad (zod en el servidor, error por campo, foco al resultado); subir varias fotos a la vez (`SubirFotos`: elegir o arrastrar, descripción por foto, una por envío), describir, ordenar arrastrando (`Reorder` de framer-motion, guarda con `ordenarFotos`) o con botones, y quitar fotos; publicar/archivar y estado comercial; insignias; estilos y avisos compartidos del administrador | Server Actions en `src/app/admin/acciones.ts` |
| `VistaPropiedad` | sí | Registra `propiedad_vista` desde la ficha (Server Component) | — |
| `ConsentCheckbox` | no | Casilla de consentimiento reutilizable (label asociada, obligatoria, error, enlace a `/privacidad`). Props: `id`, `checked`, `onChange`, `error`, `variante` | Úsala en todo formulario que recoja datos |
| `LegalPage` / `Pendiente` | no | Plantilla de `/privacidad` y `/terminos` con aviso de borrador; `Pendiente` pinta `[PENDIENTE: dato]` visible | Estado del borrador: `LEGALES_EN_BORRADOR` en `src/lib/legal.ts` |
| `simuladores` (`CampoNumerico`, `SelectorMoneda`, `AvisoSimulacion`) | sí | Piezas compartidas de los simuladores: campo numérico con `<label>`, error en español (`role="alert"`) y variante `claro`/`oscuro`; selector USD/PEN + tipo de cambio escrito por la persona; aviso "Simulación referencial" | Sin estado propio; los valores viven en el simulador |
| `GHLForm` | sí | Iframe de formulario GHL | **No se usa en ninguna parte**; `DEFAULT_FORM_ID` y dominio sin confirmar |

## 4. Datos y cálculos (dónde viven hoy)

| Dato / cálculo | Ubicación | Problema |
|---|---|---|
| Propiedades (catálogo, home, fichas, sitemap) | Supabase (D-30); lectura en `src/data/inventario.ts`, tipos y etiquetas en `src/data/properties.ts`, validación en `src/lib/catalogo/esquema.ts`, mapeo en `mapeo.ts`, fotos en `fotos.ts` | ✔ Sesión 16: se editan en `/admin`; hoy sin propiedades reales ni proyecto creado (P-13, P-16) |
| Cifras corporativas | `nosotros`, `vender`, `InvestmentSmarter`, `PropertyZones` | Sin respaldo |
| Contacto | `Navbar`, `Footer`, `FloatingWhatsApp` | 3 teléfonos y 3 dominios distintos |
| Cuota hipotecaria | `src/lib/finance.ts` (`cuotaFrancesa`, `cronogramaFrances`) | ✔ Resuelto (sesión 06): una sola fórmula, TEA convertida con (1+TEA)^(1/12)−1 |
| Rentabilidad | `src/lib/finance.ts` (`rentabilidadBruta`, `rentabilidadNeta`) | ✔ Resuelto (sesión 06): la home muestra rentabilidad **bruta** (rotulada así); el cap rate **neto** vive en `/simulador-inversion` |

### Matemática financiera (`src/lib/finance.ts`, sesión 06)

Funciones puras; cada una valida y devuelve `{ ok: true, valor }` o `{ ok: false, errores: [{ campo, mensaje }] }` (mensajes en español que el componente muestra junto al campo). Nunca NaN, Infinity ni negativos. Porcentajes como número "humano" (8.5 = 8,5 %). Límites en `LIMITES`: montos ≤ 1 000 000 000; TEA 0-100 %; plazo 1-40 años; porcentajes ≤ 100.

| Función | Fórmula / supuesto |
|---|---|
| `tasaMensualDesdeTEA` | TEM = (1 + TEA)^(1/12) − 1 (tasa efectiva, no TEA/12) |
| `cuotaFrancesa` | cuota = C · i / (1 − (1+i)^−n); con TEA 0, C / n. Cuota fija en la moneda elegida |
| `cronogramaFrances` | interés = saldo · i; amortización = cuota − interés; el saldo final se fuerza a 0. Intereses totales = suma de intereses |
| `montoFinanciado` | precio · (1 − cuota inicial %); cuota inicial de 0 a 99 % |
| `relacionCuotaIngreso` / `ingresoMinimoRequerido` | cuota / ingreso · 100 ; cuota / (tope % / 100). El **tope lo escribe la persona**: no hay un límite bancario codificado |
| `rentabilidadBruta` | alquiler mensual · 12 / precio · 100 |
| `rentabilidadNeta` | neto = alquiler anual − (mantenimiento · 12 + arbitrios) − impuesto a la renta (% del alquiler bruto, escrito por la persona). Cap rate = neto / precio. Si el neto saldría negativo se devuelve 0 con `gastosSuperanIngresos` y el `faltanteAnual` |
| `inversionTotal` | precio + precio · alcabala % + gastos notariales (monto). Alcabala y notariales **sin valor inicial**: los escribe la persona |
| `proyeccionPlusvalia` | precio · (1 + plusvalía %)^años (5 años en pantalla). Plusvalía sin valor inicial; la renta acumulada supone alquiler y gastos constantes |
| `convertirMoneda` | `tipoCambio` = soles por 1 dólar, escrito por la persona; sin valor por defecto |

**No incluye:** seguros (desgravamen, inmueble), comisiones, gastos de la entidad ni TCEA; tampoco reglas propias del impuesto a la renta de alquileres ni vacancia. Los textos de los simuladores lo dicen. Pruebas: `npm test` (`finance.test.ts`; el origen de cada valor de referencia está en los comentarios).

## 5. Configuración

- `next.config.ts`: cabeceras de seguridad (D-23), `X-Robots-Tag: noindex` en `/admin`, `images.remotePatterns` con el host de Supabase (de `NEXT_PUBLIC_SUPABASE_URL`) y `serverActions.bodySizeLimit` de 4,5 MB (fotos de `/admin`).
- `supabase/migrations/`: esquema, RLS y bucket del catálogo (se aplica en el proyecto de Supabase; no hay CLI de Supabase en el equipo).
- `vercel.json`: `framework: nextjs`, `installCommand`, `buildCommand`.
- `tsconfig.json`: `strict`, alias `@/*`.
- `eslint.config.mjs`: `eslint-config-next` (core-web-vitals + typescript), flat config.
- `globals.css`: tokens de marca en `@theme inline`; bloque `prefers-color-scheme: dark` **sin efecto** real (las secciones usan fondos fijos); scrollbar personalizada; falta la clase `hide-scrollbar` que usa el catálogo.
- `.gitignore`: ver el archivo (se completó junto con esta documentación).

## 6. Deuda técnica conocida

| Deuda | Referencia |
|---|---|
| ~~Páginas `"use client"` sin `metadata`~~ (resuelto en la sesión 04, 2026-10-05) | C4 |
| ~~Sin `robots`/`sitemap`/OG/JSON-LD~~ (resuelto en la sesión 04; faltan `FAQPage`/`Offer` con las fichas) | C4 |
| ~~Navbar invisible en `/propiedades`~~ (resuelto en la sesión 01, 2026-10-05) | C5 |
| ~~`next@16.2.0` con avisos críticos~~ → resuelto: `16.4.2` (2026-10-16, D-23) | C6 |
| Simuladores con valores imposibles y duplicados | C7 |
| ~~4 errores `react-hooks/set-state-in-effect`, 2 `react/no-unescaped-entities`~~ (lint en 0 / 0 desde la sesión 11) | lint |
| ~~`<img>` crudos y PNG de ~1 MB~~ (resuelto en la sesión 11, D-24; queda el `<img>` de `og-image.tsx`, obligatorio en `ImageResponse`) | AUDITORIA-WEB §Rendimiento |
| ~~Cero `aria-*`; contrastes bajos; texto de 9-10 px~~ resuelto en la sesión 08 (D-21); falta prueba con lector de pantalla | AUDITORIA-WEB §Accesibilidad |
| ~~Sin pruebas ni CI~~ (sesión 12: Vitest + Playwright + GitHub Actions, ver [PRUEBAS.md](PRUEBAS.md)); falta e2e en CI, catálogo y otros navegadores | Bloque H |

## 7. Arquitectura objetivo

```
src/
├─ app/
│  ├─ layout.tsx                 Navbar + Footer + FloatingWhatsApp + <main> + JSON-LD global + metadataBase
│  ├─ page.tsx                   Server Component + metadata (rutaMetadata)
│  ├─ propiedades/
│  │  ├─ page.tsx                Server Component (lee src/data o Supabase) → <CatalogoCliente/>
│  │  └─ [slug]/page.tsx         ficha: generateStaticParams + generateMetadata + JSON-LD
│  ├─ vender/ · simulador-*/ · servicios/ · nosotros/   (cada page.tsx = Server + metadata)
│  ├─ agendar/ · contacto/ · unete/ · privacidad/ · terminos/ · libro-de-reclamaciones/
│  ├─ actions/lead.ts            Server Action `enviarLead` (zod + anti-spam + GHL)
│  ├─ robots.ts · sitemap.ts · opengraph-image.tsx · not-found.tsx · error.tsx
├─ components/
│  ├─ ui/                        Button, Field, EmptyState, Section… (a11y incluida)
│  ├─ sections/                  Hero, FeaturedProperties… (cliente solo si hace falta)
│  └─ forms/                     LeadForm, ValuationWizard…
├─ lib/
│  ├─ contact.ts (✔ creado)              única fuente de teléfono/WhatsApp/correo/dirección/dominio
│  ├─ whatsapp.ts                waLink(mensaje) con plantillas por contexto
│  ├─ finance.ts (✔ creado, sesión 06)  cuota, TEM, cronograma, cap rate (puras + pruebas; falta TCEA)
│  ├─ analytics.ts               track(evento, props)
│  └─ utils.ts                   cn()
└─ data/
   └─ properties.ts              → migrable a Supabase (mismo tipo `Property`)
```

**Flujo de un lead (objetivo):**

```
Formulario (cliente) → Server Action enviarLead → zod + honeypot/Turnstile
   → POST a GHL (webhook/API) → contacto + etiquetas (origen, página, UTM) → workflow (autorespuesta + aviso al asesor)
   → after(): evento de analítica
   ← { ok | errores } → confirmación real o error + botón de WhatsApp como plan B
```

Reglas de transición: no migres todo de golpe. Orden: `layout` con Navbar/Footer → `contact.ts` → metadata por página → embudo de leads → datos de propiedades → fichas. Ver [ROADMAP.md](ROADMAP.md).
