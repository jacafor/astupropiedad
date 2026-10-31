# Integraciones

Qué servicios externos usa (o usará) el sitio, cómo se conectan y qué contrato siguen. **GoHighLevel por API está en código desde el 2026-10-30 (§2)**; analítica espera sus IDs (§4). Actualízalo cuando algo se implemente.

## 1. Variables de entorno

Plantilla en [`.env.example`](../.env.example). Copiar a `.env.local` (ignorado por git) y replicar en Vercel → Settings → Environment Variables. Solo las que empiezan por `NEXT_PUBLIC_` llegan al navegador: **nunca pongas secretos con ese prefijo.**

| Variable | Uso | Público | Estado |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, canonical, sitemap, OG (opcional: `contact.ts` ya trae `https://astupropiedad.com` por defecto) | sí | dominio dado por jforero 2026-10-04; confirmar `www` |
| `GHL_API_TOKEN` | Token de la **integración privada** de GHL (Bearer). En Vercel como *Sensitive* (Production y Preview; no se puede leer de vuelta). Rotarlo cada ~90 días (§2) | **no** | **en uso (2026-10-30, D-27)**; cargado por jforero |
| `GHL_LOCATION_ID` · `GHL_PIPELINE_ID` · `GHL_PIPELINE_STAGE_ID` · `GHL_CALENDAR_ID` | Subcuenta, pipeline "1. Propiedades Organico", etapa "Nuevo Lead" y "2. Calendario Llamadas AS Tupropiedad" (IDs en Vercel; no son secretos) | **no** | **en uso**; en Vercel (Production, Preview, Development) |
| `GHL_PIPELINE_STAGE_CITA_ID` | Opcional: etapa a la que pasa la oportunidad si se agenda la llamada ("Agendo Llamada") | **no** | en uso |
| `GHL_API_BASE_URL` | Solo pruebas: apunta la API a `e2e/ghl-falso.mjs`. No se define en Vercel | **no** | pruebas |
| `GHL_WEBHOOK_URL` | **Respaldo** (D-18): solo se usa si falta alguna de las cinco variables de la API. Se quitará cuando jforero lo confirme | **no** | respaldo; sin valor en Vercel |
| `NEXT_PUBLIC_GHL_CALENDAR_URL` | Embed del calendario de videollamadas | sí | sin uso (la cita se agenda por API) |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 (`G-XXXXXXX`); solo se carga si el visitante acepta (§4) | sí | **en código (sesión 13)**; valor pendiente |
| `NEXT_PUBLIC_META_PIXEL_ID` | Píxel de Meta (solo números); solo se carga si el visitante acepta (§4) | sí | **en código (sesión 13)**; valor pendiente |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SECRET_KEY` | Anti-spam | sitio sí / secreto **no** | opcional |
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` | Inventario de propiedades (opcional) | URL/anon sí; service role **no** | opcional |

Reglas: lee los secretos solo en código de servidor (Server Actions, Route Handlers); valida su presencia al arrancar y falla con mensaje claro; no los imprimas en logs.

## 2. GoHighLevel (CRM)

> **Método vigente: API v2 de GHL (D-27, implementada el 2026-10-30, sesión 15).** El webhook de abajo queda como respaldo hasta que jforero confirme quitarlo.

### API (D-27): contacto → oportunidad → cita

| Pieza | Archivo |
|---|---|
| Cliente de la API (`fetch` inyectable), mapeo y `registrarLead` | `src/lib/ghl.ts` (pruebas: `ghl.test.ts`, API simulada) |
| Horarios en hora de Lima (agrupar, validar, etiquetas) | `src/lib/horarios.ts` (pruebas: `horarios.test.ts`) |
| Server Actions | `enviarLead` (`src/app/actions/lead.ts`) y `obtenerHorarios` (`src/app/actions/horarios.ts`) |
| Selector de cita | `src/components/SelectorCita.tsx` dentro de `LeadForm` (`permiteCita`) |

**Fuente verificada (2026-10-30):** especificación OpenAPI oficial, [GoHighLevel/highlevel-api-docs](https://github.com/GoHighLevel/highlevel-api-docs) (`apps/contacts.json`, `opportunities.json`, `calendars.json`), contrastada con [marketplace.gohighlevel.com/docs](https://marketplace.gohighlevel.com/docs/). Base `https://services.leadconnectorhq.com`, cabecera `Authorization: Bearer <token>`. La web del Marketplace muestra `Version: v3`, pero la especificación solo admite las fechadas: se usan esas (constantes en `ghl.ts`; **confirmar en la prueba real**).

| Paso | Endpoint | `Version` | Si falla |
|---|---|---|---|
| 1. Contacto | `POST /contacts/upsert` (`firstName`, `lastName`, `phone`, `email` solo si lo dio, `source`, `customFields[{id, field_value}]`) | `2021-07-28` | error + WhatsApp |
| 2. Etiquetas | `POST /contacts/{id}/tags` (el upsert **reemplazaría** las existentes) | `2021-07-28` | se registra, no bloquea |
| 3. Nota | `POST /contacts/{id}/notes` con el resumen de la solicitud | `2021-07-28` | se registra, no bloquea |
| 4. Oportunidad | `GET /opportunities/search` (abierta del contacto en el pipeline: se reutiliza) o `POST /opportunities/` en la etapa inicial, estado `open`, sin `monetaryValue` | `2021-07-28` | error + WhatsApp (el lead no está completo) |
| 5. Horarios | `GET /calendars/{id}/free-slots` (`startDate`/`endDate` en ms, 14 días, `timezone=America/Lima`) | `2021-04-15` | estado de error + Reintentar + WhatsApp |
| 6. Cita | `POST /calendars/events/appointments` (`startTime` ISO con desfase, `appointmentStatus: confirmed`). **Sin reintento** | `2021-04-15` | "Recibimos tus datos, pero no pudimos reservar la hora" + WhatsApp |
| 7. Etapa | `PUT /opportunities/{id}` → `GHL_PIPELINE_STAGE_CITA_ID` y campo "Agendo Llamada" | `2021-07-28` | se registra, no bloquea |

Permisos de la integración privada: `contacts.write`, `opportunities.readonly`, `opportunities.write`, `calendars.readonly`, `calendars/events.write` (y, para revisar la estructura, lectura de campos personalizados de la ubicación).

**Qué formularios hacen qué (aprobado por jforero el 2026-10-30):** `vender:valoracion` y `home:asesor-privado` → contacto + oportunidad + **cita opcional**; los simuladores y `home-hipoteca:cta` → contacto + oportunidad; `home:reclutamiento` → solo contacto y etiquetas (no es una venta).

**Garantías:** nunca se muestra "Recibimos" si el contacto o la oportunidad no quedaron; lo escrito no se borra; cada llamada tiene 8 s de límite; los logs solo dicen paso y estado (`[lead] GHL falló (oportunidad-500)`), nunca el token, URLs ni datos personales. Reintentar es seguro: el contacto se actualiza (upsert, según la regla "Allow Duplicate Contact" de la ubicación: **revisarla en GHL**, teléfono primero) y la oportunidad abierta se reutiliza. **Riesgo conocido:** si la cita agota los 8 s, GHL pudo haberla creado igual; la pantalla dice "no pudimos reservar" y el asesor debe revisar el calendario.

**Mapeo a GHL (IDs en `CAMPOS` de `ghl.ts`, revisados en la cuenta el 2026-10-30; no se crearon campos):**

| Dato | Campo de GHL |
|---|---|
| nombre / celular / correo | `firstName` + `lastName` (primera palabra / resto), `phone` (E.164), `email` |
| `origen` · `pagina` | `contact.origen` · `contact.source_url` |
| interés y origen | etiquetas `web-astupropiedad`, `interes:<x>`, `origen:<y>` |
| tipo de propiedad (`/vender`) | `opportunity.tipo_propiedad` (lista; `Terreno` → `Terreno / Lote`; lo demás solo en comentarios) |
| habitaciones | `opportunity.habitaciones` |
| todo el resto (distrito, área, datos del simulador, fecha de consentimiento, UTM, `id_envio`, llamada pedida) | texto en `opportunity.comentarios_adicionales` y nota del contacto |
| llamada agendada | `opportunity.agendo_llamada` ("sábado, 31 de octubre a las 11:00 (hora de Lima)") |

Los montos van sin moneda (el formulario no la envía), por eso no se usan campos de tipo monetario. **Recomendado:** crear en GHL un campo propio para la fecha de consentimiento (Ley 29733), hoy solo en el texto.

**Token:** rotarlo en GHL cada ~90 días (el viejo y el nuevo conviven 7 días), actualizarlo en Vercel y volver a desplegar. Si se filtra: rotarlo y expirar el viejo de inmediato.

### Webhook (D-18, respaldo)

**Lo que existe (sesión 05, 2026-10-05):** formularios reales (`LeadForm`) en `/vender`, ambos simuladores y la home, que envían por la Server Action `enviarLead`. Sin las variables de la API, van al webhook de `GHL_WEBHOOK_URL`. `GHLForm.tsx` (iframe de `link.as-tupropiedad.pe`) sigue **sin uso**. El calendario del footer sigue siendo un enlace a WhatsApp.
**Lo que se desconoce (pedir al cliente):** flujos de autorespuesta, quién atiende y con qué SLA.

### Contrato de un lead (propuesto)

```ts
type Lead = {
  nombre: string;                       // requerido
  celular: string;                      // requerido, +51 9XX XXX XXX (normalizar a E.164)
  correo?: string;
  interes: "comprar" | "vender" | "invertir" | "hipoteca" | "asesor" | "reclutamiento" | "contacto";
  origen: string;                       // p. ej. "vender:valoracion", "simulador-hipotecario:cta", "propiedad:JM-001"
  pagina: string;                       // ruta desde la que se envió
  consentimiento: true;                 // obligatorio (Ley 29733); guardar fecha/hora
  contexto?: {
    tipoPropiedad?: string; distrito?: string; areaM2?: number; habitaciones?: number;     // /vender
    montoPrestamo?: number; plazoAnios?: number; tea?: number; cuota?: number;             // hipotecario
    precio?: number; alquilerMensual?: number; capRateNeto?: number;                       // inversión
    propiedadId?: string;                                                                  // fichas
  };
  utm?: { source?: string; medium?: string; campaign?: string; term?: string; content?: string };
};
```

### Flujo

`Formulario → Server Action enviarLead → validar (zod) + anti-spam → POST a GHL → { ok } | { errores }`
- Mapear `interes`/`origen`/`pagina` a **etiquetas** y los datos de `contexto` a **campos personalizados** de GHL.
- Disparar en GHL un workflow: autorespuesta por WhatsApp/correo + **aviso inmediato al asesor** + tarea de seguimiento.
- Registrar el evento de analítica con `after()` (no bloquea la respuesta).
- Si GHL falla: mostrar error entendible **y** un botón de WhatsApp con el mensaje armado. No mostrar "¡Enviado!" si no se envió.

### Implementación (sesión 05)

| Pieza | Archivo |
|---|---|
| Esquema zod, normalización de celular, payload hacia GHL | `src/lib/leads.ts` (solo servidor) |
| Tipos, `numeroValido`, mensaje de WhatsApp del plan B | `src/lib/lead-tipos.ts` (llega al navegador; sin zod) |
| Server Action `enviarLead(estadoPrevio, formData)` → `{ ok: true }` o `{ ok: false, motivo, mensaje, errores }` | `src/app/actions/lead.ts` |
| Formulario reutilizable | `src/components/LeadForm.tsx` |

Comportamiento:
- **Honeypot:** campo `sitio_web` oculto; si viene relleno, se responde `{ ok: true }` sin llamar a GHL (el bot no se entera).
- **Validación:** errores por campo en español ("tú"). El celular se normaliza a E.164 sin espacios (`+51987654321`); acepta `987654321`, `987 654 321`, `+51 987 654 321`, `0051…`. Solo móviles peruanos (9 dígitos que empiezan en 9).
- **Motivos de fallo** (`motivo`): `validacion` (corregir campos, también "elige un horario"), `no-configurado` (faltan la API y `GHL_WEBHOOK_URL`) y `servicio` (GHL no responde, responde con error o tarda más de 8 s). En los dos últimos el formulario muestra el mensaje y un botón de WhatsApp con el mensaje contextual **más el nombre y el celular escritos**. Lo escrito nunca se borra tras un fallo.
- **Doble envío:** el botón se bloquea de inmediato (un `ref` evita el doble clic antes del primer render) y cada formulario manda un `id_envio` (UUID, el mismo en los reintentos) para que GHL pueda deduplicar. **No hay deduplicación en el servidor.**
- **Logs:** solo `[metrica] lead_enviado|lead_error {origen, interes|motivo}` (con `after()`) y un aviso de error sin URL ni datos personales. En el navegador, `lead_enviado`/`formulario_error` van además a GA4/Meta si hay consentimiento (§4).
- **UTM:** se leen de la URL en el momento del envío (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`); si la persona llegó a otra página antes, se pierden (captura en la primera visita: sesión 13).
- **Pendiente:** Turnstile, límite por IP y deduplicación en servidor (ver §7).

### Mapeo de campos del webhook (respaldo; cuerpo JSON del POST)

Plano a propósito: en el workflow de GHL se asigna cada clave a un campo de contacto, campo personalizado o etiqueta. Las claves sin dato van como cadena vacía.

| Clave del POST | Qué es | Sugerencia en GHL |
|---|---|---|
| `nombre` | Nombre completo | Contacto → Nombre |
| `telefono` | Celular E.164 | Contacto → Teléfono |
| `email` | Correo (vacío si no lo dio) | Contacto → Correo |
| `interes` / `interes_etiqueta` | `comprar·vender·invertir·hipoteca·asesor·reclutamiento·contacto` / texto legible | Etiqueta o campo personalizado |
| `origen` | Qué formulario fue (tabla de abajo) | Campo personalizado + etiqueta |
| `pagina` | Ruta desde donde se envió | Campo personalizado |
| `consentimiento` / `consentimiento_fecha` | `true` / fecha-hora ISO (Ley 29733) | Campo personalizado (conservar) |
| `id_envio` | UUID del envío (deduplicar) | Campo personalizado |
| `etiquetas` | `["web-astupropiedad","interes:<x>","origen:<y>"]` | Etiquetas del contacto |
| `ctx_tipo_propiedad`, `ctx_distrito`, `ctx_area_m2`, `ctx_habitaciones` | Datos de `/vender` | Campos personalizados |
| `ctx_monto_prestamo`, `ctx_plazo_anios`, `ctx_tea`, `ctx_cuota`, `ctx_precio` | Datos de los simuladores hipotecarios | Campos personalizados |
| `ctx_precio`, `ctx_alquiler_mensual`, `ctx_cap_rate_neto` | Datos del simulador de inversión | Campos personalizados |
| `ctx_propiedad_id` | Ficha de propiedad (sin uso todavía) | Campo personalizado |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Campaña | Campos de atribución |

Valores de `origen`: `vender:valoracion` (`/vender`, interés `vender`) · `simulador-hipotecario:cta` (`/simulador-hipotecario`, `hipoteca`) · `simulador-inversion:cta` (`/simulador-inversion`, `invertir`) · `home-hipoteca:cta` (calculadora de la home; es el antiguo "Contactar a un Broker", `hipoteca`) · `home:asesor-privado` (`asesor`) · `home:reclutamiento` (`reclutamiento`). Los números del contexto solo se envían si son finitos y mayores que 0.

### Pruebas
Automáticas: contra `e2e/ghl-falso.mjs` (ver [PRUEBAS.md](PRUEBAS.md)); nunca contra la API real. Manuales con GHL real: solo datos ficticios y con OK de jforero; borrar después el contacto, la oportunidad y la cita de prueba. **Cuidado:** con el token real en `.env.local`, `npm run dev` escribe en el GHL real.

## 3. WhatsApp

- Helper: `waLink(mensaje?)` en `src/lib/contact.ts` (ya existe) → `https://wa.me/51977588905?text=…` con el mensaje codificado.
- **Un solo número** (`WHATSAPP_NUMBER` en `contact.ts`). No lo repitas en componentes ni uses `51900000000`.
- Plantillas por contexto:

| Contexto | Mensaje |
|---|---|
| Navbar / botón flotante | "Hola, quiero información sobre sus servicios inmobiliarios." |
| Ficha y tarjeta de propiedad (`waPropiedad` en `src/lib/propiedades.ts`) | "Hola, me interesa \"{título}\" (ref. {id}) — {precio}. ¿Sigue disponible?" |
| Simulador hipotecario | "Hola, simulé un crédito de {monto} a {plazo} años (cuota ≈ {cuota}). Quiero asesoría para pre-calificar." |
| Simulador de inversión | "Hola, calculé una rentabilidad de {capRate} para un inmueble de {precio}. Quiero evaluar opciones." |
| Vender | "Hola, quiero vender mi {tipo} en {distrito}. ¿Pueden valorarlo?" |

- Cada clic se registra como `cta_whatsapp_click` (solo con consentimiento; ver §4). Todo enlace nuevo a WhatsApp lleva `data-origen`.

## 4. Analítica y consentimiento

**Implementado en la sesión 13 (2026-10-23, D-26).** GA4 y píxel de Meta con `next/script` (sin `@next/third-parties`, que no está instalado). **Sin IDs no se carga nada ni aparece el banner** (hoy Vercel no tiene ninguno: producción no mide).

### Cómo funciona

| Pieza | Archivo |
|---|---|
| IDs (validados: `G-XXXX`, píxel numérico), decisión en `localStorage` (`astp-consentimiento-cookies` = `aceptado`/`rechazado`, con `try/catch`) | `src/lib/consentimiento.ts` |
| `track(evento, parámetros)`, `revocarAnalitica()`, `useEventoSimulador()` | `src/lib/analytics.ts` |
| Carga de scripts tras aceptar + oyente global de clics a `wa.me` | `src/components/Analitica.tsx` (en `layout.tsx`) |
| Banner (`<section>` con `aria-labelledby`, justo después de "Saltar al contenido"; Aceptar y Rechazar idénticos) | `src/components/BannerCookies.tsx` |
| "Preferencias de cookies" en el pie (reabre el banner y devuelve el foco) | `src/components/PreferenciasCookies.tsx` |
| Texto para la persona | `/privacidad#cookies` (borrador, D-22) |

- **Antes de aceptar:** ninguna petición a Google ni a Meta (`gtag`/`fbq` ni existen). `track()` no hace nada.
- **Al aceptar:** se cargan `gtag.js` (GA4 con *consent mode*: `analytics_storage` concedido, `ad_*` denegados) y `fbevents.js`. GA4 cuenta las navegaciones internas con su medición mejorada (activa por defecto en la propiedad); el píxel recibe `PageView` en cada cambio de ruta.
- **Al rechazar después de aceptar:** `consent update` a denegado, `fbq('consent','revoke')` y se borran `_ga*`, `_gid`, `_fbp`, `_fbc`. Los scripts siguen en memoria hasta recargar, pero `track()` ya no envía nada.
- **Datos personales:** los parámetros están tipados y además `track()` descarta claves como `nombre`/`celular`/`correo` y valores con `@` o 7+ dígitos seguidos.

### Eventos

| Evento (GA4) | Meta | Parámetros | Cuándo |
|---|---|---|---|
| `cta_whatsapp_click` | `Contact` | `origen`, `pagina` | Clic en cualquier enlace a `wa.me`. `origen` sale de `data-origen` del enlace (`boton-flotante`, `navbar`, `navbar-movil`, `footer:videollamada`, `home:avisame`, `catalogo:avisame`, `catalogo:no-encontre`, `nosotros:equipo`, `simulador-hipotecario:cronograma`, `propiedad:<id>`, `tarjeta:<id>`, `<origen del formulario>:plan-b`); sin atributo, `pagina:<ruta>` |
| `lead_enviado` | `Lead` | `origen`, `interes` | El servidor confirmó el lead (una vez por respuesta) |
| `formulario_error` | `formulario_error` (personalizado) | `origen`, `motivo` (`validacion`/`no-configurado`/`servicio`), `campos` (nombres, nunca valores) | El servidor devolvió error |
| `simulador_calculado` | personalizado | `tipo` (`hipotecario`, `inversion`, `home-hipoteca`, `home-rentabilidad`) | La persona cambió algo, el resultado es válido y dejó de escribir 1,5 s. Los valores iniciales no cuentan |
| `propiedad_vista` | personalizado | `id` | Al abrir una ficha |

Al añadir un enlace de WhatsApp, ponle `data-origen`; al añadir un evento, decláralo en `EventosAnalitica`.

### Cómo probarlo

1. **Automático:** `npm run test:e2e` construye con IDs **ficticios** (`playwright.config.ts`) e intercepta Google, Meta y `wa.me` (nada sale de la máquina). `e2e/analitica.spec.ts` comprueba: sin decisión no hay peticiones; rechazo persistente al recargar; tras aceptar se piden `gtag.js` y `fbevents.js`; un evento por acción; sin nombre/celular/correo en los eventos; reapertura desde el pie; banner a 390 px y con teclado.
2. **Manual con IDs reales:** pon `NEXT_PUBLIC_GA_ID`/`NEXT_PUBLIC_META_PIXEL_ID` en `.env.local` (o en Vercel → Preview), `npm run build && npx next start -p 3055`. En DevTools → Red filtra `google|facebook`: vacío hasta pulsar Aceptar. Tras aceptar, GA4 → Informes → **Tiempo real** (o DebugView con la extensión *Google Analytics Debugger*) y Meta → Administrador de eventos → **Probar eventos**. Para volver a ver el banner: `localStorage.removeItem("astp-consentimiento-cookies")` o "Preferencias de cookies".
3. Las variables `NEXT_PUBLIC_*` se incrustan **al compilar**: tras cambiarlas en Vercel hay que volver a desplegar.

**Sin hacer:** captura de UTM en la primera visita (hoy se leen al enviar, §2), `filtro_usado`, `simulador_cta` (el envío del formulario del simulador ya cuenta como `lead_enviado` con su `origen`), Conversions API de Meta, Vercel Analytics, y comprobar la recepción en GA4/Meta reales (no hay IDs).

## 5. Vercel

- Proyecto: `web-as-tupropiedad` (`.vercel/project.json`, local; no se versiona). `vercel.json`: framework `nextjs`.
- Repositorio de GitHub: `jacafor/astupropiedad` (rama `main`). **Conexión Git ↔ Vercel: hecha el 2026-10-05** (producción = `main`; previews activos; ajustes de Git por defecto). Cada `push` a `main` es un despliegue a producción: se trabaja en ramas y se fusiona por pull request; las demás ramas generan *previews*, protegidos con Vercel Authentication (hay que iniciar sesión para verlos). Flujo, rollback y variables: [DESPLIEGUE.md](DESPLIEGUE.md). Pendiente en P-12: protección de `main`, dominio y `www`. Hoy no hay variables de entorno definidas en Vercel.
- La CLI de Vercel está instalada en el equipo de jforero (`vercel login` lo hace él, nunca se guardan tokens). Variables de entorno: se crean en el panel de Vercel; en el chat solo se mencionan sus nombres.
- **Desplegar solo con confirmación del dueño.** Antes: `/revisar-deploy`.
- Pendiente: dominio de producción, redirecciones de dominios alternativos, cabeceras de seguridad (`next.config.ts` → `headers()`), `poweredByHeader: false`.
- ~~Subir `next`~~ hecho: `16.4.2` (2026-10-16, D-23). Al incrustar el calendario o formulario de GHL, revisar la futura CSP (`script-src`, `frame-src`, `connect-src`); hoy no hay CSP.

## 6. Supabase (opcional, para inventario)

Si el equipo comercial va a editar propiedades sin tocar código: tabla `properties` con el tipo `Property` de [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md) (Bloque B), Storage para fotos, **RLS**: lectura pública de `estado = 'disponible'`, escritura solo para asesores autenticados. Hasta entonces: `src/data/properties.ts` (mismo tipo, migración sin reescribir).

## 7. Anti-spam

Honeypot (campo oculto) + Cloudflare Turnstile (o reCAPTCHA) + límite por IP en la Server Action. Los formularios públicos son el principal vector de abuso: no los dejes sin protección.
