# Sistema de diseño

Lo que ya usa el sitio (extraído del código) más las reglas para que los cambios nuevos no empeoren la accesibilidad. Para pulido visual avanzado usa la skill `ux-elevacion-formula100k`; para revisar accesibilidad, `design:accessibility-review`.

## 1. Tokens (fuente: `src/app/globals.css`, bloque `@theme inline`)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#014898` (azul) | Fondos de sección, CTAs secundarios, enlaces |
| `secondary` | `#7CC04B` (verde) | CTA principal, acentos, eyebrows sobre fondo oscuro |
| `accent` | `#41AEE5` | Reservado (casi sin uso) |
| `dark` | `#122137` | Texto principal, fondos oscuros |
| `light` | `#f8fafc` | Fondo del `<body>` |
| `font-sans` | Geist | Texto general |
| `font-serif` | Playfair Display | Titulares (`font-serif font-black`) |
| `font-mono` | Geist Mono | **Sin uso** (se puede quitar) |

> `legacy/Estilos_Propuesta.html` (la sesión 00 archiva `legacy/`; queda en el historial de git) usa una paleta casi idéntica (`#004A99` / `#7AC142`). **La vigente es la de `globals.css`.**
> No añadas hex sueltos en componentes: define un token nuevo en `@theme`.

## 2. Layout y espaciado

- Contenedor de sección: `py-24` · `max-w-7xl mx-auto px-6 lg:px-12`.
- Hero de página interna: `pt-40 pb-20` (compensa la navbar fija).
- Cuadrículas: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8…12`.
- Breakpoints de Tailwind por defecto; la navbar cambia a escritorio en `lg` (1024 px).
- Radios: tarjetas `rounded-2xl`/`rounded-3xl`/`rounded-[2rem]`; botones `rounded-sm` o `rounded-xl`.

## 3. Patrones de componente (copiar de aquí, no reinventar)

**Encabezado de sección:** eyebrow + titular serif.
```tsx
<span className="text-secondary font-black tracking-widest uppercase text-xs mb-4 block">Eyebrow</span>
<h2 className="text-5xl md:text-6xl font-serif font-black text-dark">Titular <span className="italic font-normal text-secondary">destacado.</span></h2>
```

**CTA principal:** `bg-secondary text-dark px-10 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all`.
**CTA secundario (sobre oscuro):** `bg-white/10 backdrop-blur-md text-white border border-white/20 … hover:bg-white/20`.
**Tarjeta:** `bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all`.
**Entrada con scroll:** `motion.div` con `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}`.

## 4. Reglas de accesibilidad para código nuevo

| Regla | Detalle |
|---|---|
| Texto mínimo | **12 px** (hoy hay 59 usos de `text-[9px]`/`text-[10px]`: no añadir más) |
| Contraste | ≥ 4.5:1 en texto normal, ≥ 3:1 en texto grande (≥ 24 px, o ≥ 18.66 px en negrita) |
| Campos | `<label htmlFor>` + `id` (o `useId`); nunca solo `placeholder` |
| Botones de icono | `aria-label` obligatorio (hamburguesa, vista cuadrícula/lista, búsqueda…) |
| Foco | `focus-visible:ring-2 ring-primary`; no uses `outline-none` sin reemplazo |
| Estructura | Un `<main>` y un `<h1>` por página; sin saltos de nivel; los números no son encabezados |
| Movimiento | Respetar `prefers-reduced-motion` (`<MotionConfig reducedMotion="user">`); sin animaciones infinitas |
| Objetivos táctiles | Recomendado ≥ 44 × 44 px (mínimo 24 × 24) |
| Controles | Si se hace clic, es `<button>` o `<a>`, nunca `<div onClick>` |
| Imágenes | `alt` descriptivo (qué muestra y dónde); decorativas con `alt=""` |

### Combinaciones de color (razones calculadas, aproximadas)

| Texto sobre fondo | Razón | Veredicto |
|---|---|---|
| `dark` sobre blanco | ≈ 16:1 | ✅ |
| `primary` sobre blanco / blanco sobre `primary` | ≈ 8.8:1 | ✅ |
| `gray-600` sobre blanco | ≈ 7.6:1 | ✅ |
| `gray-500` sobre blanco | ≈ 4.8:1 | ✅ (límite) |
| `dark` sobre `secondary` | ≈ 7.3:1 | ✅ (CTA actual) |
| `secondary` sobre `dark` | ≈ 7.1:1 | ✅ (eyebrows sobre oscuro) |
| `gray-400` sobre `dark` | ≈ 6.4:1 | ✅ |
| **`gray-400` sobre blanco** | ≈ 2.5:1 | ❌ no usar para texto |
| **`secondary` sobre blanco/`gray-50`** | ≈ 2.2:1 | ❌ no usar para texto (usar un verde oscuro, p. ej. token `secondary-dark ≈ #3F7A19`, ≈ 5.2:1, verificar visualmente) |
| **`white/50` sobre `primary`** | ≈ 3.4:1 | ❌ para texto < 24 px |
| **`gray-500` sobre `dark`** | ≈ 3.3:1 | ❌ (usar `gray-300`/`gray-400`) |
| Texto blanco sobre imagen | depende | ❌ si la imagen es clara: poner degradado que cubra todo el ancho en móvil |

## 5. Imágenes

- **Código nuevo: `next/image`** con `sizes`; `priority` solo en la imagen del hero.
- Fotos de propiedad **limpias** (sin texto incrustado, sin teléfonos ni rótulos), relación 4:3 o 3:2, WebP/AVIF ≤ 150 KB por vista.
- Los flyers de `public/imagenes/` mezclan precio, m² y teléfono dentro de la imagen: no son aptos para el catálogo (datos duplicados que se contradicen con la tarjeta).
- Nombres de archivo: minúsculas con guiones, sin espacios ni tildes (`jesus-maria-talara-01.webp`). Los actuales tienen espacios y requieren `%20`.
- `images.remotePatterns` si se usan hosts remotos (el `domains` está deprecado en Next 16).

## 6. Tono visual

El sitio apuesta por un look "boutique de lujo": serif en titulares, mayúsculas con tracking amplio, pesos `black`, esquinas muy redondeadas, desenfoques y sombras profundas. Funciona para la marca, pero **abusar de mayúsculas + `font-light` gris claro + 9-10 px** daña la legibilidad (ver reglas de accesibilidad). Prioriza legibilidad sobre efecto.

## 7. Antipatrones detectados (no repetir)

- Fondo de hero con un banner que ya contiene el logo, el teléfono y la web.
- Navbar transparente con texto blanco sobre secciones blancas.
- Botón flotante que tapa un CTA en móvil (dejar margen inferior o mover el CTA).
- Texto de 9-10 px en etiquetas y KPIs.
- Números de KPI marcados como `<h3>`/`<h4>`.
- Copiar el mismo componente con datos distintos en dos sitios (propiedades, cuota hipotecaria).

## 8. Lista de comprobación antes de entregar un cambio visual

- [ ] Solo tokens de marca; ningún hex nuevo en componentes.
- [ ] Usé un patrón de §3 en lugar de inventar uno (o añadí el nuevo patrón aquí).
- [ ] Texto ≥ 12 px y contraste según §4; nada de las combinaciones ❌.
- [ ] Campos con `<label>`, iconos con `aria-label`, foco visible, un `<main>` y un `<h1>` por página.
- [ ] Probado a 390 px y 1280 px: sin desbordes, el botón flotante no tapa ningún CTA, objetivos táctiles cómodos.
- [ ] Movimiento respeta `prefers-reduced-motion`; sin animaciones infinitas.
- [ ] Imágenes con `next/image`, `sizes` y `alt`; sin texto ni teléfonos incrustados.
- [ ] Textos en español natural, "tú", sin cifras ni afirmaciones sin respaldo.
- [ ] Si cambié tokens o patrones, actualicé este documento y el resumen de diseño de `AGENTS.md`.
