# 01 · Layout, navbar visible y `<main>` (P0 · C5)

**Tú das:** nada.
**Depende de:** 00 (para poder revisar el diff y deshacer).

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: mover Navbar, Footer y FloatingWhatsApp a src/app/layout.tsx y arreglar el navbar invisible en /propiedades. Responde en español. Un solo cambio; no toques textos ni estilos que no hagan falta.

Antes de escribir código: lee node_modules/next/dist/docs/ (layouts, usePathname, Link) como exige AGENTS.md. Lee docs/auditorias/AUDITORIA-WEB.md (hallazgo C5) y docs/ARQUITECTURA.md.

Tareas:
1. Navbar, Footer y FloatingWhatsApp se renderizan hoy dentro de cada página. Súbelos a layout.tsx y quítalos de las 7 páginas. Mantén Navbar como componente cliente; el layout debe seguir siendo Server Component.
2. Envuelve el contenido de cada página en un único <main id="contenido"> (en el layout, para que no haya dos). Añade un enlace "Saltar al contenido" visible solo al enfocarlo.
3. C5: en /propiedades el navbar es blanco sobre fondo blanco hasta hacer scroll. Haz que el navbar use el estilo sólido (el de "isScrolled") en las rutas que no empiezan con un hero oscuro; usa usePathname. No cambies el aspecto de la portada "/" con hero.
4. Navbar móvil: el botón de menú necesita aria-label y aria-expanded; el menú debe cerrarse al cambiar de ruta. Footer: cambia los <a href="/..."> internos por next/link.
5. FloatingWhatsApp debe quedar en todas las páginas y no tapar el contenido en 390 px.

Fuera de alcance (anótalo en docs/ROADMAP.md si lo ves): textos, enlaces muertos, SEO, accesibilidad más allá de lo pedido.

Pruebas obligatorias (navegador integrado, build de producción en un puerto libre, apágalo al terminar):
- A 390 px y 1280 px, en las 7 rutas: el navbar se ve sin hacer scroll, el menú móvil abre y cierra, navegar entre rutas cierra el menú.
- Solo hay un <main> y un navbar por página (compruébalo con el DOM).
- El botón flotante aparece en todas las rutas.
- npx tsc --noEmit && npm run lint && npm run build (lint no puede empeorar: 6 errores / 17 advertencias).

Hecho cuando: ninguna página importa Navbar/Footer/FloatingWhatsApp; /propiedades muestra el menú al cargar; marcas la casilla en docs/ROADMAP.md y actualizas docs/ARQUITECTURA.md. Dime qué verificaste de verdad y qué no.
````
