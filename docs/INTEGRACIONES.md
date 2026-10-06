# Integraciones

Qué servicios externos usa (o usará) el sitio, cómo se conectan y qué contrato siguen. **Hoy ninguna integración está conectada**: este documento es el diseño objetivo; actualízalo cuando algo se implemente.

## 1. Variables de entorno

Plantilla en [`.env.example`](../.env.example). Copiar a `.env.local` (ignorado por git) y replicar en Vercel → Settings → Environment Variables. Solo las que empiezan por `NEXT_PUBLIC_` llegan al navegador: **nunca pongas secretos con ese prefijo.**

| Variable | Uso | Público | Estado |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, canonical, sitemap, OG (opcional: `contact.ts` ya trae `https://astupropiedad.com` por defecto) | sí | dominio dado por jforero 2026-10-04; confirmar `www` |
| `GHL_WEBHOOK_URL` | Webhook de entrada de leads en GoHighLevel (lo lee `src/app/actions/lead.ts`; si falta, los formularios muestran un error controlado y ofrecen WhatsApp) | **no** | **en uso (sesión 05)**; valor pendiente: falta el webhook de GHL |
| `GHL_API_KEY` · `GHL_LOCATION_ID` | Alternativa vía API de GHL | **no** | pendiente |
| `NEXT_PUBLIC_GHL_CALENDAR_URL` | Embed del calendario de videollamadas | sí | pendiente |
| `NEXT_PUBLIC_GA_ID` / Vercel Analytics | Analítica | sí | pendiente |
| `NEXT_PUBLIC_META_PIXEL_ID` | Píxel de Meta | sí | opcional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SECRET_KEY` | Anti-spam | sitio sí / secreto **no** | opcional |
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` | Inventario de propiedades (opcional) | URL/anon sí; service role **no** | opcional |

Reglas: lee los secretos solo en código de servidor (Server Actions, Route Handlers); valida su presencia al arrancar y falla con mensaje claro; no los imprimas en logs.

## 2. GoHighLevel (CRM)

**Lo que existe hoy (sesión 05, 2026-10-05):** formularios reales (`LeadForm`) en `/vender`, ambos simuladores y la home, que envían por la Server Action `enviarLead` al webhook de `GHL_WEBHOOK_URL`. `GHLForm.tsx` (iframe de `link.as-tupropiedad.pe`) sigue **sin uso**. **No se ha probado contra un GHL real**: solo contra un receptor local de prueba. El calendario del footer sigue siendo un enlace a WhatsApp.
**Lo que se desconoce (pedir al cliente):** si usará webhook o API, formularios existentes, pipeline, calendario, flujos de autorespuesta, quién atiende y con qué SLA.

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
- **Motivos de fallo** (`motivo`): `validacion` (corregir campos), `no-configurado` (falta `GHL_WEBHOOK_URL`) y `servicio` (GHL no responde, responde con error o tarda más de 8 s). En los dos últimos el formulario muestra el mensaje y un botón de WhatsApp con el mensaje contextual **más el nombre y el celular escritos**. Lo escrito nunca se borra tras un fallo.
- **Doble envío:** el botón se bloquea de inmediato (un `ref` evita el doble clic antes del primer render) y cada formulario manda un `id_envio` (UUID, el mismo en los reintentos) para que GHL pueda deduplicar. **No hay deduplicación en el servidor.**
- **Logs:** solo `[metrica] lead_enviado|lead_error {origen, interes|motivo}` (con `after()`) y un aviso de error sin URL ni datos personales. La analítica real llega en la sesión 13.
- **UTM:** se leen de la URL en el momento del envío (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`); si la persona llegó a otra página antes, se pierden (captura en la primera visita: sesión 13).
- **Pendiente:** Turnstile, límite por IP y deduplicación en servidor (ver §7).

### Mapeo de campos (cuerpo JSON del POST al webhook)

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
Usar un webhook/pipeline de **prueba** y datos ficticios. No enviar datos reales de clientes desde desarrollo.

## 3. WhatsApp

- Helper: `waLink(mensaje?)` en `src/lib/contact.ts` (ya existe) → `https://wa.me/51977588905?text=…` con el mensaje codificado.
- **Un solo número** (`WHATSAPP_NUMBER` en `contact.ts`). No lo repitas en componentes ni uses `51900000000`.
- Plantillas por contexto:

| Contexto | Mensaje |
|---|---|
| Navbar / botón flotante | "Hola, quiero información sobre sus servicios inmobiliarios." |
| Ficha de propiedad | "Hola, me interesa *{título}* (ref. {id}) — {precio}. ¿Sigue disponible?" |
| Simulador hipotecario | "Hola, simulé un crédito de {monto} a {plazo} años (cuota ≈ {cuota}). Quiero asesoría para pre-calificar." |
| Simulador de inversión | "Hola, calculé una rentabilidad de {capRate} para un inmueble de {precio}. Quiero evaluar opciones." |
| Vender | "Hola, quiero vender mi {tipo} en {distrito}. ¿Pueden valorarlo?" |

- Registrar cada clic (`click_whatsapp` con página y contexto).

## 4. Analítica y consentimiento

- Proveedor previsto: Vercel Analytics o GA4 (+ Meta Pixel y Conversions API si hay campañas). Guía: `node_modules/next/dist/docs/01-app/02-guides/analytics.md`.
- **Banner de consentimiento** antes de cargar píxeles/analítica no esencial.
- Capturar **UTM** en la primera visita y adjuntarlas al lead.

| Evento | Props |
|---|---|
| `click_whatsapp` | `pagina`, `contexto` |
| `lead_enviado` | `origen`, `interes` |
| `lead_error` | `origen`, `motivo` |
| `simulador_usado` | `tipo` (`hipotecario`/`inversion`) |
| `simulador_cta` | `tipo` |
| `vista_propiedad` | `id`, `distrito`, `precio` |
| `filtro_usado` | `tipo`, `distrito`, `rango_precio` |
| `agenda_abierta` | — |

## 5. Vercel

- Proyecto: `web-as-tupropiedad` (`.vercel/project.json`, local; no se versiona). `vercel.json`: framework `nextjs`.
- Repositorio de GitHub: `jacafor/astupropiedad` (rama `main`). **Conexión Git ↔ Vercel: hecha el 2026-10-05** (producción = `main`; previews activos; ajustes de Git por defecto). Cada `push` a `main` es un despliegue a producción: se trabaja en ramas y se fusiona por pull request; las demás ramas generan *previews*, protegidos con Vercel Authentication (hay que iniciar sesión para verlos). Flujo, rollback y variables: [DESPLIEGUE.md](DESPLIEGUE.md). Pendiente en P-12: protección de `main`, dominio y `www`. Hoy no hay variables de entorno definidas en Vercel.
- La CLI de Vercel está instalada en el equipo de jforero (`vercel login` lo hace él, nunca se guardan tokens). Variables de entorno: se crean en el panel de Vercel; en el chat solo se mencionan sus nombres.
- **Desplegar solo con confirmación del dueño.** Antes: `/revisar-deploy`.
- Pendiente: dominio de producción, redirecciones de dominios alternativos, cabeceras de seguridad (`next.config.ts` → `headers()`), `poweredByHeader: false`.
- Subir `next` a `16.3.8` (aviso crítico en 16.2.0) antes del próximo despliegue.

## 6. Supabase (opcional, para inventario)

Si el equipo comercial va a editar propiedades sin tocar código: tabla `properties` con el tipo `Property` de [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md) (Bloque B), Storage para fotos, **RLS**: lectura pública de `estado = 'disponible'`, escritura solo para asesores autenticados. Hasta entonces: `src/data/properties.ts` (mismo tipo, migración sin reescribir).

## 7. Anti-spam

Honeypot (campo oculto) + Cloudflare Turnstile (o reCAPTCHA) + límite por IP en la Server Action. Los formularios públicos son el principal vector de abuso: no los dejes sin protección.
