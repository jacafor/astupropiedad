# Cambios

Registro de cambios por sesión de trabajo, reconstruido a partir de `git log` para las sesiones 00 a 11. Las sesiones siguen los prompts de [docs/prompts/](docs/prompts/README.md); el porqué de cada decisión está en [docs/DECISIONES.md](docs/DECISIONES.md). Fechas en formato AAAA-MM-DD.

## 2026-10-23 · Revisión móvil de producción
- Recorrido manual de las 7 rutas en `web-as-tupropiedad.vercel.app` a 390 y 1280 px (menú, WhatsApp, simuladores, paso 1→2 de `/vender`): sin fallos. Casilla cerrada en `docs/ROADMAP.md`; anotados los textos sin respaldo de `/vender`. Solo documentación.

## 2026-10-23 · Sesión 13 — Analítica y cookies
- Banner de cookies accesible (Aceptar/Rechazar con el mismo peso, decisión en `localStorage`) y "Preferencias de cookies" en el pie; sin IDs no aparece ni se carga nada (D-26).
- GA4 y píxel de Meta con `next/script`, solo tras aceptar; `src/lib/analytics.ts` con `track()` y los eventos `cta_whatsapp_click`, `lead_enviado`, `formulario_error`, `simulador_calculado` y `propiedad_vista`, sin datos personales.
- Sección de cookies en `/privacidad` (borrador); 8 pruebas e2e nuevas (`e2e/analitica.spec.ts`); el pie gana margen inferior para que el botón de WhatsApp no tape los enlaces legales.

## 2026-10-23 · Sesión 12 — Pruebas, CI y documentación de operación
- Playwright (`@playwright/test`) con 24 pruebas e2e contra el build de producción: rutas y títulos, menú móvil a 390 px, WhatsApp oficial, simuladores con valores límite y formulario de `/vender` contra un webhook falso local.
- Scripts `test:e2e` y `typecheck` en `package.json`.
- GitHub Actions (`.github/workflows/ci.yml`): typecheck, lint, test y build con Node 24 en cada push y pull request.
- Documentación: `docs/PRUEBAS.md`, `docs/DESPLIEGUE.md` ampliado (variables por entorno, lista previa, volver atrás) y este archivo.

## 2026-10-16 · Sesión 11 — Imágenes ligeras
- `next/image` en fondos y logos; las 3 imágenes más pesadas pasaron a WebP; las 14 imágenes de `public/imagenes/` renombradas a minúsculas con guiones; borrados los SVG de plantilla sin uso (D-24). Lint en 0 advertencias.

## 2026-10-16 · Sesión 10 — Next y seguridad
- `next` y `eslint-config-next` de 16.2.0 a 16.4.2 (`npm audit --omit=dev` en 0).
- `poweredByHeader: false` y cabeceras de seguridad en `next.config.ts`; sin CSP todavía (D-23).

## 2026-10-16 · Sesión 09 — Legal
- Páginas `/privacidad` y `/terminos` en borrador, `noindex` y fuera del sitemap; `ConsentCheckbox` y enlaces legales en el pie (D-22).

## 2026-10-16 · Sesión 08 — Accesibilidad
- Mínimo WCAG 2.1 AA: contraste (tokens `secondary-dark` y `muted`), texto ≥ 12 px, foco visible, landmarks, `reducedMotion` y regiones `aria-live` (D-21).

## 2026-10-14 · Sesión 07 — Propiedades y fichas
- Fuente única `src/data/properties.ts` y fichas `/propiedades/[slug]`; inventario vacío en producción hasta tener datos reales (D-20).

## 2026-10-07 · Sesión 06 — Simuladores
- Matemática en `src/lib/finance.ts` con Vitest (`npm test`); simuladores sin valores inventados, USD/PEN con tipo de cambio escrito por la persona (D-19).

## 2026-10-05 · Sesión 05 — Embudo de leads
- Server Action `enviarLead` (zod, honeypot, POST al webhook de GHL), `LeadForm` y formularios conectados; WhatsApp como plan B (D-18).

## 2026-10-05 · Sesión 04 — SEO técnico
- Metadata por página desde `src/lib/rutas.ts`, `robots.ts`, `sitemap.ts`, imagen OG y JSON-LD `RealEstateAgent` (D-17).
- `AGENTS.md`: verificar en la URL pública de producción tras cada merge.

## 2026-10-05 · Sesión 03 — Tono "tú"
- Todo el sitio en "tú" y español natural; guía de voz (D-10, D-16).

## 2026-10-05 · Sesión 02 — Enlaces y contenido falso
- CTA sin destino enlazados a WhatsApp; fuera cifras sin respaldo, equipo ficticio y la propiedad de Unsplash (D-15).

## 2026-10-05 · Sesión 01 — Layout
- `Navbar`, `Footer` y botón de WhatsApp en `layout.tsx`, un solo `<main>`, barra visible en `/propiedades` (D-13).
- Documentación: push, pull request y merge al cerrar cada sesión (D-14).

## 2026-10-05 · Sesiones 00 y 14 — Git, limpieza y Vercel
- Estado inicial del proyecto en git; se quitó `Imagenes/` (duplicado) y se archivó `legacy/` fuera del repo (D-12).
- Remoto `origin` en GitHub; repositorio conectado a Vercel con previews por rama y producción desde `main` (P-12).
