# Cambios

Registro de cambios por sesión de trabajo, reconstruido a partir de `git log` para las sesiones 00 a 11. Las sesiones siguen los prompts de [docs/prompts/](docs/prompts/README.md); el porqué de cada decisión está en [docs/DECISIONES.md](docs/DECISIONES.md). Fechas en formato AAAA-MM-DD.

## 2026-11-07 · Usuarios y roles del administrador (D-36)
- Nueva **`/admin/usuarios`** (solo administradores): dar acceso por correo con rol **administrador** o **editor**, contraseña temporal que se ve una sola vez, cambiar rol, suspender/reactivar, contraseña temporal nueva y quitar acceso, con último ingreso, estado y **registro de cambios**. Nadie se cambia a sí mismo y nunca queda el sitio sin administrador activo.
- Nueva **`/admin/cuenta`** ("Mi cuenta"): cambiar la propia contraseña; quien entra con una temporal tiene que cambiarla antes de seguir. La pantalla de ingreso avisa si el acceso está suspendido.
- El rol **editor** carga, edita, publica y archiva propiedades, pero no ve "Usuarios" (ni entrando por la URL).
- Migración `20261107000000_roles_y_usuarios.sql` (rol, suspensión, contraseña temporal, `es_administrador()`, `listar_usuarios()`, disparador del último administrador, tabla `auditoria_usuarios`), aplicada y probada por SQL en **Pruebas** y en el proyecto del **sitio** (con OK de jforero), junto con `20261107010000_roles_ajustes_revision.sql` (ajustes de la revisión del PR).
- Variable nueva **`SUPABASE_SECRET_KEY`** (solo servidor; sin ella la lista se ve pero no se puede cambiar nada). Pruebas unitarias de las reglas de roles (`roles.test.ts`) y e2e de punta a punta con una editora de prueba (necesita `E2E_SUPABASE_SECRET_KEY`; el script la pide oculta).

## 2026-11-07 · Documentación: dominio de producción y uso de skills (D-35)
- `AGENTS.md`, `CLAUDE.md`, `DESPLIEGUE.md` y los prompts dicen que producción es `https://web.astupropiedad.com` (D-34); D-14 deja de decir "sin dominio". Verificación de D-34 en producción anotada en `DECISIONES.md`.
- `DESPLIEGUE.md` explica el límite del plan gratuito de Vercel (100 despliegues al día): el check falla sin culpa del código y cómo volver a disparar el preview.
- La tabla "Qué skills usar aquí" se reorganiza en tres bloques (auditar y revisar, diseñar y construir, marketing), con rendimiento, contenido SEO, estudio de mercado y LinkedIn. Nuevo paso 5 del Protocolo de sesión: cargar la skill que corresponda antes de trabajar (D-35).

## 2026-11-06 · Dominio `web.astupropiedad.com` y redirección (sesión 5 del plan de arreglos)
- Canonical, `robots`, sitemap, Open Graph y JSON-LD pasan a `https://web.astupropiedad.com` (valor por defecto de `SITE_URL`; no hizo falta tocar variables de Vercel). Cierra SEO-2, SEO-3 y SEO-6 de la auditoría de noviembre.
- `next.config.ts`: `web-as-tupropiedad.vercel.app` redirige con 308 al subdominio, con ruta y parámetros; `/api/*` queda fuera para no romper el cron diario. Los previews no se redirigen.
- YouTube corregido a `@AS-Tupropiedad` (el anterior daba 404). Decisión D-34; P-12 sigue abierto para pasar `www` al sitio nuevo.

## 2026-11-05 · Auditoría completa (sesión 18, solo diagnóstico)
- Nuevo informe [AUDITORIA-COMPLETA-2026-11.md](docs/auditorias/AUDITORIA-COMPLETA-2026-11.md): UX 64, diseño y textos 66, accesibilidad 78, rendimiento 70, SEO 62, seguridad 80 (global 70), con hallazgos con evidencia, estado de cada hallazgo de octubre y plan de arreglos en 12 sesiones. No se cambió código.
- Lo más grave: una ficha "[Prueba]" publicada en producción e indexable; canonical e imagen OG apuntando a un dominio que hoy da 404; el hero ilegible a 390 px; el formulario público sin límite de envíos; promesas sin respaldo en `/vender`.
- ROADMAP con la sección de arreglos propuestos y la línea base actualizada; enlaces al informe en AGENTS.md, CLAUDE.md y README.md.

## 2026-11-05 · Fotos: varias a la vez y orden arrastrando
- `/admin`: nueva zona de carga (`SubirFotos`) para elegir o arrastrar hasta 20 fotos juntas, con vista previa, descripción por foto y una sola casilla de "fotos limpias". Suben una por una ("Subiendo 2 de 5…"); si falta una descripción no sube ninguna; las que fallan quedan en la lista con su error.
- Orden arrastrando el asa ⠿ (ratón o dedo; en celular, sobre la foto) con `Reorder` de framer-motion (ya instalado); al soltar se guarda el orden completo con la nueva acción `ordenarFotos`, que rechaza la lista si las fotos cambiaron. Las flechas y "Hacer portada" siguen para teclado y lector de pantalla. Cada foto muestra su número.
- Verificado con `e2e/admin-con-supabase.ps1` contra Pruebas (con ventana): subida doble con validación, arrastre que cambia la portada y persiste al recargar, botones, 390 px sin desborde.

## 2026-11-05 · Consulta diaria a Supabase (cron de Vercel)
- `/api/mantener-activo` + cron en `vercel.json` (todos los días, 8:00 de Lima): lectura mínima en el proyecto del sitio y en el de pruebas, para que el plan gratuito no los pause (P-16, D-32). Solo responde a Vercel (`CRON_SECRET`).
- Variables nuevas en Vercel Production, con OK de jforero: `CRON_SECRET` (Secret, generado al azar en su terminal), `SUPABASE_PRUEBAS_URL` y `SUPABASE_PRUEBAS_PUBLISHABLE_KEY`.

## 2026-11-05 · Cierre de la sesión 16
- Flujo completo de `/admin` contra Supabase Pruebas superado (`e2e/admin.spec.ts`, 3 de 3 con Supabase): ingreso con error claro, crear con validación, subir fotos, cambiar portada, publicar, verla en catálogo y ficha, reservar, editar el precio y archivar → 404.
- La prueba no había corrido nunca completa: se corrigieron tres selectores (la alerta que Next añade para anunciar rutas, la etiqueta nueva del campo de foto y el enlace de WhatsApp de la tarjeta que repite el título). Nuevo `e2e/admin-con-supabase.ps1` (clave oculta, `--headed`).
- Sesión 16 cerrada. Sigue abierto: la pausa por inactividad del plan gratuito de Supabase (P-16).

## 2026-11-05 · Ficha PDF de cada propiedad
- Nueva ruta `/propiedades/<slug>/ficha.pdf` y botón "Descargar ficha (PDF)" en la ficha web (D-31). Ficha A4 con logo, fotos, datos, descripción, características y contacto; fotos a JPG con `sharp`; caché de 10 min en la CDN y `noindex`.
- Dependencia nueva con OK de jforero: `@react-pdf/renderer` 4.9.0. Pruebas Vitest del PDF (con y sin fotos, tildes, foto ilegible) y e2e del 404.
- Verificado en el build local contra pruebas: PDF de PRUEBA-1, 2 (reservada) y 3; botón a 390 y 1280 px.
- Ajuste tras verificar en producción: con el logo más grande, una ficha corta dejaba la última característica sola en una segunda página. Cabecera y portada más compactas, descripción sin espacios sobrantes y prueba que exige una sola página para una ficha corta.

## 2026-11-05 · Sesión 16 — Fotos de celular en `/admin`
- Las fotos JPG de celulares Samsung (avisos menores del decodificador) ya no se rechazan: `sharp` con `failOn: "error"`. Una foto realmente dañada da un mensaje claro en vez de un error.
- Fotos de más de 4 MB: el navegador las reduce a 2000 px antes de enviarlas (`src/lib/catalogo/reducir.ts`), con el botón "Reduciendo la foto…" y ayuda bajo el campo.
- Verificado en el build local contra pruebas: subida de una foto Samsung real (2,6 MB) y de una de 10 MB, ambas guardadas a 2000 px; luego se quitaron. Pruebas Vitest nuevas para ambos casos.
- Registro público apagado y cuentas de administración autorizadas en los dos proyectos; 3 propiedades `PRUEBA-*` ficticias con fotos de prueba.

## 2026-11-04 · Sesión 16 — Supabase conectado
- Proyectos de la cuenta propia de AS Tupropiedad: **AS Tupropiedad** (`qjspixcfvnrqhugtuadz`, sitio) y **AS Tupropiedad Pruebas** (`uyinlfotfqvygimporfe`). Migraciones aplicadas en ambos por el conector de Supabase.
- Nueva migración `20261104000000_ajustes_asesor.sql` tras el asesor de Supabase: el anónimo no ejecuta `es_admin()`, una sola política de lectura por rol y tabla, sin `EXECUTE` sobre `rls_auto_enable()`.
- Verificado: permisos con SQL (anónimo, usuario sin permiso, administración; transacción deshecha), API REST con la clave publicable en ambos proyectos, y el build local contra pruebas (catálogo vacío honesto, ingreso con error claro). Falta: registro público apagado, cuentas, Vercel y la e2e completa.

## 2026-10-31 · Sesión 16 — Catálogo en Supabase y administrador `/admin`
- Propiedades en Supabase (D-30, reemplaza D-11): migración con tablas, RLS, `es_admin()` y bucket de fotos en `supabase/migrations/`. El sitio usa solo la clave publicable; sin variables, catálogo vacío (D-20).
- `/admin` (correo y contraseña, sin registro público): listado con filtros; crear, editar, publicar, archivar y cambiar estado; fotos a WebP sin metadatos, con descripción obligatoria, orden con botones y portada; vista previa. `noindex`, dinámico, fuera del sitemap y sin barra, pie ni analítica del sitio.
- Lectura pública en `src/data/inventario.ts` con caché de 1 h que `/admin` invalida al guardar; la ficha pasa a `FichaPropiedad` (compartida con la vista previa).
- Dependencias nuevas (con OK de jforero): `@supabase/supabase-js`, `@supabase/ssr`, `sharp`. Pruebas: Vitest del esquema, el mapeo y las fotos; `e2e/admin.spec.ts` (el flujo completo corre solo con un Supabase de pruebas).
- Separado el trabajo de portales: nuevo prompt [17](docs/prompts/17-portales-proppit.md) (Proppit, GHL, salida de Tokko). Pendiente P-16: crear los proyectos de Supabase.

## 2026-10-30 · Sesión 15 — GoHighLevel por API
- `enviarLead` crea en GHL el contacto (upsert), sus etiquetas y una nota, la oportunidad en "1. Propiedades Organico → Nuevo Lead" y, donde se ofrece, la cita en el calendario de llamadas (D-27). Sin las variables de la API sigue el webhook (respaldo) o el plan B de WhatsApp.
- Selector de cita opcional y accesible en `/vender` y en el asesor privado de la home: días y horas libres en hora de Lima, con estados de carga, vacío y error que ofrecen WhatsApp. Si la cita falla, el lead queda y se dice tal cual.
- `src/lib/ghl.ts` y `src/lib/horarios.ts` con pruebas Vitest sobre una API simulada; `e2e/ghl-falso.mjs` reemplaza al webhook falso y `vender.spec.ts` comprueba contacto, oportunidad y cita.
- Variables `GHL_*` creadas en Vercel (token como *Sensitive*). Prueba con el GHL real superada el 2026-10-31 en el preview, con datos ficticios: contacto, oportunidad en "Agendo Llamada" y cita confirmados por jforero.

## 2026-10-29 · Prompt del administrador de propiedades
- Decisión D-29 (dejar Tokko, administrador propio con publicación en portales, GHL como CRM), pendiente P-15 y prompt [16](docs/prompts/16-administrador-propiedades.md). Solo documentación.

## 2026-10-29 · Datos de la empresa, convenios y monedas
- Dirección (Calle San Juan 211, La Molina), horario (lunes a sábado, 8:00 a 20:00 h) y redes sociales en `src/lib/contact.ts`; el pie los muestra y el JSON-LD añade `address`, `openingHoursSpecification` y `sameAs` (D-28).
- Convenios con BBVA, BCP, Scotiabank e Interbank, en texto, en `/simulador-hipotecario` (respaldo escrito pendiente, P-10).
- Venta en USD y alquiler en PEN: `MONEDA_POR_OPERACION` y `src/data/properties.test.ts` (cierra P-4).
- Documentado: GHL por API en lugar de webhook (D-27, sin implementar; prompt [15](docs/prompts/15-ghl-api.md)) y el subdominio `web.astupropiedad.com` (P-12).

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
