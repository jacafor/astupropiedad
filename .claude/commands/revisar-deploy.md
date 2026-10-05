---
description: Lista de verificación previa a desplegar a producción (tipos, lint, build, contacto, enlaces, seguridad)
---

Revisa si el proyecto está listo para desplegar. **No despliegues**: solo informa; el despliegue lo autoriza la persona dueña del proyecto.

Ejecuta y reporta el resultado **real** de cada punto:

**Calidad**
1. `npx tsc --noEmit` → debe estar limpio.
2. `npm run lint` → no empeorar la línea base de `docs/ROADMAP.md` (hoy 6 errores / 17 advertencias; meta 0 / 0).
3. `npm run build` → sin errores; revisa que las rutas esperadas aparezcan en el listado.
4. `npm audit --omit=dev` → sin críticas ni altas.

**Contenido y contacto**
5. `grep -rnE "51900000000|900 000 000|DEFAULT_FORM_ID|Replace with real|\(GHL\)|href=\"#\"" src` → debe dar 0 resultados.
6. Teléfono, correo y dominio coinciden con `src/lib/contact.ts` (o con lo confirmado en `docs/DECISIONES.md` P-1) en navbar, footer, botón flotante, metadata y JSON-LD.
7. Ninguna cifra, "garantizado" ni ficha de propiedad sin respaldo (ver `docs/NEGOCIO-Y-CONTENIDO.md` §4).

**Funcionalidad**
8. Sirve el build (`npx next start -p 3055`) y prueba en el navegador a **390 px** y ≥ 1280 px: menú, cada CTA, formularios de punta a punta (con webhook de prueba), simuladores con valores límite. Apaga el servidor.
9. Cada ruta tiene `title`/`description` únicos; `/robots.txt` y `/sitemap.xml` responden 200; el OG se ve bien.
10. Los formularios incluyen consentimiento y los enlaces de privacidad/términos funcionan.

**Seguridad y configuración**
11. No hay secretos en el código (`grep -rnE "api[_-]?key|secret|token" src` y revisar `.env*` no versionados).
12. Variables de entorno de producción definidas en Vercel (ver `docs/INTEGRACIONES.md` §1).
13. Cabeceras de seguridad y `poweredByHeader` revisados en `next.config.ts`.

Entrega: semáforo por sección (🟢/🟡/🔴), lista de bloqueos y recomendación explícita **"desplegar / no desplegar"** con el motivo. Si algo no se pudo verificar, dilo.
