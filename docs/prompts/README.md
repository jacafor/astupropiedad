# Prompts por sesión

Un prompt = una sesión de Claude Code = un objetivo verificable. Abre una sesión nueva, abre el archivo del prompt, copia el bloque de texto y pégalo. Cada prompt es autónomo (repite lo esencial) y empieza con una línea de **Arranque obligatorio** que obliga a leer las reglas. `AGENTS.md` y `CLAUDE.md` se cargan solos; allí están el **Protocolo de sesión** (qué hacer al empezar y al terminar) y el **resumen de diseño**.

Creados el 2026-10-04 a partir de [ROADMAP.md](../ROADMAP.md) y [DECISIONES.md](../DECISIONES.md).

## Orden recomendado

**Hazlas en serie, no en paralelo.** El proyecto es un repositorio git desde la sesión 00 (2026-10-05) y varias sesiones editan los mismos archivos (`page.tsx`, `Navbar.tsx`, `Footer.tsx`). Dos sesiones a la vez se pisarían los cambios (git permite deshacerlos, pero sería trabajo perdido).

### Fase A — no necesitan nada del cliente

| # | Sesión | Roadmap | Qué cierra | Tú das |
|---|---|---|---|---|
| 00 ✅ | [Git y limpieza](00-git-y-limpieza.md) | P-7, P-8 | Historial + borrar duplicados (hecha 2026-10-05; remoto subido) | URL del repo remoto (opcional) |
| 01 | [Layout, navbar y `<main>`](01-layout-navbar-main.md) | P0 · C5 | Navbar visible en `/propiedades`; sin repetir Navbar/Footer | — |
| 02 | [Enlaces muertos y contenido falso](02-enlaces-y-contenido-falso.md) | P0 · C1, C3 | Ningún botón sin destino ni foto engañosa | — |
| 03 | [Tono "tú" y español natural](03-tono-tu.md) | D-10, P-6 | Un solo tratamiento en todo el sitio | Tu OK a la tabla de cambios |
| 04 | [SEO base](04-seo-base.md) | P0 · C4 | Títulos únicos, robots, sitemap, OG, JSON-LD | — |
| 06 | [Simuladores correctos](06-finance-simuladores.md) | P1 · C7 | Sin `$∞`/negativos; cálculo en `lib/` con pruebas | Moneda (P-4) si quieres cambiarla |
| 08 | [Accesibilidad](08-accesibilidad.md) | P1 | Labels, contraste, foco, movimiento reducido | — |
| 10 | [Actualizar Next y seguridad](10-next-y-seguridad.md) | P0 · C6 | `npm audit` sin críticas | — |
| 11 | [Imágenes y rendimiento](11-imagenes-rendimiento.md) | P2 | `next/image`, WebP, nombres sin espacios | Tu OK a renombrar/borrar |

### Fase B — necesitan datos tuyos o del cliente

| # | Sesión | Necesita | Por defecto si no lo tienes |
|---|---|---|---|
| 05 | [Embudo de leads](05-embudo-leads.md) | URL de un **webhook de prueba** de GHL (P-5) | Flujo por WhatsApp; GHL queda apagado |
| 07 | [Propiedades y fichas](07-propiedades-y-fichas.md) | Datos y fotos reales (D-11) | Marcador "Próximamente" |
| 09 | [Privacidad y términos](09-legal.md) | Texto legal revisado, razón social, RUC | Borrador `noindex` marcado como pendiente |
| 13 | [Analítica y cookies](13-analitica-cookies.md) | ID de Google Analytics / Meta | Solo eventos internos, sin cargar scripts |

### Cierre

| # | Sesión |
|---|---|
| 12 | [Pruebas, CI y documentación de operación](12-pruebas-ci-docs.md) |
| 14 | [Conectar GitHub con Vercel (previews por rama)](14-conectar-vercel.md) — puede hacerse antes; ojo: con la conexión, `push` a `main` = producción |

## Reglas comunes a todas las sesiones

Fuente de verdad: `AGENTS.md` (reglas 1-9, Protocolo de sesión, Diseño — resumen) y `docs/DISENO.md`. Si un prompt choca con ellas, la sesión debe avisar antes de actuar. Lo siguiente es el resumen:

- Responder en español; "tú" en los textos del sitio (D-10).
- Un solo objetivo por sesión. Si aparece otro problema, anotarlo en `docs/ROADMAP.md` y seguir.
- No inventar datos de negocio (cifras, precios, teléfonos, nombres, bancos).
- Contacto solo desde `src/lib/contact.ts`.
- Antes de dar algo por terminado: `npx tsc --noEmit && npm run lint && npm run build`, y reportar el resultado **real**. Lint no puede empeorar (línea base: 6 errores / 17 advertencias).
- Cambios de interfaz: probar en el navegador a 390 px y 1280 px.
- No desplegar. Apagar cualquier servidor que se levante. Borrar los archivos temporales propios (p. ej. `tsconfig.tsbuildinfo`).
- Cambios visuales: tokens de marca y patrones de `docs/DISENO.md`; sin hex sueltos; contraste, texto ≥ 12 px y foco visible.
- Al terminar: marcar la casilla en `docs/ROADMAP.md` (con fecha), anotar decisiones en `docs/DECISIONES.md` y actualizar el `.md` que corresponda.
- Un commit por tarea, en español. Durante el desarrollo: al cerrar, `push` de la rama de la sesión, pull request hacia `main` y merge si todo pasa y el preview está en *Ready* (D-14). Ver `AGENTS.md` → Protocolo de sesión.

## Mantener los prompts al día

Si cambia una regla, un token o una decisión, actualiza `AGENTS.md`/`DISENO.md`/`DECISIONES.md` (las sesiones leen esos archivos al empezar) y revisa que ningún prompt la contradiga. Los prompts no deben repetir cifras ni datos que viven en otro archivo: referencian el archivo.

## Cómo cerrar una sesión

Pide al final: *"Dime qué verificaste de verdad, qué no pudiste verificar y qué decisiones tomaste sin consultarme."* Anota las decisiones nuevas en [DECISIONES.md](../DECISIONES.md).
