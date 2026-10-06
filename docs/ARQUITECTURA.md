# Arquitectura

Estado actual del código (oct 2026) y arquitectura objetivo. Las referencias `C1…C7` apuntan a [AUDITORIA-WEB.md](auditorias/AUDITORIA-WEB.md); los "Bloques A…I" a [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md).

## 1. Resumen

- **Sitio 100 % estático:** `next build` genera las 7 páginas más el 404 como `○ Static`. No hay Route Handlers, Server Actions, `proxy.ts`, base de datos ni variables de entorno en uso.
- **Páginas = Server Components** (sesión 04): cada `page.tsx` exporta su `metadata` y renderiza un `*Client.tsx` con lo interactivo (la home compone directamente sus secciones, que ya son cliente). SEO técnico en [SEO.md](SEO.md).
- **Todo está escrito a mano en el código:** propiedades (en dos archivos distintos), cifras, textos, contacto.
- **`Navbar`, `Footer` y `FloatingWhatsApp` viven en `src/app/layout.tsx`** (Server Component) junto con el único `<main id="contenido">` y el enlace "Saltar al contenido" (sesión 01, 2026-10-05). Las páginas ya no los importan ni llevan `<main>`.

## 2. Mapa de rutas

| Ruta | Archivo | Secciones | Estado interno |
|---|---|---|---|
| `/` | `src/app/page.tsx` | `Hero`, `InvestmentSmarter`, `FeaturedProperties`, `PersonalShopper`, `PropertyZones`, `MortgageBasic`, `PhilosophyAndTeam` | solo los de cada componente |
| `/nosotros` | `src/app/nosotros/NosotrosClient.tsx` | hero, cultura, 4 estadísticas, 3 "especialistas" | ninguno |
| `/servicios` | `src/app/servicios/ServiciosClient.tsx` | hero + 4 tarjetas de servicio | ninguno |
| `/propiedades` | `src/app/propiedades/PropiedadesClient.tsx` | búsqueda, chips de tipo, cuadrícula | `activeType`, `searchDistrict`, `viewMode` (sin efecto) |
| `/vender` | `src/app/vender/VenderClient.tsx` | hero + asistente de 3 pasos + 3 ventajas | `step`, `propertyType`, `district` |
| `/simulador-hipotecario` | `src/app/simulador-hipotecario/SimuladorHipotecarioClient.tsx` | formulario + 4 resultados + CTA | `loanAmount`, `years`, `rate` + 2 derivados |
| `/simulador-inversion` | `src/app/simulador-inversion/SimuladorInversionClient.tsx` | sliders + KPIs + proyección 5 años | 6 inputs + 4 derivados |
| `/_not-found` | automático | 404 por defecto de Next (en inglés) | — |

No existen: `/propiedades/[slug]`, `/contacto`, `/agendar`, `/privacidad`, `/terminos`, `/unete`.

## 3. Componentes (`src/components/`)

| Componente | Cliente | Qué hace | Notas |
|---|---|---|---|
| `Navbar` | sí | Barra fija en el layout; transparente con texto blanco solo en las rutas con hero oscuro (lista `RUTAS_CON_HERO_OSCURO`) y sólida en las demás (p. ej. `/propiedades`); también se vuelve sólida al hacer scroll > 50 px. Menú móvil con `aria-label`/`aria-expanded`, se cierra al cambiar de ruta | **Ruta nueva con hero oscuro → añádela a `RUTAS_CON_HERO_OSCURO`**; si no, la barra será sólida desde el inicio (el fallo seguro) |
| `Hero` | sí | Portada con fondo `portada.jpg` (es un banner con el logo) y 2 CTAs | `#vender` no existe; animación infinita |
| `InvestmentSmarter` | sí | Calculadora "Cap Rate" (en realidad rentabilidad bruta) | `useEffect`+`setState` (lint) |
| `FeaturedProperties` | sí | 2 propiedades destacadas fijas + tarjeta "Próximamente" | Los datos de las 2 fichas contradicen sus fotos (ver informe de la sesión 02); enlaces a `/propiedades` |
| `PersonalShopper` | sí | Sección de servicio + imagen | CTA a `#contacto` |
| `PropertyZones` | sí | Miraflores / San Isidro / Surco | Solo texto |
| `MortgageBasic` | sí | Calculadora hipotecaria rápida + formulario "Habla con un asesor" (`LeadForm`, origen `home-hipoteca:cta`) | `$∞` con plazo 0 (sesión 06) |
| `PhilosophyAndTeam` | sí | Filosofía + formulario de reclutamiento (`LeadForm`, origen `home:reclutamiento`) | — |
| `Footer` | no declarado | Marca, enlaces, contacto, "calendario GHL", legal | En el layout; enlaces internos con `next/link`; sin redes sociales ni Privacidad/Términos (ocultos hasta tener URL y páginas); CTA de videollamada por WhatsApp; `<img>` crudo para el logo |
| `FloatingWhatsApp` | sí | Botón flotante en el layout (todas las rutas); 56 px en móvil y 64 px desde `md`; `aria-label` | Número desde `contact.ts` |
| `LeadForm` | sí | Formulario reutilizable de leads (`useActionState` + `enviarLead`): etiquetas, errores por campo, estado "enviando", consentimiento, éxito real y plan B de WhatsApp. Props: `interes`, `origen`, `contexto`, `mensajeWhatsApp`, `variante` (`claro`/`oscuro`), `onAtras` | Enlaza a `/privacidad`, que aún no existe (sesión 09) |
| `GHLForm` | sí | Iframe de formulario GHL | **No se usa en ninguna parte**; `DEFAULT_FORM_ID` y dominio sin confirmar |

## 4. Datos y cálculos (dónde viven hoy)

| Dato / cálculo | Ubicación | Problema |
|---|---|---|
| Propiedades del catálogo (6) | `propiedades/PropiedadesClient.tsx` líneas 10-17 | Contradice al flyer de cada imagen |
| Propiedades destacadas (3) | `FeaturedProperties.tsx` líneas 7-44 | Duplicada y distinta del catálogo |
| Cifras corporativas | `nosotros`, `vender`, `InvestmentSmarter`, `PropertyZones` | Sin respaldo |
| Contacto | `Navbar`, `Footer`, `FloatingWhatsApp` | 3 teléfonos y 3 dominios distintos |
| Cuota hipotecaria | `MortgageBasic.tsx` y `SimuladorHipotecarioClient.tsx` | Fórmula duplicada; TEA tratada como nominal |
| Rentabilidad | `InvestmentSmarter.tsx` y `SimuladorInversionClient.tsx` | Dos definiciones de "cap rate" |

## 5. Configuración

- `next.config.ts`: vacío (sin `images`, `headers`, `poweredByHeader`, redirecciones).
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
| `next@16.2.0` con avisos críticos (`npm audit`) → `16.3.8` | C6 |
| Simuladores con valores imposibles y duplicados | C7 |
| 4 errores `react-hooks/set-state-in-effect`, 2 `react/no-unescaped-entities` | lint |
| `<img>` crudos en 5 sitios; PNG de ~1 MB | AUDITORIA-WEB §Rendimiento |
| Cero `aria-*`; contrastes bajos; texto de 9-10 px | AUDITORIA-WEB §Accesibilidad |
| Sin pruebas ni CI | Bloque H |

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
│  ├─ finance.ts                 cuota, TEM, TCEA, cronograma, cap rate (puras + pruebas)
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
