# 13 · Analítica y cookies (P1 · Bloque G)

**Tú das:** el ID de Google Analytics (`G-XXXXXXX`) y/o el ID del píxel de Meta, si los quieres usar. Va en `.env.local`/Vercel, no en el chat. Sin IDs, la sesión deja todo listo pero **sin cargar ningún script externo**.
**Depende de:** 05 (eventos de lead) y 09 (política de privacidad/cookies).
**Importante:** los textos y el banner de cookies deben revisarse con asesoría legal (supuesto sin validar).

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: medir visitas y conversiones respetando el consentimiento. Responde en español, tono "tú". Lee docs/auditorias/AUDITORIA-FUNCIONALIDADES.md (Bloque G) y docs/INTEGRACIONES.md §1. En node_modules/next/dist/docs/ revisa la guía de scripts y analytics (next/script, @next/third-parties si existe en esta versión).

Reglas: no cargues Google Analytics ni Meta Pixel antes de que el visitante acepte; no envíes datos personales (nombre, celular, correo) a ninguna herramienta de analítica; los IDs solo desde variables de entorno (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID); si están vacías, no se carga nada.

Tareas:
1. Banner de cookies accesible (teclado, role adecuado, texto en "tú"): "Aceptar" y "Rechazar" con el mismo peso visual; la decisión se guarda (localStorage con try/catch) y se puede cambiar desde un enlace "Preferencias de cookies" en el footer.
2. src/lib/analytics.ts: función track(evento, parámetros) que no hace nada sin consentimiento ni IDs. Eventos mínimos: cta_whatsapp_click (con origen), lead_enviado (origen, sin datos personales), simulador_calculado (tipo), propiedad_vista (id), formulario_error.
3. Cargar los scripts solo tras aceptar y solo si hay ID. Conecta los eventos a los CTAs de WhatsApp y a los formularios existentes.
4. Actualiza /privacidad con una sección de cookies si esa página existe (como borrador pendiente de revisión legal).
5. Documenta eventos, parámetros y cómo probarlos en docs/INTEGRACIONES.md.

Pruebas (build de producción, puerto libre, apágalo): sin consentimiento, la pestaña Red no muestra peticiones a google/facebook; tras aceptar (y con ID de prueba) sí; el rechazo persiste al recargar; los eventos se disparan una vez por acción; 390 px y 1280 px; npx tsc --noEmit && npm run lint && npm run build.

Dime qué verificaste de verdad (si no hubo ID real, no se comprobó la recepción en GA) y qué no. Marca el ROADMAP.
````
