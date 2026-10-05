# Auditoría web — AS Tupropiedad

**Fecha:** 3 oct 2026 · **Proyecto:** `Web-AS-Tupropiedad` (Next.js 16.2.0, React 19, Tailwind 4, framer-motion) · **Entrada:** código local + build de producción corrido en local (`next build` + `next start`) con recorrido real en navegador a 390 px.

**Skills usadas:** `searchfit-seo:seo-audit` · `searchfit-seo:technical-seo` · `searchfit-seo:on-page-seo` · `design:accessibility-review` (WCAG 2.1 AA) · `auditor-ux-app-f100k` (rúbrica de 10 dimensiones).
**Documentación consultada:** `node_modules/next/dist/docs` (metadata, JSON-LD, images, upgrade a v16), como pide `AGENTS.md`.

> No modifiqué ningún archivo fuente. Solo se regeneró `.next/` (artefacto de build) y se levantó/apagó un servidor local en el puerto 3055.

---

## 1. Resumen ejecutivo

| Área | Puntaje | Lectura |
|---|---|---|
| **SEO** (on-page + técnico) | **32 / 100** | Base inexistente: mismo título en las 7 páginas, sin robots, sitemap, OG, canonical ni datos estructurados. |
| **UX** (rúbrica de 10 dimensiones) | **36 / 100** 🔴 | "Todavía es una idea, no una app": el sitio se ve muy bien, pero **ningún botón de conversión funciona**. |
| **Accesibilidad** (WCAG 2.1 AA) | **~35 / 100** (estimado) | Cero atributos `aria-*` en todo `src/`, contrastes que fallan, menú sin nombre accesible. |
| **Salud técnica** | tsc ✅ · build ✅ · lint ❌ (6 errores, 17 advertencias) · `npm audit` ❌ (1 crítica) | Compila y despliega, pero con dependencia vulnerable y errores de lint. |

> La rúbrica de UX está pensada para apps; para un sitio de marketing la usé igual, adaptando "puertas de acceso y dinero" a "captura de leads". Los puntajes son estimaciones honestas sobre lo que pude verificar, no una medición instrumentada (no corrí Lighthouse).

**Lo más grave en una frase:** hoy el sitio no puede generar un solo cliente. El formulario de valoración no envía nada, los botones "GHL" son texto sin acción, el WhatsApp flotante apunta a `51900000000` (número de relleno), y la información de propiedades y equipo es placeholder o se contradice entre páginas.

### Los 3 arreglos que más mueven la aguja

1. **Hacer que la captura de leads funcione de verdad** (formulario de `/vender`, simuladores, calendario, "Contactar a un Broker") y unificar un único teléfono/correo/dominio real.
2. **Reemplazar contenido falso o contradictorio** (fotos del "equipo" que son edificios, la misma foto en 4 lugares, propiedad de Unsplash, fichas que no coinciden con sus propios flyers, estadísticas sin sustento).
3. **Poner la base SEO** (metadata por página, `robots.ts`, `sitemap.ts`, OG image, JSON-LD) — y para eso convertir las páginas de `"use client"` a Server Components, porque con `"use client"` no se puede exportar `metadata`.

---

## 2. Hallazgos críticos 🔴 (rompen o dañan el negocio)

### C1 · Ningún camino de conversión funciona
**Qué pasa:** el usuario completa el formulario y no ocurre nada. Sin mensaje, sin envío, sin error.
**Evidencia:** probado en navegador: en `/vender` llegué al paso 3, escribí nombre y celular, pulsé "ENVIAR DATOS PARA ANÁLISIS" → la pantalla no cambia y no hay ninguna petición de red nueva. Causa: el botón no tiene `onClick` ni hay `<form>` ([vender/page.tsx:132-137](../../src/app/vender/page.tsx:132)).

| Elemento | Archivo | Estado |
|---|---|---|
| "ENVIAR DATOS PARA ANÁLISIS" | [vender/page.tsx:135](../../src/app/vender/page.tsx:135) | Sin handler |
| Campos "Área m²" y "Habitaciones" | [vender/page.tsx:112-114](../../src/app/vender/page.tsx:112) | No guardan estado: se pierden al avanzar |
| "PRE-CALIFICAR AHORA (GHL)" | [simulador-hipotecario/page.tsx:129-132](../../src/app/simulador-hipotecario/page.tsx:129) | Sin handler, **"(GHL)" visible al público** |
| "SOLICITAR REPORTE COMPLETO (GHL)" | [simulador-inversion/page.tsx:122-124](../../src/app/simulador-inversion/page.tsx:122) | Sin handler, **"(GHL)" visible** |
| "ABRIR CALENDARIO GHL" | [Footer.tsx:103](../../src/components/Footer.tsx:103) | Sin handler, texto interno visible |
| "Contactar a un Broker" | [MortgageBasic.tsx:137](../../src/components/MortgageBasic.tsx:137) | Sin handler |
| "Ver Tabla Completa" (cronograma) | [simulador-hipotecario/page.tsx:143](../../src/app/simulador-hipotecario/page.tsx:143) | Sin handler; la tabla no existe |
| "POSTULAR AL EQUIPO" | [PhilosophyAndTeam.tsx:53-60](../../src/components/PhilosophyAndTeam.tsx:53) | Es un `<div>`, no un enlace |
| Hero "Vender mi propiedad" → `#vender` | [Hero.tsx:64](../../src/components/Hero.tsx:64) | **El ancla `#vender` no existe** en la home (verificado en el DOM) |
| "Ver catálogo privado" / "Catálogo Completo" → `#contacto` | [FeaturedProperties.tsx:61,114](../../src/components/FeaturedProperties.tsx:61) | Lleva al pie, no a `/propiedades` |
| Redes sociales (Instagram/Facebook/LinkedIn) | [Footer.tsx:24](../../src/components/Footer.tsx:24) | `href="#"` |
| Privacidad / Términos | [Footer.tsx:115-116](../../src/components/Footer.tsx:115) | `href="#"` |
| Botones de las tarjetas (flecha ↗), "Filtros" | [propiedades/page.tsx:84,120](../../src/app/propiedades/page.tsx:84) | Sin handler |

**Arreglo:** conectar GoHighLevel. `GHLForm.tsx` ya existe pero **no se usa en ninguna parte** y tiene `DEFAULT_FORM_ID` y un dominio `link.as-tupropiedad.pe` sin confirmar ([GHLForm.tsx:12-13](../../src/components/GHLForm.tsx:12)). Opciones: (a) embeber el formulario/calendario real de GHL; (b) un Route Handler `app/api/lead/route.ts` que envíe al webhook de GHL, con estado de carga, confirmación real y error en español. Mientras tanto, cualquier botón sin destino debe enlazar a WhatsApp.

> **Frase para pegar a Claude Code:** *"Haz que el formulario de /vender envíe los datos a mi webhook de GoHighLevel. Valida nombre y celular, deshabilita el botón mientras envía, muestra una confirmación real al terminar y un error entendible si falla. Guarda también tipo de propiedad, distrito, área y habitaciones. Quita todo texto '(GHL)' de la interfaz."*

### C2 · Datos de contacto inconsistentes y de relleno
Tres teléfonos distintos y tres dominios distintos en el mismo sitio:

| Dato | Dónde |
|---|---|
| **+51 940 428 352** | Navbar ([Navbar.tsx:70,117](../../src/components/Navbar.tsx:70)) |
| **+51 900 000 000** (relleno) | WhatsApp flotante ([FloatingWhatsApp.tsx:10](../../src/components/FloatingWhatsApp.tsx:10), con el comentario `// Replace with real number`) y Footer ([Footer.tsx:86](../../src/components/Footer.tsx:86)) |
| **940 215 027** | Banner `portada.jpg` y `legacy/index.html` |
| Otros celulares | Letreros dentro de los flyers (`994 741 703`, `977 588 905`) |
| **astupropiedad.pe** | Correo del Footer |
| **astupropiedad.com** | Todos los flyers y el banner |
| **as-tupropiedad.pe** | `GHLForm.tsx` |

**Impacto:** el botón verde flotante, el más visible del sitio, manda a quien escribe a un número que no existe. Además email y teléfono del footer no son enlaces (`mailto:` / `tel:`).
**Arreglo:** una sola fuente de verdad (`src/lib/contact.ts`) con teléfono, WhatsApp, correo, dominio y dirección, usada por Navbar, FAB, Footer y JSON-LD. Confirmar con el cliente cuál es el número y dominio reales.

### C3 · Contenido falso, repetido o contradictorio presentado como real
Recorrí cada imagen de `public/imagenes/` y la comparé con el texto que la acompaña:

| Dónde | Lo que dice | Lo que realmente es |
|---|---|---|
| [nosotros/page.tsx:104-115](../../src/app/nosotros/page.tsx:104) | "Especialista 1 / 2 / 3 — Arquitecto & Broker", alt `"Team Member"` | **Son fotos de edificios**, no de personas. #1 y #2 son el mismo edificio (`IMG-…WA0101` y `…WA01012`); #3 es un flyer de Pueblo Libre. **No hay una sola foto de persona en todo el sitio.** |
| [FeaturedProperties.tsx:16,28](../../src/components/FeaturedProperties.tsx:16) | "Flat Moderno — Jesús María" y "Residencia Familiar — La Molina" | **La misma foto del mismo edificio** en dos distritos distintos. El flyer de ese edificio dice *Av. Hipólito Unanue, Miraflores*. Además se reutiliza en Nosotros. |
| [FeaturedProperties.tsx:40](../../src/components/FeaturedProperties.tsx:40) | "Penthouse Suite Ocean View · Miraflores · $410,000 · Off-Market" | Foto de stock de **Unsplash**. Es una propiedad inexistente. |
| Home vs. catálogo | Jesús María: `$155,000 · 85 m² · 2 dorm` (home) vs `$165,000 · 95 m² · 3 dorm` (catálogo) | Dos fichas distintas para "la misma" propiedad. El flyer dice **77 m² · 3 dorm**. |
| [propiedades/page.tsx:11-16](../../src/app/propiedades/page.tsx:10) | La Molina: `320 m² · 4 dorm · 4 baños` | El flyer (Santa Patricia) dice **113 m² · 3 dorm · 2 baños**. |
| | "Casa" en Alpamayo, `180 m²` | El flyer dice **Departamento, 94 m², 2 baños**. |
| | Callao: **`beds: 0`**, 85 m² (se muestra "0" dormitorios) | El flyer dice **3 dorm, 3 baños, 94 m²**. |
| | "Casa Exclusiva", La Molina, 400 m² | La imagen es un edificio de departamentos sin ficha. |
| | "Proyecto Inversión", distrito "Lima", 45 m² | El flyer dice Av. Hipólito Unanue, Miraflores. |

Además las imágenes del catálogo son **flyers con texto incrustado** (precio, m², dormitorios, teléfono), así que la información se duplica, se contradice con la tarjeta, no es indexable y no se lee en móvil.

**Cifras sin sustento visible** (verificar y respaldar, o quitar): "+15 años", "$40M intermediados", "120+ familias", "+5k base de inversores", "45 días promedio de venta", "ROI promedio 8.5%", "plusvalía estimada 12%", "ocupación superior al 75%", "4 alianzas bancarias top", "ejecutivos asignados en BCP, BBVA, Scotiabank e Interbank" ([nosotros:78-91](../../src/app/nosotros/page.tsx:78), [vender:43-49](../../src/app/vender/page.tsx:43), [InvestmentSmarter.tsx:35-41](../../src/components/InvestmentSmarter.tsx:35), [PropertyZones.tsx:11](../../src/components/PropertyZones.tsx:11), [simulador-hipotecario:120](../../src/app/simulador-hipotecario/page.tsx:120)).
**Afirmaciones absolutas de riesgo legal/reputacional:** "plusvalía **garantizada**" ([InvestmentSmarter.tsx:30](../../src/components/InvestmentSmarter.tsx:30)), "resguardo de capital **garantizado**" ([PropertyZones.tsx:16](../../src/components/PropertyZones.tsx:16)), "100% segura" ([servicios:28](../../src/app/servicios/page.tsx:28)). Conviene revisarlas con asesoría legal (publicidad veraz, INDECOPI).

**Arreglo:** fuente única de datos de propiedades (un `properties.ts` o tabla en Supabase/GHL) con foto limpia (sin texto), precio, m², dormitorios, baños, distrito, tipo y estado; que home y catálogo lean de ahí. Fotos reales del equipo con nombre, cargo y número de registro si aplica. Quitar o respaldar cada cifra.

> **Frase para pegar:** *"Crea un único archivo de datos de propiedades y haz que la home y /propiedades lean de él. Elimina la propiedad de Unsplash. Reemplaza las fotos del equipo por placeholders honestos ('Foto próximamente') hasta tener las reales."*

### C4 · SEO base inexistente
**Evidencia (producción local):** `/robots.txt` → 404 · `/sitemap.xml` → 404 · sin `canonical`, `og:*`, `twitter:*` ni JSON-LD (verificado en el DOM) · las 7 páginas devuelven **el mismo `<title>` y la misma `description`** (comprobado en home, `/propiedades` y `/simulador-hipotecario`; el resto no define metadata propia, ver `layout.tsx`).

| Chequeo | Resultado |
|---|---|
| Title | Único, global, 50 car. ✅ pero **idéntico en las 7 páginas** ❌ ([layout.tsx:20-23](../../src/app/layout.tsx:20)) |
| Meta description | 80 car. (objetivo 150-160) ❌, idéntica en las 7 páginas |
| Open Graph / Twitter | ❌ ninguno → al pegar el link en WhatsApp/Instagram no hay imagen ni título propio |
| Canonical / `metadataBase` | ❌ |
| robots / sitemap | ❌ |
| JSON-LD | ❌ ninguno (ni `RealEstateAgent`, ni `Organization`, ni `Offer`) |
| H1 | ✅ uno por página |
| `lang` | ✅ `es` (mejor `es-PE`) |
| URLs | ✅ limpias y en minúsculas |

**Causa raíz:** las 7 páginas son `"use client"` en la línea 1. La documentación de Next 16 es explícita: *"The `metadata` object and `generateMetadata` function exports are only supported in Server Components."* Por eso no hay metadata por ruta.

**Arreglo (patrón):** cada `page.tsx` pasa a ser Server Component que exporta `metadata` y renderiza un componente cliente con la parte interactiva:

```tsx
// src/app/propiedades/page.tsx  (Server Component)
import type { Metadata } from "next";
import CatalogoClient from "./CatalogoClient"; // el actual contenido, con "use client"

export const metadata: Metadata = {
  title: "Departamentos y Casas en Venta en Lima | AS Tupropiedad",
  description: "Explora departamentos y casas en venta en Jesús María, La Molina, Callao y más. Precios, áreas y ubicación claros. Agenda tu visita por WhatsApp.",
  alternates: { canonical: "/propiedades" },
};
export default function Page() { return <CatalogoClient />; }
```

```tsx
// src/app/layout.tsx  — base global
export const metadata: Metadata = {
  metadataBase: new URL("https://TU-DOMINIO-REAL"),
  title: { default: "AS Tupropiedad | Departamentos y Casas en Venta en Lima", template: "%s | AS Tupropiedad" },
  description: "Inmobiliaria boutique en Lima: compra, vende o invierte con asesoría financiera, simuladores de hipoteca y rentabilidad, y acompañamiento legal.",
  openGraph: { type: "website", locale: "es_PE", siteName: "AS Tupropiedad", images: ["/og.jpg"] },
  twitter: { card: "summary_large_image" },
};
```

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: "https://TU-DOMINIO-REAL/sitemap.xml" };
}
// src/app/sitemap.ts → lista las 7 páginas (y luego cada propiedad)
```

**Títulos y descripciones propuestos** (≤ 60 / ≈ 150 caracteres):

| Ruta | Title | Description |
|---|---|---|
| `/` | AS Tupropiedad \| Departamentos y Casas en Venta en Lima | Inmobiliaria boutique en Lima: compra, vende o invierte con asesoría financiera, simuladores de hipoteca y rentabilidad, y acompañamiento legal. |
| `/propiedades` | Departamentos y Casas en Venta en Lima | Explora departamentos y casas en venta en Jesús María, La Molina, Callao y más. Precios, áreas y ubicación claros. Agenda tu visita por WhatsApp. |
| `/vender` | Vende tu Departamento o Casa en Lima | Valoración gratuita de tu inmueble. Marketing profesional, fotografía y una red de compradores calificados para vender en Lima con seguridad. |
| `/simulador-hipotecario` | Simulador de Crédito Hipotecario en Lima | Calcula la cuota mensual, intereses y pago total de tu crédito hipotecario. Simulación referencial con asesoría para pre-calificar con bancos. |
| `/simulador-inversion` | Calculadora de Rentabilidad Inmobiliaria | Estima el cap rate, el flujo mensual y la plusvalía a 5 años de tu inversión inmobiliaria en Lima, con alcabala, mantenimiento y arbitrios. |
| `/servicios` | Servicios Inmobiliarios en Lima | Representación de comprador, marketing para vendedores, estructuración financiera y auditoría legal inmobiliaria en un solo equipo. |
| `/nosotros` | Quiénes Somos \| Boutique Inmobiliaria | Conoce al equipo de AS Tupropiedad: asesores con experiencia bancaria que te acompañan a comprar, vender e invertir en Lima. |

**JSON-LD recomendado** (sanitizando `<` como indica la guía de Next): `RealEstateAgent` (nombre, teléfono, correo, dirección, `areaServed: Lima`, `sameAs` con redes) en el layout; luego `Offer`/`Residence` por propiedad cuando existan páginas de detalle; `FAQPage` en `/vender` y `/simulador-hipotecario`.

**Mayor brecha de contenido:** **no existen páginas de detalle de propiedad.** Para una inmobiliaria, las fichas individuales (`/propiedades/[slug]`) son las páginas que posicionan ("departamento en venta en Jesús María") y las que se comparten por WhatsApp. Hoy las tarjetas ni siquiera son enlaces.

### C5 · En `/propiedades` el menú es invisible al cargar
**Evidencia:** capturas a 390 px y a ~800 px (en ≥1024 px, por código, ocurre igual con los enlaces de escritorio): el encabezado de la página es `bg-white` y el `Navbar` sin scroll usa texto blanco ([Navbar.tsx:30-35](../../src/components/Navbar.tsx:30)). Se ve solo "TUPROPIEDAD" en verde; el "AS", el botón hamburguesa y todos los enlaces son blanco sobre blanco hasta que se hace scroll > 50 px. En esa página el usuario no tiene navegación visible ni forma de volver.
**Arreglo:** pasar una prop `variant="solid"` al `Navbar` en páginas con cabecera clara (o poner un encabezado oscuro en `/propiedades`), y añadir `aria-label` al botón.

### C6 · Next.js 16.2.0 tiene vulnerabilidades críticas
`npm audit --omit=dev`: **5 vulnerabilidades (1 crítica, 3 altas, 1 moderada).** La crítica es `next` (DoS con Server Components y bypass de Middleware/Proxy vía rutas de prefetch por segmento); `postcss`, `sharp` y `nanoid` heredan de `next`. **Corrección disponible sin salto mayor:** `next@16.3.8`.
Este sitio es 100 % estático (las 7 páginas y el 404 salen `○ Static`), así que la exposición práctica es menor, pero igual hay que actualizar.

```bash
npm install next@16.3.8 eslint-config-next@16.3.8
```

### C7 · Los simuladores devuelven valores imposibles y mienten
**Evidencia (probado en la app):**

| Entrada | Resultado mostrado |
|---|---|
| Plazo `0` años en la home (`MortgageBasic`) | cuota **`$∞`** |
| Plazo `-5` | cuota **`-$2,687`** |
| Cuota inicial `150 %` | cuota **`-$1,085`** |
| Monto `-1000` en el simulador hipotecario | intereses y pagos **negativos** |
| Cualquier entrada | "Relación Cuota/Ingreso" **siempre `3.5x`**, valor fijo ([simulador-hipotecario:110](../../src/app/simulador-hipotecario/page.tsx:110)) |

Otros problemas de cálculo y de rotulado:
- **TEA tratada como tasa nominal:** `r = rate/100/12` ([hipotecario:17](../../src/app/simulador-hipotecario/page.tsx:17), [MortgageBasic:16](../../src/components/MortgageBasic.tsx:16)). El campo se llama "TEA", así que la tasa mensual correcta es `(1 + TEA)^(1/12) − 1`; con 8.5 % el error sobreestima la cuota alrededor de 2-3 %.
- **No incluye** seguro de desgravamen, seguro del inmueble ni comisiones; no muestra **TCEA**. Para un simulador hipotecario conviene un aviso claro de que es referencial (el de la home existe en [MortgageBasic:131](../../src/components/MortgageBasic.tsx:131); el de la página avanzada no).
- Está en USD con tasa de 8.5 %: confirmar moneda y tasa de referencia vigentes.
- **Simulador de inversión:** `alcabala` (3 %) y `appreciation` (4 %) están en estado pero **no tienen ningún input** (`setAlcabala` y `setAppreciation` sin usar, [inversion:15-16](../../src/app/simulador-inversion/page.tsx:15)), pero la pantalla muestra "Estimado Plusvalía: 4 %" como si fuera ajustable. Los `+1500` de notaría y el `5 % IR` están fijos en el código ([inversion:26,30](../../src/app/simulador-inversion/page.tsx:26)); el tratamiento del impuesto a la renta de alquileres debe validarlo un contador.
- **"Cap Rate" de la home** es en realidad rentabilidad **bruta** (alquiler anual / precio, sin gastos), no cap rate neto ([InvestmentSmarter.tsx:14-16](../../src/components/InvestmentSmarter.tsx:14)). Puede inducir a error.
- "Ingreso por renta (acumulado 5Y)" asume renta constante ([inversion:192](../../src/app/simulador-inversion/page.tsx:192)).
- Los inputs numéricos no tienen `min`/`max`/`step` ni validación.

**Arreglo:** validar y acotar entradas (`Math.max`, `min`/`max` en el input), mostrar estado "ingresa un plazo válido" en vez de `$∞`, calcular la relación cuota/ingreso con un campo de ingreso real o quitarla, usar la conversión correcta de TEA, y hacer editables alcabala y plusvalía. Eliminar `useEffect + setState` en favor de valores derivados (ver lint, abajo): son cuentas puras, no necesitan efectos.

---

## 3. Hallazgos que cuestan uso 🟡

### Catálogo (`/propiedades`)
- El botón de **vista lista** cambia `viewMode` pero **nada lo usa** al renderizar ([propiedades:22,89-90](../../src/app/propiedades/page.tsx:22)).
- El chip **"Alquiler"** siempre devuelve vacío (ninguna propiedad es de alquiler) y el mensaje es genérico: "No encontramos propiedades con esos filtros" (3.er estado de la rúbrica incompleto).
- La clase `hide-scrollbar` no existe en el CSS ([propiedades:71](../../src/app/propiedades/page.tsx:71)): en móvil se ve una barra azul de scroll bajo los chips.
- "Filtros" y el botón de búsqueda no hacen nada (el filtro por distrito ya es en vivo).
- No hay estado de carga/error: están todos hardcodeados, por lo que hoy no aplican, pero sí cuando conecten datos reales.

### Home y hero
- **El fondo del hero es el banner del logo** (`portada.jpg`: logo, "940 215 027", `www.astupropiedad.com` y un hombre con una casita en la mano), recortado con `bg-cover`. En 390 px se ve el logo gigante borroso detrás del titular, y la parte derecha del degradado termina casi blanca, donde cae el texto `white/70` ([Hero.tsx:15-17](../../src/components/Hero.tsx:15)): **contraste insuficiente** en el párrafo. Necesita una foto real de alta calidad (sin texto) y un degradado que cubra todo el ancho en móvil.
- En móvil el **botón flotante de WhatsApp tapa el extremo derecho de "Vender mi propiedad"** (captura a 390 px).
- Animaciones de entrada con retrasos de hasta 1.5 s: el `<h1>` sale del servidor con `style="opacity:0"`, así que el LCP real espera a la hidratación + el retraso.
- El indicador de scroll es un `<div onClick>` ([Hero.tsx:74-82](../../src/components/Hero.tsx:74)): no se alcanza con teclado.

### Enlazado interno
- El Footer usa `<a href>` en vez de `next/link` ([Footer.tsx:38-72](../../src/components/Footer.tsx:38)): recarga completa y sin prefetch.
- Los CTAs de la home que deberían llevar a páginas (`/propiedades`, `/vender`) llevan a anclas del mismo documento.
- Ninguna tarjeta de propiedad es enlace; no hay migas de pan.

### Cumplimiento (Perú) — *a validar con asesoría legal*
- **Política de privacidad y términos:** los enlaces son `#`. El sitio captura nombre, celular y datos del inmueble → hace falta aviso de privacidad y **consentimiento expreso** (Ley 29733 de Protección de Datos Personales), con casilla en el formulario.
- **Libro de Reclamaciones virtual**, **razón social y RUC** y dirección completa: no aparecen (solo "San Isidro, Lima").
- Si aplica, registro del agente inmobiliario.
- Simulador hipotecario: aviso de que no es oferta vinculante, y TCEA.
- Estadísticas y "garantizado" (ver C3).

### Accesibilidad (WCAG 2.1 AA)
**Cero atributos `aria-*` en todo `src/`** y ninguna página salvo la home tiene `<main>`.

| # | Hallazgo | Criterio | Severidad | Evidencia |
|---|---|---|---|---|
| 1 | Botón hamburguesa sin nombre accesible; en `/propiedades` hay **10 botones sin nombre** (iconos) | 4.1.2 | 🔴 | [Navbar.tsx:84](../../src/components/Navbar.tsx:84), medido en DOM |
| 2 | Etiquetas no asociadas a su campo (`<label>` sin `htmlFor`, inputs sin `id`) en ambos simuladores y la calculadora de la home | 1.3.1 / 3.3.2 | 🔴 | medido: 3 labels sin asociar en `/simulador-hipotecario` |
| 3 | Formulario de `/vender` solo con placeholder (sin etiqueta); sin `required`, `type`/`autocomplete`, sin error | 3.3.1 / 3.3.2 | 🟡 | [vender:132-133](../../src/app/vender/page.tsx:132) |
| 4 | Contraste: `text-gray-400` sobre blanco ≈ **2.5:1**; `text-secondary` (#7CC04B) sobre blanco ≈ **2.2:1**; `text-white/50` sobre `primary` ≈ **3.4:1**; `text-gray-500` sobre `dark` ≈ **3.3:1**. Requisito: 4.5:1 | 1.4.3 | 🔴 | 61 usos de `text-gray-300/400`; eyebrows `text-secondary` sobre claro en [FeaturedProperties:57](../../src/components/FeaturedProperties.tsx:57) |
| 5 | Texto de **9-10 px** en etiquetas, KPIs y botones (**59 ocurrencias**) | 1.4.4 (legibilidad) | 🟡 | `text-[9px]`/`text-[10px]` por todo el sitio |
| 6 | Sin `:focus-visible` propio; varios inputs con `outline-none` sin reemplazo | 2.4.7 | 🟡 | [hipotecario:76,86](../../src/app/simulador-hipotecario/page.tsx:76), [vender:132](../../src/app/vender/page.tsx:132) |
| 7 | Controles hechos con `<div>`/`<li>` clicables (scroll del hero, "Postular", contactos del footer) | 2.1.1 | 🟡 | [Hero:74](../../src/components/Hero.tsx:74), [PhilosophyAndTeam:53](../../src/components/PhilosophyAndTeam.tsx:53) |
| 8 | Animaciones infinitas (Ken Burns de 20 s, flecha que rebota) sin respetar `prefers-reduced-motion` | 2.2.2 / 2.3.3 | 🟡 | [Hero.tsx:12-14,74-76](../../src/components/Hero.tsx:12) |
| 9 | Falta `<main>` en 6 de 7 páginas (solo la home lo tiene); `<nav>` sin etiqueta | 1.3.1 | 🟡 | las páginas usan `<div>` como raíz |
| 10 | `alt` genérico: `"Team Member"` ×3, `"AS Logo"` | 1.1.1 | 🟡 | [nosotros:107](../../src/app/nosotros/page.tsx:107), [Footer:14](../../src/components/Footer.tsx:14) |
| 11 | Números usados como títulos (`<h3>+15</h3>`, `<h4>$1,736</h4>`) y saltos de nivel | 1.3.1 | 🔵 | [nosotros:78-90](../../src/app/nosotros/page.tsx:78) |
| 12 | Objetivos táctiles < 44 px: hamburguesa (24 px), conmutador grid/lista (~32 px) | 2.5.5 (AAA) / 2.5.8 | 🔵 | [propiedades:89-90](../../src/app/propiedades/page.tsx:89) |

**Arreglos rápidos:** `aria-label` + `aria-expanded` en la hamburguesa; `<label htmlFor>` + `id` (o `useId`) en cada campo; `<MotionConfig reducedMotion="user">` en el layout; oscurecer grises (`gray-500`/`gray-600` sobre claro, `gray-300` sobre oscuro) y usar un `secondary` más oscuro para texto; pasar de 9-10 px a 12 px mínimo; `<main>` en cada página; `focus-visible:ring-2` global.

### Rendimiento
No ejecuté Lighthouse (ver "No verificado"), pero estos factores son medibles en el código y el build:
- **17 archivos con `"use client"`: las 7 páginas y 10 de 11 componentes** (solo `Footer` no lo declara, pero se hidrata igual porque lo importan páginas cliente), y casi todos importan `framer-motion`. Todo el árbol se hidrata. El fragmento JS más grande pesa 227 KB sin comprimir y hay otros dos de ~141-150 KB. Contenido estático (Footer, `PropertyZones`, textos de servicios/nosotros) debería ser Server Component y dejar `framer-motion` solo donde aporta.
- **Imágenes sin optimizar:** 5 puntos con `<img>` crudo (Footer, FeaturedProperties, PersonalShopper, Nosotros, Catálogo) en vez de `next/image`. Cuatro flyers PNG pesan **0.97-1.26 MB cada uno** y se muestran a ~340 px de ancho; `/propiedades` descarga ≈ **3.9 MB** de imágenes. `public/imagenes` suma 6.1 MB.
- **Todas las `<img>` son `loading="auto"`** (eager) y React inyectó 5 `<link rel="preload" as="image">` para imágenes que están bajo el pliegue: compiten con el LCP. En cambio la imagen del hero es un fondo CSS, así que el navegador no la descubre temprano ni la prioriza.
- Imagen remota de Unsplash (dependencia externa; además es falsa, ver C3).
- Fuentes: `next/font` ✅ (Geist, Geist Mono, Playfair). `Geist Mono` se descarga pero ninguna clase `font-mono` la usa en el sitio (se puede quitar).
- `scroll-smooth` en `<html>`: en Next 16 ya no se desactiva el smooth scroll en cambios de ruta salvo que agregues `data-scroll-behavior="smooth"` (guía de upgrade a v16).

**Arreglos:** `next/image` con `sizes`, `width/height` o `fill`, y `priority` solo en el hero; convertir los flyers a fotos limpias en WebP/AVIF ≤ 150 KB; mover el fondo del hero a `<Image priority fill>`; Server Components por defecto.

### Seguridad y configuración
- Sin cabeceras de seguridad en `next.config.ts` (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`); `X-Powered-By: Next.js` activo (`poweredByHeader: false`). Verifiqué solo el servidor local; confirmar en el dominio de producción qué agrega Vercel (HSTS, etc.).
- `GHLForm.tsx` inserta un `<script src=…>` dentro de un componente de React y es código muerto: usar `next/script` si se activa.
- Sin secretos ni `.env` en el repo (revisado).

### Higiene del repositorio
- `.gitignore` solo contiene `.vercel`. **Falta `node_modules`, `.next`, `.env*`.** (Hoy el directorio no es repositorio git, pero un `git init` + `git add .` subiría ~330 MB.)
- `Imagenes/` (raíz) duplica `public/imagenes/` (6.1 MB). Sobran los SVG de plantilla (`file`, `globe`, `next`, `vercel`, `window`) y `6601394_…jpg` sin uso. `README.md` es el de `create-next-app`. `legacy/` conserva el HTML anterior con datos de contacto viejos.
- **Lint:** 6 errores y 17 advertencias, entre ellos 4 de `react-hooks/set-state-in-effect` (`useEffect` + `setState` para derivar valores: [MortgageBasic:20](../../src/components/MortgageBasic.tsx:20), [InvestmentSmarter:16](../../src/components/InvestmentSmarter.tsx:16), [hipotecario](../../src/app/simulador-hipotecario/page.tsx:21), [inversion:27](../../src/app/simulador-inversion/page.tsx:27)) y 2 de `react/no-unescaped-entities` ([PersonalShopper:61](../../src/components/PersonalShopper.tsx:61)). `next build` no falla por lint, pero cualquier CI sí.
- Menores: `group-hover` sin `group` padre ([PersonalShopper:28](../../src/components/PersonalShopper.tsx:28)); iconos importados y no usados; dependencias con parches pendientes (`framer-motion`, `tailwindcss`, `react` 19.3).

### Voz y contenido
- Mezcla de inglés y español en titulares (Elite Portfolio, Credit Advisory, Wealth Management Tools, Investment Intelligence, Off-Market, Home Staging, Flat, Cap Rate, "hub"). Para el público peruano, y para SEO ("departamento en venta"), conviene español natural. "Nosotros (Firm)" en el footer es una mezcla accidental.
- Texto largo en `font-light` gris claro + mayúsculas con tracking amplio y peso `black` en casi todas las etiquetas: da un aspecto uniforme "de plantilla" y baja la legibilidad.

---

## 4. Oportunidades 🔵

| Oportunidad | Por qué |
|---|---|
| **Páginas de detalle `/propiedades/[slug]`** con galería, ficha, mapa, botón "WhatsApp con mensaje prellenado" y JSON-LD | Es lo que posiciona y se comparte; hoy no existe |
| **Landings por distrito** (Miraflores, San Isidro, Surco, Jesús María, La Molina, Callao…) | Ya tienen la sección `PropertyZones`; convertirla en páginas indexables con contenido propio |
| **Guías/Blog** (cómo calcular la cuota, gastos de compra, alcabala, financiamiento) enlazadas a los simuladores | Los simuladores son el mejor activo de captación orgánica; hoy no tienen texto explicativo ni FAQ |
| **Prueba social real:** testimonios, casos con foto, reseñas de Google, perfil de empresa en Google | E-E-A-T: hoy no hay equipo real, ni RUC, ni reseñas |
| **Medición:** GA4 / Meta Pixel / Vercel Analytics y eventos de conversión (clic en WhatsApp, envío de formulario, uso de simulador) | No hay analítica instalada; sin ella no se puede saber qué funciona |
| **OG image, favicon completo, `manifest`** | Presentación al compartir por WhatsApp/Instagram |
| **`not-found.tsx`, `error.tsx`, `loading.tsx` en español** | El 404 actual es el genérico en inglés |
| **Estados de carga/vacío/error con `EmptyState`** cuando el catálogo venga de datos | Rúbrica de los 4+1 estados |
| **Pase visual** con `ux-elevacion-formula100k` (escala tipográfica, jerarquía, menos "look de plantilla") | Es trabajo de diseño visual, no de esta auditoría |

---

## 5. Lo que está bien ✅
- `tsc --noEmit` pasa sin errores; `next build` compila y genera las 7 páginas (más el 404) como **estáticas** (rápidas y baratas de servir).
- El HTML llega renderizado desde el servidor: el contenido es rastreable aunque no ejecute JS.
- Un solo `<h1>` por página; `lang="es"`; `viewport` correcto; URLs limpias y en minúsculas.
- Sin desbordamiento horizontal a 390 px en home, catálogo y simulador hipotecario (`scrollWidth = clientWidth = 390`).
- El menú móvil **sí abre** y funciona (probado), y los enlaces cierran el menú.
- Todas las `<img>` de home y catálogo tienen `alt` (5/5 y 7/7).
- La fórmula de cuota francesa (PMT) está bien aplicada para entradas razonables; la home incluye un aviso de "tasa referencial".
- Tipografías con `next/font` (sin parpadeo de fuente ni petición externa a Google en runtime).
- Diseño de marca coherente (paleta, tipografía serif/sans, componentes) y buena base de componentes reutilizables.

---

## 6. Plan de acción sugerido

| Fase | Qué | Esfuerzo | Verificación |
|---|---|---|---|
| **0 · Hoy** | Corregir teléfono/correo/dominio (C2); arreglar `#vender` y enlaces a `#contacto`; quitar "(GHL)" y la propiedad de Unsplash; `npm i next@16.3.8`; completar `.gitignore` | 2-3 h | Reabrir home en 390 px y probar cada botón |
| **1 · Semana 1** | Conectar formulario/calendario GHL (C1); metadata por página + `robots.ts` + `sitemap.ts` + OG image (C4); arreglar navbar en `/propiedades` (C5); validar simuladores y quitar `3.5x` (C7); aviso de privacidad + consentimiento | 2-3 días | Pegar el link en WhatsApp (debe verse título e imagen); enviar un lead de prueba y verlo en GHL |
| **2 · Semanas 2-3** | Fuente única de propiedades con datos y fotos reales (C3); páginas `/propiedades/[slug]`; fotos reales del equipo; respaldar o quitar cifras; JSON-LD | 4-6 días | Que cada ficha coincida con su flyer/escritura |
| **3 · Semana 4** | Accesibilidad (labels, aria, contraste, `reducedMotion`, tamaños mínimos); `next/image` y WebP; Server Components para contenido estático; lint a cero | 3-4 días | Lighthouse (móvil), axe, navegación solo con teclado |
| **4 · Continuo** | Analítica y eventos, landings por distrito, blog/guías, reseñas, Libro de Reclamaciones | recurrente | Consola de Search Console + conversiones |

**Orden dentro de cada fase:** no perder el trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → el resto.

**Puntaje estimado tras Fases 0-3:** SEO ≈ 75-80 · UX ≈ 70-75 · Accesibilidad ≈ 80.

---

## 7. No verificado (y por qué)

- **Métricas reales de rendimiento** (LCP, INP, CLS, TTFB): no corrí Lighthouse ni PageSpeed; los datos de rendimiento son de inspección de código/build.
- **El sitio desplegado en Vercel**: audité la build local (proyecto `web-as-tupropiedad`); no consulté el dominio en producción, así que no sé qué cabeceras ni redirecciones agrega.
- **Ancho de escritorio ≥ 1280 px:** el panel del navegador tenía ~800 px, por lo que revisé móvil/tablet; el diseño de escritorio se evaluó por código.
- **Teléfono físico, lector de pantalla y recorrido solo con teclado:** la accesibilidad se evaluó con DOM, código y cálculo de contraste (fórmula WCAG), no con NVDA/VoiceOver.
- **Pruebas 4 y 7 del recorrido** (doble toque, "sin permiso"): no aplican hoy (no hay envío ni cuentas).
- **Aspectos legales** (Ley 29733, publicidad, registros): son banderas para validar con asesoría, no dictamen.
- **Veracidad de las cifras** de negocio (años, volumen, familias, alianzas bancarias): no tengo cómo comprobarlas; las marco como "sin sustento visible".
