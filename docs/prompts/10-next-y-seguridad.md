# 10 · Actualizar Next y seguridad (P0 · C6)

**Tú das:** nada.
**Depende de:** 00 (para poder volver atrás si algo se rompe).
**Autorizo en este prompt:** actualizar `next` y `eslint-config-next`. Quita la línea si prefieres hacerlo tú.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: cerrar los avisos de seguridad de next@16.2.0 y endurecer la configuración. Responde en español. La auditoría (docs/auditorias/AUDITORIA-WEB.md, C6) encontró avisos críticos y apuntó a next@16.3.8; verifica tú la versión parcheada real con `npm audit` y el registro de npm, no te fíes de la cifra.

Autorizo: actualizar next y eslint-config-next (y lo estrictamente necesario para que compilen). No autorizo otras dependencias.

Pasos:
1. Antes de tocar nada: guarda en el chat el resultado de `npm audit --omit=dev` y el build/lint actuales como línea base.
2. Lee la guía de actualización en node_modules/next/dist/docs/01-app/02-guides/upgrading/ y las notas de la versión destino. Actualiza con npm install next@<versión> eslint-config-next@<misma>. No uses --force.
3. Corre tsc, lint y build. Si algo rompe, arréglalo con el cambio mínimo o revierte y dime por qué.
4. next.config.ts: `poweredByHeader: false` y cabeceras de seguridad básicas (X-Content-Type-Options, Referrer-Policy, X-Frame-Options o frame-ancestors, Permissions-Policy). NO añadas una Content-Security-Policy estricta sin probar: si la propones, déjala en modo Report-Only y explícame los riesgos para el widget de GHL y las fuentes.
5. Revisa que ningún secreto esté en el código o en archivos versionados (grep) y que .env.local no se versione.

Pruebas: `npm audit --omit=dev` (reporta el resultado real, aunque queden avisos); build de producción y recorrido rápido de las 7 rutas a 390 y 1280 px; comprobar con curl -I que las cabeceras nuevas aparecen. Apaga el servidor.

Actualiza docs/ROADMAP.md (línea base de calidad con los números nuevos) y AGENTS.md (versión de Next y reglas si cambiaron). Dime qué avisos siguen abiertos y por qué, y qué no verificaste.
````
