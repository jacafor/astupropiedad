---
description: Recorrido real a 390 px en el navegador integrado (menú, CTAs, formularios, simuladores)
argument-hint: [ruta, ej. /vender] (vacío = todas las páginas)
---

Haz un recorrido en teléfono de **$ARGUMENTS** (si está vacío, las 7 páginas: `/`, `/nosotros`, `/servicios`, `/propiedades`, `/vender`, `/simulador-inversion`, `/simulador-hipotecario`).

Preparación:
1. Levanta la app con el servidor `web` de `.claude/launch.json` (`npm run dev`) o, para probar producción, `npm run build` + `npx next start -p 3055`. **Apágalo al terminar.**
2. Navegador integrado: viewport **390×844** (`resize_window`). Al final vuelve a `desktop`.

Pruebas por página (captura en cada una y anota el resultado):
1. **Menú:** ¿se ve el botón hamburguesa desde la carga (sin hacer scroll)? ¿abre, navega y cierra? (en `/propiedades` debe verse: blanco sobre blanco era un fallo conocido).
2. **Desbordamiento:** `document.documentElement.scrollWidth === clientWidth` (sin scroll horizontal).
3. **Cada botón y enlace:** ¿lleva a un destino real o confirma algo? Lista los que no hacen nada y los `href="#"`.
4. **Botón flotante de WhatsApp:** ¿tapa algún CTA? ¿abre el número oficial con mensaje?
5. **Formularios y simuladores:** prueba valores normales **y límite** (vacío, 0, negativo, enorme). Nunca debe mostrar `$∞`, `NaN` ni negativos. En formularios: ¿hay etiqueta, validación, estado de carga y confirmación real?
6. **Legibilidad:** texto ≥ 12 px, contraste del hero y de los textos sobre imagen.
7. **Consola y red:** errores de consola, peticiones fallidas.

Al formular datos de prueba usa valores ficticios y **no envíes datos reales** a servicios externos (webhook de prueba).

Entrega: tabla página × prueba (✅/⚠️/❌) con evidencia, y los fallos nuevos frente a `docs/auditorias/AUDITORIA-WEB.md`/`docs/auditorias/AUDITORIA-FUNCIONALIDADES.md`. No edites código sin que lo pida.
