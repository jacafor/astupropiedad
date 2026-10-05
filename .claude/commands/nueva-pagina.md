---
description: Crea una página nueva como Server Component con metadata, sitemap y checklist de calidad
argument-hint: <ruta, ej. /agendar> <objetivo de la página>
---

Crea una página nueva en este proyecto: **$ARGUMENTS**

Antes de escribir código:
1. Lee `AGENTS.md` (reglas del proyecto) y la guía de metadata de Next 16 en `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md`. No confíes en la memoria: este Next tiene cambios incompatibles.
2. Lee `docs/DISENO.md` y 2 páginas vecinas (`src/app/servicios/page.tsx` y la más parecida al objetivo) para respetar patrones.
3. Si la página usa datos de contacto, precios o cifras, revisa `docs/NEGOCIO-Y-CONTENIDO.md`: **no inventes datos**; usa marcadores honestos y avísame.

Reglas de implementación:
- `src/app/<ruta>/page.tsx` es **Server Component** y exporta `metadata` propia: `title` ≤ 60 caracteres, `description` ≈ 150-160, `alternates.canonical`. Un solo `<h1>`.
- Lo interactivo (estado, efectos, framer-motion) va en un componente cliente aparte (`"use client"`), importado desde la página.
- Si el layout aún no incluye Navbar/Footer, impórtalos como lo hacen las otras páginas; usa `<main>`.
- Todo CTA con destino real (ruta, WhatsApp con mensaje prellenado o acción verificada). Cero `href="#"`.
- Formularios: `<label htmlFor>`, consentimiento de datos, estado de carga/éxito/error en español.
- Texto en español, ≥ 12 px, contraste ≥ 4.5:1, `aria-label` en botones de icono.
- Añade la ruta al sitemap (`src/app/sitemap.ts`, si ya existe) y al enlazado interno que corresponda (navbar/footer).

Al terminar:
- Ejecuta `npx tsc --noEmit && npm run lint && npm run build` y reporta el resultado real.
- Ábrela en el navegador a **390 px** y a ≥ 1280 px, y prueba cada botón/formulario.
- Actualiza `docs/ARQUITECTURA.md` (mapa de rutas) y, si cierra una tarea, marca su casilla en `docs/ROADMAP.md`.
