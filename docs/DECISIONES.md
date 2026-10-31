# Decisiones

Registro corto de decisiones técnicas y de producto. Formato: contexto → decisión → consecuencias. Añade una entrada nueva (no reescribas las antiguas) cuando cambie algo importante; si una decisión se revierte, márcala como *reemplazada por D-N*.

**Estados:**
- **Heredada** — ya estaba en el código al configurar el proyecto; nadie la "decidió" en esta fase, pero el código depende de ella.
- **Propuesta** — la sugirió Claude y **nadie la ha aceptado todavía**. No la trates como acuerdo.
- **Aceptada** — la persona responsable la confirmó (con fecha).

Cada entrada lleva `estado`, `fecha` y `responsable` (quien debe validarla). Para aceptar una propuesta, cambia el estado y escribe la fecha.

## Tomadas

### D-1 · Next.js 16 con App Router
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Contexto:** sitio de marketing con simuladores; despliegue en Vercel.
- **Decisión:** Next.js 16.2.0 (Turbopack por defecto), React 19.2, App Router.
- **Consecuencias:** APIs de petición asíncronas, `proxy` en lugar de `middleware`, `metadata` solo en Server Components. Antes de escribir código leer `node_modules/next/dist/docs/` (regla de `AGENTS.md`). Actualizado a `16.4.2` el 2026-10-16 por avisos de seguridad (D-23).

### D-2 · Tailwind CSS 4 con tokens en CSS
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Decisión:** tokens de marca en `@theme inline` de `globals.css`; sin `tailwind.config`.
- **Consecuencias:** colores nuevos = token nuevo, no hex suelto. Ver [DISENO.md](DISENO.md).

### D-3 · Animación con framer-motion
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Decisión:** `motion` + `whileInView` para entradas; `lucide-react` para iconos.
- **Consecuencias:** obliga a componentes cliente. Limitar su uso a donde aporte y respetar `prefers-reduced-motion`.

### D-4 · GoHighLevel como CRM
- **Estado:** **Propuesta** (inferida: solo existe un componente `GHLForm` sin uso y textos "(GHL)" en botones; no hay credenciales ni confirmación) · **Fecha:** 2026-10-04 · **Responsable:** cliente / quien administra GHL
- **Decisión propuesta:** los leads se envían a GHL (formularios, calendario, flujos).
- **Consecuencias:** requiere credenciales y definición del flujo de atención. Ver [INTEGRACIONES.md](INTEGRACIONES.md). *(Método: webhook en D-18, **reemplazado por la API en D-27** el 2026-10-29.)*

### D-5 · Sitio estático primero
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** equipo técnico
- **Decisión propuesta:** mantener las páginas estáticas mientras sea posible; lo dinámico (leads, inventario) entra por Server Actions y datos en build/ISR.
- **Consecuencias:** las fichas de propiedad usarán `generateStaticParams`; el catálogo leerá de `src/data` o Supabase (ver P-3).

### D-6 · Documentación como parte del código
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** equipo técnico
- **Decisión propuesta:** `AGENTS.md`/`CLAUDE.md` + `docs/` se mantienen en el mismo cambio que el código; el roadmap se marca al cerrar tareas.

### D-7 · Informes de auditoría en `docs/auditorias/`
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero (aprobó el movimiento en chat)
- **Contexto:** los informes se generaron en la raíz del repo y la saturaban.
- **Decisión:** `AUDITORIA-WEB.md` y `AUDITORIA-FUNCIONALIDADES.md` viven en `docs/auditorias/`. Son una **foto de oct 2026**: no se editan al avanzar; el seguimiento vive en [ROADMAP.md](ROADMAP.md). Una auditoría nueva = archivo nuevo con fecha.
- **Consecuencias:** enlaces reescritos en AGENTS.md, CLAUDE.md, README.md, docs/ y `.claude/commands/`.

### D-8 · Metas de calidad del sitio
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** jforero / cliente
- **Decisión propuesta:** al terminar las fases 0-2 del roadmap, repetir la auditoría con meta **SEO ≥ 75, UX ≥ 70, accesibilidad ≥ 80** y lint 0 errores / 0 advertencias. Línea base: SEO 32, UX 36, accesibilidad ≈ 35 (estimada).
- **Consecuencias:** son números elegidos por Claude para tener un criterio de "terminado"; ajústalos si el negocio pide otro nivel.

### D-9 · Datos de contacto oficiales (cierra P-1)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero (los entregó en chat; conviene que el cliente los ratifique por escrito)
- **Decisión:** WhatsApp/teléfono **+51 977 588 905** (`51977588905`), correo **ventas@astupropiedad.com**, dominio **astupropiedad.com** (se deduce del correo: el usuario no escribió el dominio aparte).
- **Consecuencias:** viven solo en `src/lib/contact.ts` (creado el mismo día y usado en navbar, footer y botón flotante; verificado en el HTML de `/`, `/propiedades` y `/vender`). Quedan **residuos viejos** (ver P-11).
- **Sin decidir:** si el sitio responde en `astupropiedad.com` o `www.astupropiedad.com` (hoy se asume sin `www`), y qué pasa con el dominio `.pe` que aparece en `GHLForm` y en el HTML anterior (archivado, ver D-12).

### D-10 · Tratamiento "tú" (cierra P-2)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero
- **Decisión:** todo el sitio trata al visitante de **"tú"**, sin mezclar con "usted". Aplica a CTAs, simuladores, formularios y mensajes de error.
- **Consecuencias:** hay que reescribir los textos que hoy usan "usted" (ejemplo: "Agende una videollamada…" en el footer). Aplicado en la sesión 03 (2026-10-05, ver D-16).

### D-11 · El inventario lo actualiza jforero, en código (cierra P-3)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero
- **Decisión:** las propiedades viven en `src/data/properties.ts` (un solo archivo, un tipo `Property`). Quien actualiza el inventario es jforero, con Claude o a mano; no hay panel ni base de datos por ahora.
- **Consecuencias:** no se necesita Supabase en esta etapa. Si más personas van a editar inventario sin tocar código, esta decisión se revisa (entrada nueva). *(Reemplazo previsto: D-29, 2026-10-29; sigue vigente hasta que se implemente.)*

### D-12 · Repositorio git y limpieza de duplicados (cierra P-7 y P-8)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 · **Responsable:** jforero
- **Decisión:** el proyecto es un repositorio git (rama `main`, identidad local Jaime Forero, sin `--global`). `Imagenes/` se eliminó tras comprobar de nuevo que sus 14 archivos eran idénticos byte a byte a los de `public/imagenes/` y que nada en `src/` ni en la configuración la usaba. `legacy/` (2 HTML) se archivó en `../Web-AS-Tupropiedad-respaldo/legacy.zip`, fuera del proyecto, y se quitó del árbol.
- **Consecuencias:** ambas carpetas siguen recuperables en el primer commit ("Estado inicial del proyecto"). El remoto es `origin` = https://github.com/jacafor/astupropiedad (primer `git push -u origin main` el 2026-10-05). La visibilidad **privada** no se pudo comprobar desde aquí: confírmala en GitHub → Settings. Con remoto ya se puede habilitar CI (ver `docs/prompts/12-pruebas-ci-docs.md`).

### D-13 · Estilo de la barra de navegación según la ruta
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la decidió Claude en la sesión 01 sin consultar)
- **Decisión propuesta:** la barra es transparente con texto blanco solo en las rutas listadas en `RUTAS_CON_HERO_OSCURO` (`Navbar.tsx`); en cualquier otra ruta es sólida desde el inicio. Así una página nueva con fondo claro nunca deja la barra invisible.
- **Consecuencias:** al crear una ruta con hero oscuro, hay que añadirla a esa lista (anotado en `ARQUITECTURA.md`).

### D-14 · Push, pull request y merge al cerrar cada sesión (durante el desarrollo)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 (ampliada el mismo día para incluir el merge) · **Responsable:** jforero
- **Decisión:** cada sesión termina con `push` de su rama, pull request hacia `main` y **merge automático por Claude**, sin que haya que pedirlo. Condiciones: `tsc`, lint y build locales pasan (lint sin empeorar) y el preview de Vercel está en *Ready*; si algo falla, no se fusiona y se avisa. Cada merge **despliega a producción** (solo en `*.vercel.app`; sin dominio). Vigente hasta que jforero declare terminado el desarrollo; entonces se revisa (y se puede reabrir la protección de `main`, ver P-12).
- **Consecuencias:** reemplaza la regla anterior "sin `push` salvo que se pida" de `AGENTS.md` y `docs/prompts/README.md`.

### D-15 · Contenido sin respaldo se quita, no se sustituye (sesión 02)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la tomó Claude en la sesión 02 sin consultar; reversible)
- **Decisión propuesta:** aplicando el valor por defecto de P-10, se quitaron cifras, nombres de bancos, "garantizado"/"100 %" y el equipo ficticio (en `/nosotros` queda una sección "Pronto conocerás al equipo" con WhatsApp, sin personas inventadas). La propiedad de Unsplash de la home pasó a una tarjeta "Próximamente". Los CTA sin embudo enlazan a WhatsApp con mensaje contextual (los simuladores incluyen los valores que escribió la persona). Redes sociales y Privacidad/Términos se ocultan hasta tener URL y páginas.
- **Consecuencias:** al reponer una cifra o un nombre, debe traer fuente y fecha. Al llegar el embudo (sesión 05), los CTA de WhatsApp se cambian por el formulario.

### D-16 · Español natural salvo marca o servicio (cierra P-6)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 · **Responsable:** jforero (aprobó la tabla de cambios en la sesión 03; el cliente aún no ha revisado la lista)
- **Decisión:** se aplicó el valor por defecto de P-6. Se conservan **Personal Shopper** (servicio de la marca; jforero lo confirmó), *Premium*, *marketing*, *Boutique Inmobiliaria*; *cap rate*, TEA y *home staging* se conservan **explicados** la primera vez; el resto de anglicismos se tradujo. Se eliminaron todas las formas de "usted" (cumple D-10). Detalle y lista en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) §3.
- **Consecuencias:** si el cliente pide recuperar un término en inglés como marca, se revierte ese texto (entrada nueva). Impacto SEO: los titulares ya no usan "Real Estate"/"Flat"; las búsquedas peruanas dicen "departamento" e "inmobiliaria".

### D-17 · Metadata centralizada y JSON-LD mínimo (sesión 04)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la tomó Claude sin consultar; reversible)
- **Decisión propuesta:** títulos y descripciones viven en `src/lib/rutas.ts` y se aplican con `rutaMetadata()`; el sitemap sale de la misma lista. Del borrador de la auditoría se descartaron las frases sin respaldo ("valoración gratuita", "experiencia bancaria", "red de compradores calificados"). El JSON-LD `RealEstateAgent` solo lleva nombre, URL, teléfono, correo y logo. Canonical y sitemap asumen `astupropiedad.com` sin `www` (P-12).
- **Consecuencias:** hasta asignar el dominio, canonical/OG/sitemap apuntan a un dominio que aún sirve otra web. Detalle en [SEO.md](SEO.md).

### D-18 · Leads por webhook de GHL, con WhatsApp como plan B (sesión 05; cierra la parte "método" de P-5)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la tomó Claude aplicando el valor por defecto de P-5; reversible)
- **Decisión propuesta:** los formularios envían por Server Action (`enviarLead`) a un **webhook** de GHL (`GHL_WEBHOOK_URL`, solo servidor), no por la API. Si el webhook no está configurado o falla, se muestra un error honesto y un botón de WhatsApp con los datos ya escritos; nunca un "Enviado" falso. Se instaló `zod` (autorizado por jforero). Detalle y mapeo de campos en [INTEGRACIONES.md](INTEGRACIONES.md) §2.
- **Decidido sin consultar:** celular en E.164 sin espacios (`+51987654321`); correo opcional en todos los formularios; se quitó la promesa "en los próximos 10 minutos" del asistente de `/vender` (P-9); el "Contactar a un Broker" es el CTA de la calculadora de la home (`home-hipoteca:cta`); los formularios de asesor privado y reclutamiento quedaron visibles en la página (no tras un botón); un honeypot relleno responde "OK" sin enviar nada.
- **Sigue abierto en P-5:** URL del webhook de prueba, pipeline, campos y etiquetas. El envío **no se ha probado contra GHL real**. La casilla de consentimiento enlaza a `/privacidad` (existe desde la sesión 09, D-22).

### D-19 · Simuladores sin valores inventados; matemática en `lib/finance.ts` (sesión 06)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-07 · **Responsable:** jforero (la tomó Claude; reversible)
- **Decisión propuesta:** toda la cuenta vive en `src/lib/finance.ts` (Vitest, `npm test`; se instaló vitest 4 porque el 5 choca con `@types/node` 20). Alcabala, impuesto a la renta, gastos notariales, plusvalía, mantenimiento, arbitrios, ingreso y tope cuota/ingreso empiezan **vacíos** y vacío = "no se incluye"; cada uno lleva la nota "confírmalo con tu notario o contador". USD/PEN con tipo de cambio que escribe la persona (sin valor por defecto; P-4 sigue abierta para la moneda de los precios). La "Relación cuota/ingreso" fija de 3.5x se sustituyó por un porcentaje calculado con el ingreso que la persona escribe. En la home, la calculadora de rentabilidad se rotuló **bruta** (antes decía cap rate).
- **Decidido sin consultar:** límites (montos ≤ 1 000 millones, TEA 0-100 %, plazo 1-40 años); precio y alquiler del simulador de inversión (350 000 / 1 800) y TEA 8,5 % siguen con los valores de ejemplo que ya tenía el código; mantenimiento y arbitrios pasaron de 450 / 1 200 a vacío; la home sigue solo en USD; el plazo hipotecario pasó de lista cerrada a campo numérico (para poder validar 0).
- **Pendiente de validar:** la TEA de ejemplo de 8,5 % no tiene respaldo (¿qué tasa de referencia quiere el cliente?); fórmulas contra un simulador bancario real.

### D-20 · Inventario vacío hasta tener datos reales (sesión 07)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-14 · **Responsable:** jforero (la tomó Claude; reversible)
- **Decisión propuesta:** `src/data/properties.ts` es la única fuente (D-11). Al no entregarse fichas reales, se **descartaron las 6 propiedades del catálogo y las 2 de la home** (contradecían los flyers, P-13). En producción el catálogo y la home muestran un estado vacío honesto con WhatsApp; el único elemento (EJEMPLO, `noindex`) solo aparece en desarrollo o con `MOSTRAR_EJEMPLO=1`.
- **Decidido sin consultar:** el chip "Inversión" se quitó (no es una operación y no había datos) y los chips muestran solo operaciones con propiedades; el botón cuadrícula/lista, que no hacía nada, se quitó; el catálogo lista solo `disponible` (las `reservado`/`vendido` conservan su ficha); `dynamicParams = false` en la ficha.
- **Consecuencias:** sin propiedades reales la web no muestra ninguna. Ver el paso a paso en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md).

### D-21 · Accesibilidad mínima WCAG 2.1 AA (sesión 08)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-16 · **Responsable:** jforero (la tomó Claude; reversible)
- **Decisión propuesta:** tokens `secondary-dark` y `muted` para texto sobre fondo claro; ningún texto bajo 12 px; foco global (contorno azul + halo blanco); `<MotionConfig reducedMotion="user">` (`Providers`); encabezados sin saltos; `<nav aria-label>`, `<aside>` para el botón de WhatsApp; Esc cierra el menú móvil; conteo de resultados del catálogo y "Paso N de 3" de `/vender` en regiones `aria-live`.
- **Decidido sin consultar:** se **quitó el modo oscuro automático** de `globals.css` (`prefers-color-scheme: dark`): el sitio solo está diseñado en claro y con un sistema en modo oscuro `/propiedades` mostraba texto azul sobre negro (contraste 1.2:1); eyebrows verdes sobre fondos `primary` pasaron a blanco (3.98:1 no alcanza); el icono del botón de WhatsApp pasó de blanco a `dark` (blanco sobre #25D366 = 1.98:1); el pie usa `h2` en lugar de `h4`.
- **Sin verificar:** lector de pantalla real y `prefers-reduced-motion` en navegador (solo configuración en código).

### D-22 · Páginas legales en borrador, `noindex` y fuera del sitemap (sesión 09)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-16 · **Responsable:** jforero + asesoría legal (el texto lo redactó Claude; no es asesoría legal)
- **Decisión propuesta:** `/privacidad` y `/terminos` existen como borrador con aviso visible, `robots: noindex` y fuera de `sitemap.xml`. El interruptor es **uno solo**: `LEGALES_EN_BORRADOR` en `src/lib/legal.ts` (lo leen `rutaMetadata` y `sitemap.ts`; las rutas llevan `legal: true` en `rutas.ts`). Todo dato no entregado es un `[PENDIENTE: …]` visible (razón social, RUC, domicilio, plazo de conservación, proveedores y transferencias, cookies, Libro de Reclamaciones, ley aplicable). La casilla pasó a `ConsentCheckbox`.
- **Decidido sin consultar:** no se nombra a GoHighLevel como hecho (solo "CRM, hoy previsto GoHighLevel" como pendiente); se menciona que WhatsApp y el alojamiento intervienen; el borrador no afirma "no usamos cookies".
- **Consecuencias:** al aprobar el texto, rellenar los pendientes y poner `LEGALES_EN_BORRADOR = false`.

### D-23 · next 16.4.2 y cabeceras de seguridad, sin CSP todavía (sesión 10)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-16 · **Responsable:** jforero (la tomó Claude; reversible)
- **Decisión propuesta:** `next` y `eslint-config-next` pasaron de 16.2.0 a **16.4.2** (autorizado por jforero; sin otras dependencias). La auditoría decía 16.3.8, pero `npm audit` y el dist-tag `latest` del registro indican 16.4.2 como la versión parcheada. `next.config.ts` añade `poweredByHeader: false` y las cabeceras `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` y `Permissions-Policy` (cámara, micrófono, geolocalización, pago y USB desactivados).
- **Decidido sin consultar:** `X-Frame-Options: DENY` (nada incrusta este sitio hoy). **No se añadió CSP**: una política estricta sin probar puede romper el widget/calendario de GHL (`script-src`, `frame-src`, `connect-src`) y los estilos/scripts en línea de Next y framer-motion (obligan a `'unsafe-inline'` o a nonces, que además vuelven dinámicas las páginas). Las fuentes de `next/font` se sirven desde el propio dominio, así que no son el riesgo principal. Al integrar GHL, proponerla primero como `Content-Security-Policy-Report-Only` y leer los informes antes de aplicarla.
- **Consecuencias:** quedan 8 avisos del `npm audit` completo, todos en dependencias de desarrollo; no se tocaron por no estar autorizados.

### D-24 · Imágenes ligeras, renombradas y con `next/image` (sesión 11)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-16 · **Responsable:** jforero (la tomó Claude; reversible con git)
- **Decisión propuesta:** las 14 imágenes de `public/imagenes/` se renombraron a minúsculas con guiones (`flyer-…`, `foto-edificio-…`, `logo-as-tupropiedad.png`). Las 3 que usa el sitio y pesaban más (PNG de 944 KB, JPEG de 301 y 145 KB) pasaron a WebP calidad 82 (≈ 97, 165 y 119 KB; revisado a ojo). Los 3 fondos CSS (Hero, `/nosotros`, `/vender`) y los `<img>` del pie y de PersonalShopper usan `next/image` (`fill` + `sizes`, `priority` solo en la imagen principal de cada página). Se borraron los 5 SVG de plantilla de `public/` (sin referencias). Lint: 0 advertencias.
- **Decidido sin consultar:** **no** se borró `foto-edificio-rojo-blanco.jpg` (antes `6601394_…`): ningún archivo la usa, pero es una foto de propiedad y el prompt prohíbe borrarlas. Los fondos de `/nosotros` y `/vender` llevan `alt=""` (decorativos, al 10 % y 20 % de opacidad bajo texto). Los flyers sin uso solo se renombraron (siguen pesando ~1 MB los 3 PNG, pero no se sirven). El `<img>` de `og-image.tsx` se queda: `ImageResponse` no admite `next/image`. No se tocó `next.config.ts` (`qualities` por defecto [75]).
- **Consecuencias:** al publicar fichas reales, copiar las fotos a `public/imagenes/propiedades/` ya en WebP y con nombre en minúsculas.

### D-25 · Pruebas e2e con Playwright y CI en GitHub Actions (sesión 12)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-23 · **Responsable:** jforero (la tomó Claude; reversible)
- **Decisión propuesta:** se instaló `@playwright/test` (dev; autorizado por jforero). Las pruebas viven en `e2e/` y corren contra el **build de producción** (`next build` + `next start` en el puerto 3100). Como la Server Action hace el `fetch` al webhook en el servidor (el navegador no puede interceptarlo), la red se simula con un **webhook falso local** (`e2e/webhook-falso.mjs`, puerto 3101) al que apunta `GHL_WEBHOOK_URL` como variable de proceso: nunca sale nada de la máquina. CI en `.github/workflows/ci.yml`: `npm ci`, typecheck, lint, test y build con Node 24 y caché de npm, sin secretos, en cada push y pull request. Scripts nuevos: `test:e2e` y `typecheck`. Detalle en [PRUEBAS.md](PRUEBAS.md).
- **Decidido sin consultar:** las e2e **no** corren en CI (evita descargar Chromium en cada ejecución; se corren en local antes de cerrar la sesión); solo Chromium; un único proyecto a 1280 px y las pruebas móviles fijan 390 px. El prompt pedía bajar el lint de 6 errores / 17 advertencias a 0 / 0, pero ya estaba en 0 / 0 desde la sesión 11: no se tocó código de la app. `docs/DESPLIEGUE.md` ya existía (sesión 14) y se amplió en lugar de crearlo.
- **Añadido el mismo día (autorizado por jforero en chat):** `.claude/settings.json` versionado con permisos preaprobados para typecheck, lint, test, test:e2e y build, y lectura bloqueada de los `.env*` reales y de `.vercel/**`; `.env.example` queda legible a propósito (sin secretos). Detalle en `CLAUDE.md`.
- **Consecuencias:** cada ruta nueva de `RUTAS` entra sola en las pruebas de rutas; un campo nuevo de simulador debe añadirse a `simuladores.spec.ts`. Si la protección de `main` se activa (P-12), conviene exigir el check de CI.

### D-26 · Analítica solo con consentimiento y solo con ID (sesión 13)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-23 · **Responsable:** jforero + asesoría legal (el texto del banner y de `/privacidad#cookies` lo redactó Claude; no es asesoría legal)
- **Decisión propuesta:** GA4 y píxel de Meta se cargan con `next/script` **solo** si existe su ID (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, con formato validado) **y** el visitante pulsó "Aceptar". La decisión vive en `localStorage` (`astp-consentimiento-cookies`, con `try/catch`) y se cambia desde "Preferencias de cookies" en el pie. `track()` (`src/lib/analytics.ts`) no hace nada sin ambas condiciones y descarta cualquier dato personal. Eventos y pruebas en [INTEGRACIONES.md](INTEGRACIONES.md) §4.
- **Decidido sin consultar:** **sin IDs no aparece el banner ni el enlace del pie** (no hay nada que consentir; la decisión guardada en `localStorage` es técnica y no sale del equipo); un solo "Aceptar" cubre analítica y Meta (sin casillas por categoría); el banner no roba el foco en la primera visita pero es lo primero que se alcanza con Tab, y no se cierra con Esc (cerrarlo no es decidir); no se instaló `@next/third-parties`; GA4 en *consent mode* con `ad_storage`/`ad_user_data`/`ad_personalization` denegados (no hay Google Ads); en Meta, `lead_enviado` → `Lead` y `cta_whatsapp_click` → `Contact` (eventos estándar), el resto personalizados; `simulador_calculado` se registra 1,5 s después del último cambio válido y no por los valores iniciales; los clics de WhatsApp se capturan con un oyente global y el origen en `data-origen` (no se tocó cada `onClick`); el pie pasó a `pb-28 md:pb-36` porque el botón flotante tapaba "Preferencias de cookies" a 1280 px; las e2e se compilan con IDs ficticios e interceptan Google/Meta.
- **Pendiente:** IDs reales (P-14); revisión legal del banner y de la sección de cookies (duración de cookies, transferencia fuera del Perú); comprobar la recepción en GA4/Meta reales; UTM en la primera visita; Conversions API.

### D-27 · GHL por API (contacto, oportunidad y cita), no por webhook (reemplaza el método de D-18)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-29 · **Responsable:** jforero (lo pidió en chat: "no necesitas un webhook, hazlo por medio de la API: crear el contacto, la oportunidad y la cita")
- **Decisión:** al llegar un lead, el servidor llamará a la API de GoHighLevel para **crear (o actualizar) el contacto, crear la oportunidad en el pipeline y, cuando el formulario lo pida, agendar la cita** en el calendario de llamadas. Pipeline, etapas y campos los define jforero dentro de GHL; el calendario es el de llamadas. Las credenciales (token de una integración privada de GHL e IDs de ubicación, pipeline, etapa y calendario) irán **solo** en variables de entorno de Vercel, nunca en el chat ni en el repo.
- **Consecuencias:** el prompt de la sesión es [15-ghl-api.md](prompts/15-ghl-api.md). Una cita exige que la persona elija un horario libre (la API lo consulta), lo que añade pantalla y estados al formulario.
- **Hecho (2026-10-30, sesión 15; detalle en [INTEGRACIONES.md](INTEGRACIONES.md) §2):** `src/lib/ghl.ts` (cliente con `fetch` inyectable + `registrarLead`) y `src/lib/horarios.ts`, con pruebas Vitest sobre una API simulada; `enviarLead` usa la API si están las cinco variables y, si no, el webhook (D-18) o el plan B; selector de cita accesible (`SelectorCita`) en `/vender` y en el asesor privado de la home; GHL falso local para e2e (`e2e/ghl-falso.mjs`). Endpoints verificados en la especificación OpenAPI oficial.
- **Aprobado por jforero (2026-10-30):** **token de integración privada** (no OAuth: una sola subcuenta, servidor a servidor, sin base de datos para guardar un *refresh token* que rota); cita **opcional** solo en `vender:valoracion` y `home:asesor-privado`; reclutamiento solo contacto; el resto contacto + oportunidad; pipeline "1. Propiedades Organico", etapa "Nuevo Lead", calendario "2. Calendario Llamadas AS Tupropiedad" (IDs cargados en Vercel por Claude con su OK). Revisar lo que ya había en GHL en lugar de crear campos.
- **Decidido sin consultar (reversible):** la oportunidad pasa a la etapa "Agendo Llamada" cuando se reserva la cita (`GHL_PIPELINE_STAGE_CITA_ID`, opcional); etiquetas por `POST /contacts/{id}/tags` (el upsert las reemplazaría); una nota en el contacto con el resumen de cada solicitud; datos por solicitud en la **oportunidad** (comentarios) para no pisar campos del contacto que edita el asesor; sin `monetaryValue` ni campos monetarios (el formulario no envía la moneda); si ya hay una oportunidad abierta del contacto en el pipeline, se reutiliza; cabecera `Version` fechada de la especificación y no `v3` del Marketplace; margen de 1 h y 14 días de horarios; la cita se crea con estado `confirmed`; sin correo no se envía `email` (no borra el que tenga).
- **Prueba real (2026-10-31, preview de la rama, datos ficticios "Prueba GHL Real" / 987654321, con OK de jforero):** el selector cargó horarios del calendario real (respeta los ocupados), el envío desde `/vender` reservó la cita del lunes 2-nov 10:00 (Lima) y jforero confirmó en GHL el contacto, la oportunidad en "Agendo Llamada" y la cita; los registros de Vercel no muestran errores ni avisos, así que las versiones fechadas de la cabecera `Version` funcionan. Lo de prueba lo borra jforero en GHL (cita → oportunidad → contacto).
- **Sigue abierto (P-5):** decidir si la cita sigue por API o pasa al widget de calendario de GHL (jforero lo decidirá); quitar `GHL_WEBHOOK_URL` (lo decide jforero); campo propio para la fecha de consentimiento; zona horaria del calendario en GHL (está vacía); flujo de atención y SLA.

### D-28 · Datos de la empresa, convenios y monedas (cierra P-4; avanza P-10)
- **Estado:** **Aceptada** (los datos los entregó jforero; la forma de mostrarlos la decidió Claude, reversible) · **Fecha:** 2026-10-29 · **Responsable:** jforero
- **Decisión:** dirección **Calle San Juan 211, La Molina**; horario **lunes a sábado, de 8:00 a 20:00 h** (jforero escribió "8:00 - 8:00 pm"); redes tomadas de la web actual (Facebook `astupropiedadsac`, Instagram `as.tupropiedad`, LinkedIn `company/as-tupropiedad`, YouTube `@AS_Tupropiedad`); convenios con **BBVA, BCP, Scotiabank e Interbank**; moneda: **venta en dólares (USD) y alquiler en soles (PEN)**.
- **Consecuencias:** todo vive en `src/lib/contact.ts` (`DIRECCION`, `HORARIO`, `REDES_SOCIALES`, `BANCOS_CONVENIO`). El pie muestra dirección, horario y redes; el JSON-LD añade `address`, `openingHoursSpecification` y `sameAs`; el simulador hipotecario nombra los bancos en texto. `MONEDA_POR_OPERACION` (`src/data/properties.ts`) fija la moneda y `src/data/properties.test.ts` hace fallar la prueba si una propiedad no la cumple.
- **Decidido sin consultar:** **TikTok no se enlazó** (el perfil de la web actual, `@rociochamochumbi`, parece personal); los bancos van **solo en texto, sin logos**, con la frase "tiene convenios con… La aprobación, la tasa y las condiciones las define cada banco"; la dirección **no** se usó como domicilio legal (sigue `[PENDIENTE]` en `/privacidad` y `/terminos`); los simuladores y la home siguen dejando que la persona elija la moneda (la home está en USD); no se mostró el convenio en `/nosotros`.
- **Sigue abierto:** el **respaldo escrito de los convenios** (P-10) y de las cifras de "Nosotros"; confirmar TikTok; confirmar con el cliente que la dirección y el horario son los que quiere publicar.

### D-29 · Dejar Tokko: administrador de propiedades propio, con publicación en portales y GHL como CRM
- **Estado:** **Aceptada** (el objetivo) · el **método** es **Propuesta** · **Fecha:** 2026-10-29 · **Responsable:** jforero
- **Contexto:** hoy el inventario se sincroniza con el portal Proppit mediante Tokko. jforero quiere eliminar Tokko y centralizar todo en GoHighLevel.
- **Decisión:** el sitio tendrá un **administrador de propiedades** (ruta protegida `/admin`) y publicará desde ahí en Proppit y otros portales; GHL queda como CRM central (contactos, oportunidades y citas, D-27). Cuando se implemente, **reemplaza D-11** ("el inventario vive en `src/data/properties.ts`").
- **Consecuencias:** es trabajo grande y se divide en fases (prompt [16-administrador-propiedades.md](prompts/16-administrador-propiedades.md)). Recomendación de la propuesta: base de datos propia (Postgres) y fotos en almacenamiento de archivos, un adaptador por portal y estado de publicación por propiedad y portal; usar solo GHL como base de datos de propiedades no se recomienda. Requiere dependencias y servicios nuevos, que se aprueban en la sesión. **Tokko no se apaga** hasta validar la publicación nueva en paralelo.
- **Sigue abierto:** P-15.

## Pendientes (necesitan respuesta del cliente o del equipo)

P-1, P-2 y P-3 se cerraron el 2026-10-04 (ver D-9, D-10, D-11); P-7 y P-8 el 2026-10-05 (ver D-12); P-6 el 2026-10-05 (ver D-16); P-4 el 2026-10-29 (ver D-28). Cada pendiente indica **quién decide**, **qué hay que entregar para cerrarlo** y **qué se hará por defecto** si no hay respuesta (el valor por defecto es provisional y nunca toca datos del cliente).

| ID | Pregunta | Quién decide | Qué se necesita para cerrarlo | Por defecto (provisional) | Bloquea |
|---|---|---|---|---|---|
| ~~P-4~~ | *(cerrada el 2026-10-29, ver D-28)* ¿Moneda principal: USD, PEN o ambas? Venta en USD y alquiler en PEN. **Queda:** la fuente del tipo de cambio para los simuladores | jforero / cliente | Fuente del tipo de cambio (los simuladores lo piden a quien los usa) | Tipo de cambio que escribe la persona | Simuladores |
| **P-5** *(método, credenciales, IDs, campos y formularios con cita cerrados el 2026-10-30, D-27)* | GHL por API: **sigue abierto:** la prueba con el GHL real (datos ficticios), quitar el webhook de respaldo, un campo para la fecha de consentimiento, la zona horaria del calendario y el flujo de atención/SLA | jforero / quien administra GHL | OK para la prueba real y revisar en GHL contacto, oportunidad y cita; confirmar si se quita `GHL_WEBHOOK_URL` | API en código; sin las variables, webhook y luego WhatsApp | Embudo de leads |
| ~~P-6~~ | *(cerrada el 2026-10-05, ver D-16)* ¿Se mantienen los anglicismos (Elite Portfolio, Off-Market, Flat, Cap Rate…)? | Cliente | Lista de términos que son marca/servicio y deben conservarse | Español natural, salvo marca/servicio | Textos y SEO |
| **P-9** | ¿Qué se promete con la valoración ("en 10 minutos")? ¿Quién atiende y en qué horario? | Cliente | SLA real: plazo de respuesta, canal, horario, responsable | Texto sin plazo concreto | `/vender` |
| **P-10** *(parcial, ver D-28)* | ¿Qué cifras de "Nosotros" son verificables? Convenios: jforero confirmó **BBVA, BCP, Scotiabank e Interbank** (2026-10-29) y se nombran en `/simulador-hipotecario`; **falta archivar el respaldo escrito** | Cliente | Cada cifra con su respaldo (fecha y fuente) y el respaldo escrito de cada convenio | Quitar las cifras no respaldadas | Credibilidad y riesgo legal |
| **P-11** | Residuos del teléfono/dominio viejos: **`portada.jpg` muestra 940 215 027 y es el fondo del Hero de la home** (y de la ficha de ejemplo); `flyer-ciudad-del-pescador-callao.png` y `flyer-santa-patricia-la-molina.png` muestran en el cartel **994 741 703** (otro número, ni oficial ni el viejo); `GHLForm.tsx` con `link.as-tupropiedad.pe` | jforero | Decidir si se rehace `portada.jpg` (hoy la home muestra el teléfono viejo) y los 2 flyers con el número oficial, o se dejan de usar; confirmar el dominio de GHL. *(Sesión 11: revisadas las 14 imágenes una por una; las demás muestran 977 588 905, no muestran teléfono o es ilegible; no se editó nada.)* | Los archivos siguen en el repo | Coherencia de contacto |
| **P-12** | Vercel: ¿se protege `main` (pull request obligatorio)? ¿Quién y cuándo asigna `astupropiedad.com` a producción, con o sin `www`? | jforero | **Hecho 2026-10-05:** repo conectado (producción = `main`, previews activos, Node 24.x, 0 variables de entorno), flujo en [DESPLIEGUE.md](DESPLIEGUE.md). **Decidido por jforero 2026-10-05:** `main` **sin** protección mientras dure el desarrollo (revisar antes de publicar el dominio); el dominio se asigna **más adelante**, porque hoy sirve otra web en producción. **Hecho 2026-10-29:** jforero asignó el subdominio **`web.astupropiedad.com`** a este proyecto (responde 200 con el sitio nuevo; canonical, `robots` y sitemap siguen apuntando a `astupropiedad.com`, así que Google no lo toma como sitio principal). **Sigue abierto:** quién y cuándo pasa el dominio raíz `astupropiedad.com` al sitio nuevo (revisar que `ventas@astupropiedad.com` no dependa de registros que se pisen) y con o sin `www` (el código asume sin `www`) | Producción en `*.vercel.app` y en `web.astupropiedad.com`; dominio raíz **sin** asignar | Dominio de producción |
| **P-14** | ¿Se mide con GA4, con Meta o con ambos? ¿Quién administra las cuentas? | jforero / cliente | ID de GA4 (`G-…`) y/o del píxel de Meta, cargados en Vercel (no en el chat), y acceso para comprobar Tiempo real / Probar eventos | Sin IDs: no se carga nada ni aparece el banner (D-26) | Medición de visitas y conversiones |

### P-15 · Qué necesita el administrador de propiedades (D-29)
**Quién decide:** jforero. **Se necesita:** (1) la **especificación técnica de Proppit** para Perú (API o archivo de datos, formato, campos obligatorios, requisitos de fotos, frecuencia, autenticación); no hay documentación pública que lo confirme; (2) la **lista de portales** y su contacto técnico, confirmando si cada uno recibe datos por Proppit o por vía propia (Urbania y Adondevivir no estarían en Proppit; sin verificar); (3) cómo **exportar los datos de Tokko** (la clave, solo en variables de entorno); (4) volumen de propiedades, roles, método de inicio de sesión y autorización para instalar dependencias y contratar base de datos y almacenamiento. **Por defecto:** el inventario sigue en `src/data/properties.ts`, vacío, y Tokko sigue publicando. **Bloquea:** sesión 16.

### P-13 · Datos de las fichas que contradicen los flyers
Detalle en el informe de la sesión 02 (home `FeaturedProperties` y `/propiedades`): el catálogo muestra precio, m², dormitorios, baños y distritos que no coinciden con los flyers de `public/imagenes/`, y varias fotos corresponden a otro inmueble. **Quién decide:** jforero / cliente. **Se necesita:** ficha real por propiedad (precio, m², dormitorios, baños, cocheras, distrito, estado) y fotos limpias. **Por defecto:** (actualizado en la sesión 07, D-20) los datos contradictorios se retiraron del código; no se publica ninguna propiedad hasta recibir fichas reales. **Bloquea:** sesión 07 y la credibilidad del catálogo.

## Supuestos escritos en los documentos que **aún no se han validado**

No los trates como hechos. Antes de publicar algo basado en ellos, confírmalos con quien corresponda:

| Supuesto | Dónde aparece | Quién lo valida |
|---|---|---|
| Normativa peruana aplicable: Ley 29733 (datos personales), Libro de Reclamaciones, publicidad ante INDECOPI, registro de agentes inmobiliarios | [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md), auditorías | Asesoría legal |
| Tratamiento de la alcabala (tramo inafecto) y de la plusvalía en los simuladores | Auditoría de funcionalidades (Bloque D) | Contador / notario |
| Fórmula de tasa mensual `(1+TEA)^(1/12)−1` (ya implementada, D-19) y TCEA (sin implementar) | Auditoría web C7 | Revisar con un simulador bancario real |
| ~~Ratios de contraste de color~~ | Medidos en la sesión 08 (ver `DISENO.md` §4) | — |
| Puntaje de accesibilidad ≈ 35 | Auditoría web | Es estimación, no medición con herramienta automática |
