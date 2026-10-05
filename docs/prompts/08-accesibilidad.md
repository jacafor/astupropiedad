# 08 · Accesibilidad (P1)

**Tú das:** nada.
**Depende de:** 01 a 04 (mismos archivos de componentes). Mejor después de la 06.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: llevar el sitio a un mínimo razonable de accesibilidad (WCAG 2.1 AA) con cambios mínimos de diseño. Responde en español. Lee docs/auditorias/AUDITORIA-WEB.md (tabla de accesibilidad) y docs/DISENO.md (colores a evitar para texto pequeño). Línea base de la auditoría: 0 atributos aria, 59 usos de texto de 9-10 px, 61 usos de gray-300/gray-400, <div onClick>, campos sin label.

Tareas:
1. Todo campo de formulario con <label> asociada (htmlFor/id) o aria-label; botones de solo icono con aria-label; el menú móvil con aria-expanded/aria-controls.
2. Texto: nada por debajo de 12 px (text-[9px]/[10px] → mínimo 12 px); contraste ≥ 4.5:1 en texto normal. Sustituye gray-300/400 sobre fondo claro por un token con contraste suficiente (añádelo a @theme en globals.css, sin hex sueltos). Mide el contraste real de los pares principales (no lo estimes): lista par → ratio.
3. Foco visible en enlaces, botones y campos (focus-visible); orden de tabulación lógico; ningún <div onClick> o <span onClick>: usa <button> o <a>.
4. Movimiento: envuelve la app en <MotionConfig reducedMotion="user"> y comprueba que las animaciones de entrada respetan la preferencia.
5. Imágenes: alt descriptivo (o alt="" si son decorativas); íconos decorativos con aria-hidden. Wizard de /vender y filtros del catálogo: estados anunciables (aria-live para errores y para el conteo de resultados) y botones con aria-pressed donde corresponda.
6. Landmarks: un <main>, <nav> con aria-label, <footer>; jerarquía de h1/h2 sin saltos.

Verificación: recorre cada ruta solo con teclado (Tab/Shift+Tab/Enter/Esc) a 390 y 1280 px; activa reducción de movimiento en el navegador y confirma; ejecuta la skill design:accessibility-review (o axe-core inyectado en el navegador integrado) y compara con la línea base; npx tsc --noEmit && npm run lint && npm run build (el lint puede mejorar; no empeorar).

Entrega: tabla antes/después (aria, textos < 12 px, contrastes medidos, hallazgos de la revisión), lo que sigue pendiente y qué no pudiste verificar. Marca el ROADMAP.
````
