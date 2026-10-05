# 12 · Pruebas, CI y documentación de operación (P2)

**Tú das:** que el repositorio ya tenga remoto en GitHub (sesión 00) si quieres CI.
**Depende de:** casi todas las anteriores; hazla al final.
**Autorizo en este prompt:** instalar `@playwright/test`. Quita la línea si no quieres pruebas de navegador.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: dejar red de seguridad y documentación de operación. Responde en español. Lee docs/ROADMAP.md (P2: pruebas y CI) y docs/auditorias/AUDITORIA-FUNCIONALIDADES.md (Bloque H).

Autorizo: instalar @playwright/test (dev). Vitest ya existe si se hizo la sesión 06; si no, no lo instales aquí.

Tareas:
1. Playwright: pruebas de los flujos críticos contra el build de producción (webServer en un puerto libre): el menú abre/cierra a 390 px; el botón de WhatsApp apunta a wa.me/51977588905; cada ruta responde 200 y tiene <title> único; los dos simuladores no muestran NaN/∞ con valores límite; el formulario de /vender muestra error con datos inválidos (sin enviar nada real). Si el webhook de GHL no está configurado, simula la red; nunca envíes datos reales.
2. Scripts en package.json: `test`, `test:e2e`, `typecheck`. No cambies los existentes.
3. Calidad de código: lleva el lint de 6 errores / 17 advertencias a 0 / 0 con el cambio mínimo en cada caso (sin desactivar reglas globalmente; si una regla debe desactivarse en una línea, justifícalo en un comentario).
4. .github/workflows/ci.yml: en cada push y pull request ejecuta typecheck, lint, test y build con Node 24 y caché de npm. Sin secretos. Si el proyecto aún no tiene remoto, crea el archivo igual y dímelo.
5. Documentación nueva: docs/PRUEBAS.md (cómo correr todo y qué cubre), docs/DESPLIEGUE.md (cómo desplegar a Vercel, variables de entorno por entorno, lista previa — usa /revisar-deploy —, cómo volver a la versión anterior; sin desplegar tú), CHANGELOG.md (empieza con lo hecho en las sesiones 00 a 12 según git log).
6. Opcional si te lo confirmo: .claude/settings.json con permisos preaprobados para tsc/lint/build/test y bloqueo de lectura de .env*. Pregúntame antes de crearlo.
7. Actualiza AGENTS.md (comandos nuevos, línea base de lint, "No hay pruebas todavía" ya no es cierto) y el índice de docs.

Pruebas: ejecuta todo (`npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`) y reporta el resultado real de cada uno. No despliegues.

Dime qué verificaste de verdad (en especial si CI no se pudo probar sin remoto) y qué no. Marca el ROADMAP.
````
