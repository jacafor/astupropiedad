---
description: Auditoría rápida (SEO + accesibilidad + funcionalidad) con las skills del proyecto
argument-hint: [ruta o área, ej. /propiedades o "formularios"]
---

Audita **$ARGUMENTS** (si está vacío, audita todo el sitio).

Proceso:
1. Lee `AGENTS.md`, `docs/ROADMAP.md` y los informes previos `docs/auditorias/AUDITORIA-WEB.md` y `docs/auditorias/AUDITORIA-FUNCIONALIDADES.md` para **no repetir hallazgos ya conocidos** y detectar regresiones o mejoras desde la línea base.
2. Invoca las skills con la herramienta Skill, según el alcance:
   - SEO: `searchfit-seo:seo-audit` y `searchfit-seo:technical-seo` (metadata, robots, sitemap, OG, JSON-LD, enlaces).
   - Accesibilidad: `design:accessibility-review` (WCAG 2.1 AA).
   - UX/funcionalidad: `auditor-ux-app-f100k` (estados, feedback, móvil, leads).
3. Verifica en ejecución, no solo por código: `npm run build`, `npx next start -p 3055`, navegador integrado a **390 px**; prueba cada botón/formulario del alcance. Apaga el servidor al terminar.
4. Corre `npx tsc --noEmit`, `npm run lint` y `npm audit --omit=dev` y compara con la **línea base** de `docs/ROADMAP.md`.

Reglas del informe:
- **Cada hallazgo cita evidencia** (`archivo:línea`, captura o salida de comando). Lo que no pudiste verificar va en "No verificado"; no inventes números.
- Clasifica en 🔴 rompe / 🟡 cuesta uso / 🔵 pulido, y da el arreglo concreto.
- Termina con los 3 arreglos que más mueven la aguja y propón actualizar `docs/ROADMAP.md`.
- **No edites código** durante la auditoría; pregunta antes de aplicar el plan.
