<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AS Tupropiedad — guía para agentes

Sitio web de **AS Tupropiedad**, boutique inmobiliaria de Lima (Perú): compra, venta e inversión, con simuladores hipotecario y de rentabilidad. Idioma del sitio y de la documentación: **español**.

> **Estado real (oct 2026):** el sitio es una fachada visual; los formularios y CTAs de conversión **no funcionan** y varios datos son de relleno. Antes de construir encima, lee [docs/ROADMAP.md](docs/ROADMAP.md) y los informes [AUDITORIA-WEB.md](docs/auditorias/AUDITORIA-WEB.md) y [AUDITORIA-FUNCIONALIDADES.md](docs/auditorias/AUDITORIA-FUNCIONALIDADES.md).

## Stack

| | |
|---|---|
| Framework | **Next.js 16.2.0** (App Router, Turbopack por defecto) |
| UI | React 19.2, **Tailwind CSS 4** (`@theme inline` en `globals.css`, sin `tailwind.config`), `framer-motion`, `lucide-react` |
| Lenguaje | TypeScript estricto (`strict: true`), alias `@/*` → `src/*` |
| Fuentes | `next/font`: Geist (sans), Playfair Display (serif), Geist Mono (sin uso) |
| Hosting | Vercel (proyecto `web-as-tupropiedad`, framework `nextjs`) |
| Calidad | ESLint 9 flat config (`eslint-config-next`), `tsc --noEmit`. **No hay pruebas todavía.** |
| Entorno | Node ≥ 20.9 (probado con 24), npm. Windows + PowerShell/Git Bash. **No es un repositorio git** (pendiente de `git init`). |

## Comandos

```bash
npm run dev            # servidor de desarrollo, http://localhost:3000
npm run build          # build de producción (debe terminar sin errores)
npm run start          # sirve el build (usa otro puerto con: npx next start -p 3055)
npm run lint           # eslint (línea base actual: 6 errores, 17 advertencias — no añadas más)
npx tsc --noEmit       # chequeo de tipos (línea base: limpio)
```

`next lint` ya no existe en Next 16: se usa `eslint` directamente (ya configurado así).

## Estructura

```
src/app/                  rutas (App Router): /, /nosotros, /servicios, /propiedades, /vender,
                          /simulador-inversion, /simulador-hipotecario
src/components/           Navbar, Hero, Footer, FloatingWhatsApp, GHLForm (sin uso) y secciones de la home
public/imagenes/          fotos y flyers (nombres con espacios: usar URL-encoding o renombrar)
legacy/                   HTML anterior del sitio — solo referencia, NO editar
Imagenes/                 copia duplicada de public/imagenes — NO usar, candidata a borrarse
docs/                     documentación del proyecto (ver índice abajo)
.claude/commands/         comandos de barra del proyecto (/nueva-pagina, /auditar, …)
```

Mapa completo de rutas, componentes y deuda técnica: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Documentación del proyecto (léela según la tarea)

| Si vas a… | Lee |
|---|---|
| Entender qué hay y cómo está armado | [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) |
| Tocar estilos, componentes o animaciones | [docs/DISENO.md](docs/DISENO.md) |
| Escribir textos, cifras, datos de contacto o temas legales | [docs/NEGOCIO-Y-CONTENIDO.md](docs/NEGOCIO-Y-CONTENIDO.md) |
| Conectar GoHighLevel, WhatsApp, analítica, variables de entorno | [docs/INTEGRACIONES.md](docs/INTEGRACIONES.md) |
| Decidir qué construir ahora | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Ver por qué se decidió algo / qué está pendiente de decidir | [docs/DECISIONES.md](docs/DECISIONES.md) |
| Abrir una sesión nueva por tarea (prompts listos, orden y datos que necesita cada uno) | [docs/prompts/README.md](docs/prompts/README.md) |

## Protocolo de sesión (aplica a TODA sesión nueva, incluidas las de `docs/prompts/`)

**Al empezar** (antes de tocar nada):
1. Lee este archivo completo, `docs/DECISIONES.md` (lo ya decidido y lo pendiente) y la parte de `docs/ROADMAP.md` que toca la tarea. Si la tarea cambia la interfaz, lee también `docs/DISENO.md`.
2. Comprueba las dependencias del prompt (`docs/prompts/README.md`): si exige una sesión previa que el `ROADMAP` no muestra hecha, dilo y espera instrucciones.
3. Si algo del prompt contradice estas reglas o `DECISIONES.md`, **avisa antes de actuar**; las reglas mandan sobre el prompt, salvo que el usuario diga expresamente lo contrario.
4. Una sesión = un objetivo. Lo demás que veas, anótalo en `docs/ROADMAP.md` y sigue.

**Mientras trabajas:** un cambio verificable por vez; sin datos de negocio inventados; contacto solo desde `src/lib/contact.ts`; sin dependencias nuevas, borrados, despliegues ni envío de datos reales sin permiso (lista "Pregunta primero").

**Al terminar:**
1. `npx tsc --noEmit && npm run lint && npm run build`, con el resultado **real**.
2. Si cambió la interfaz: pruebas en el navegador a 390 px y 1280 px; apaga el servidor; borra temporales propios (`tsconfig.tsbuildinfo`, capturas).
3. Actualiza en el mismo cambio: la casilla de `docs/ROADMAP.md` (con fecha), `docs/DECISIONES.md` (decisiones nuevas con estado, fecha y responsable; pendientes cerrados), y el `.md` afectado (`ARQUITECTURA`, `DISENO`, `INTEGRACIONES`, `NEGOCIO-Y-CONTENIDO`, esta guía si cambian comandos, estructura o línea base).
4. Si el repo ya es git (`git status` funciona): un commit por tarea, en español, sin `--no-verify` ni `push` sin que te lo pidan. Si aún no es git, no lo inicialices salvo que el prompt (sesión 00) lo pida.
5. Cierra con: qué verificaste de verdad, qué no pudiste verificar y qué decidiste sin consultar.

## Diseño — resumen obligatorio (detalle y ejemplos: [docs/DISENO.md](docs/DISENO.md))

- **Identidad:** boutique inmobiliaria "de lujo" en Lima: titulares serif, mayúsculas con tracking en etiquetas, pesos `black`, esquinas redondeadas. **La legibilidad pesa más que el efecto.**
- **Tokens, nunca hex sueltos:** `primary #014898`, `secondary #7CC04B`, `accent #41AEE5`, `dark #122137`, `light #f8fafc` (en `@theme` de `globals.css`). Si falta un color, créalo allí.
- **Reutiliza los patrones** de `docs/DISENO.md` §3 (encabezado de sección con eyebrow + serif, CTA principal verde con texto `dark`, tarjeta blanca `rounded-3xl`, entrada con `whileInView`). No inventes un estilo nuevo si existe uno.
- **Contenedor de sección:** `py-24` + `max-w-7xl mx-auto px-6 lg:px-12`; hero interno `pt-40 pb-20`.
- **Prohibido en texto:** `gray-400` o `secondary` sobre blanco, `gray-500` sobre `dark`, `white/50` sobre `primary` para texto pequeño; texto < 12 px; `<div onClick>`; copiar un componente con datos distintos (extrae uno compartido).
- **Móvil primero:** 390 px y ≥ 1280 px; el botón flotante de WhatsApp no tapa ningún CTA.
- **Imágenes:** `next/image` con `sizes`; fotos limpias (sin teléfonos ni precios incrustados); nombres en minúsculas con guiones.
- **Voz del sitio:** español natural de Perú, tratamiento "tú" (D-10), sin anglicismos innecesarios ni afirmaciones absolutas.

## Reglas de Next 16 que más se rompen (verificadas en `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`)

- **APIs de petición asíncronas:** `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` solo se acceden con `await`. El acceso síncrono fue eliminado.
- **`middleware` se llama `proxy`** (`proxy.ts`). Misma función, nuevo nombre.
- **`export const metadata` / `generateMetadata` solo funcionan en Server Components.** Una página con `"use client"` no puede exportarlos: ponla como Server Component y mueve lo interactivo a un componente cliente aparte. *(Hoy las 7 páginas incumplen esto — es el hallazgo C4 de la auditoría.)*
- **`next/image`:** `images.domains` está deprecado (usar `remotePatterns`); `qualities` por defecto es solo `[75]`; imágenes locales con query string requieren `images.localPatterns`; `next/legacy/image` está deprecado.
- **Scroll suave:** `scroll-smooth` en `<html>` ya no se desactiva en cambios de ruta salvo que se añada `data-scroll-behavior="smooth"`.
- **Formularios:** preferir Server Actions + `useActionState` (guía `01-app/02-guides/forms.md`). Trabajo posterior a la respuesta (analítica, logs) con `after()` de `next/server`.
- **JSON-LD:** `<script type="application/ld+json">` en el layout/página, escapando `<` como `<` (guía `json-ld.md`).
- Antes de usar cualquier API nueva de Next, abre su página en `node_modules/next/dist/docs/` — no confíes en la memoria.

## Convenciones de código (las que ya sigue el repo)

- Componentes: función flecha con `export default` al final; `"use client"` en la primera línea si hay estado, efectos o `framer-motion`.
- Iconos de `lucide-react`; animaciones de entrada con `motion` + `whileInView` + `viewport={{ once: true }}`.
- Estilos con utilidades de Tailwind y los tokens de marca (`primary`, `secondary`, `accent`, `dark`, `light`). No introduzcas colores hex sueltos: añádelos a `@theme` en `globals.css`.
- Contenedor estándar de sección: `py-24` + `max-w-7xl mx-auto px-6 lg:px-12`.
- `clsx` y `tailwind-merge` están instalados pero no hay helper `cn()`; si lo necesitas, créalo en `src/lib/utils.ts`.
- Enlaces internos con `next/link` (el footer actual usa `<a>` — corrígelo si lo tocas). Imágenes con `next/image` en código nuevo.

## Reglas del proyecto (obligatorias)

1. **No inventes datos de negocio.** Cifras, precios, teléfonos, nombres del equipo, tasas, alianzas bancarias y fichas de propiedades deben venir del cliente. Si falta el dato, usa un marcador honesto ("Próximamente") y avisa; nunca un número verosímil.
2. **Una sola fuente de verdad para el contacto.** Teléfono, WhatsApp, correo, dominio y dirección viven en `src/lib/contact.ts` y se importan; no los repitas en componentes. Valores confirmados el 2026-10-04: WhatsApp 51977588905, correo ventas@astupropiedad.com, dominio astupropiedad.com. Si ves otro teléfono o dominio (imágenes, `legacy/`, `GHLForm`), es residuo viejo. Nunca uses `51900000000`.
3. **Ningún botón sin destino.** Todo CTA enlaza a una ruta real, abre WhatsApp o dispara una acción verificada. Si aún no hay backend, enlaza a WhatsApp con mensaje prellenado. Cero texto interno de desarrollo visible (`(GHL)`, `Replace with real number`).
4. **Sin afirmaciones absolutas** ("garantizado", "100% seguro") ni cifras de mercado sin respaldo — ver política en [docs/NEGOCIO-Y-CONTENIDO.md](docs/NEGOCIO-Y-CONTENIDO.md).
5. **Los cálculos financieros no van dentro de componentes.** Extraer a `src/lib/finance.ts` (funciones puras, con pruebas) y validar entradas: nunca mostrar `$∞`, `NaN` ni negativos.
6. **Páginas nuevas = Server Component con `metadata` propia** (title ≤ 60 car., description ≈ 150-160) + entrada en el sitemap. Usa `/nueva-pagina`.
7. **Accesibilidad mínima en todo cambio:** `<label>` asociado a cada campo, `aria-label` en botones de solo icono, `<main>` por página, texto ≥ 12 px, contraste ≥ 4.5:1, foco visible, `prefers-reduced-motion` respetado. Colores a evitar para texto pequeño: ver [docs/DISENO.md](docs/DISENO.md).
8. **Datos personales:** todo formulario lleva casilla de consentimiento y enlace a `/privacidad`. Los secretos solo en variables de entorno (`.env.local`, Vercel); nunca en el código ni en el repo.
9. **Móvil primero:** verifica cada cambio visual a **390 px** (y ≥ 1280 px). El menú móvil debe seguir abriendo y todo CTA debe ser alcanzable con el pulgar.

## Antes de dar algo por terminado

```bash
npx tsc --noEmit && npm run lint && npm run build
```
- Reporta el resultado **real**, aunque falle. Si el lint empeora respecto a la línea base (6 errores / 17 advertencias), arréglalo.
- Para cambios de UI: abre la página en el navegador a 390 px y pruébala (menú, CTAs, formularios). No declares "funciona" sin haberlo probado.
- Si tocaste un formulario o CTA: pruébalo de punta a punta y confirma que el dato llega (o que el enlace abre el destino correcto).

## Pregunta primero (no lo hagas por tu cuenta)

- Desplegar a producción o cambiar la configuración de Vercel / dominio.
- Instalar o actualizar dependencias (salvo lo pedido explícitamente).
- Borrar o renombrar imágenes de `public/imagenes/` o carpetas (`Imagenes/`, `legacy/`).
- Cambiar teléfono, correo, dominio, cifras o textos legales.
- Enviar datos reales a GoHighLevel u otros servicios externos durante pruebas (usa datos de prueba y un webhook de prueba).

## Qué skills usar aquí

| Tarea | Skill / comando |
|---|---|
| Auditoría SEO completa / técnica / on-page | `searchfit-seo:seo-audit`, `searchfit-seo:technical-seo`, `searchfit-seo:on-page-seo`, `/auditar` |
| Datos estructurados | `searchfit-seo:schema-markup` |
| Enlaces rotos / enlazado interno | `searchfit-seo:broken-links`, `searchfit-seo:internal-linking` |
| Accesibilidad | `design:accessibility-review` |
| UX del producto (estados, feedback, móvil, leads) | `auditor-ux-app-f100k` |
| Pulido visual / animación (stack Next + Tailwind) | `ux-elevacion-formula100k` |
| Seguridad de cambios | `security-review` |
| Nueva página / revisión previa a desplegar / prueba móvil | `/nueva-pagina`, `/revisar-deploy`, `/probar-movil` |
