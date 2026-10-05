# Integraciones

Qué servicios externos usa (o usará) el sitio, cómo se conectan y qué contrato siguen. **Hoy ninguna integración está conectada**: este documento es el diseño objetivo; actualízalo cuando algo se implemente.

## 1. Variables de entorno

Plantilla en [`.env.example`](../.env.example). Copiar a `.env.local` (ignorado por git) y replicar en Vercel → Settings → Environment Variables. Solo las que empiezan por `NEXT_PUBLIC_` llegan al navegador: **nunca pongas secretos con ese prefijo.**

| Variable | Uso | Público | Estado |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, canonical, sitemap, OG (opcional: `contact.ts` ya trae `https://astupropiedad.com` por defecto) | sí | dominio dado por jforero 2026-10-04; confirmar `www` |
| `GHL_WEBHOOK_URL` | Webhook de entrada de leads en GoHighLevel | **no** | pendiente |
| `GHL_API_KEY` · `GHL_LOCATION_ID` | Alternativa vía API de GHL | **no** | pendiente |
| `NEXT_PUBLIC_GHL_CALENDAR_URL` | Embed del calendario de videollamadas | sí | pendiente |
| `NEXT_PUBLIC_GA_ID` / Vercel Analytics | Analítica | sí | pendiente |
| `NEXT_PUBLIC_META_PIXEL_ID` | Píxel de Meta | sí | opcional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `TURNSTILE_SECRET_KEY` | Anti-spam | sitio sí / secreto **no** | opcional |
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `SUPABASE_SERVICE_ROLE_KEY` | Inventario de propiedades (opcional) | URL/anon sí; service role **no** | opcional |

Reglas: lee los secretos solo en código de servidor (Server Actions, Route Handlers); valida su presencia al arrancar y falla con mensaje claro; no los imprimas en logs.

## 2. GoHighLevel (CRM)

**Lo que existe hoy:** `src/components/GHLForm.tsx` (iframe + script de `link.as-tupropiedad.pe`), **sin uso** y con `DEFAULT_FORM_ID` sin definir. Los botones "(GHL)" de los simuladores y el calendario del footer no hacen nada.
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
- **Desplegar solo con confirmación del dueño.** Antes: `/revisar-deploy`.
- Pendiente: dominio de producción, redirecciones de dominios alternativos, cabeceras de seguridad (`next.config.ts` → `headers()`), `poweredByHeader: false`.
- Subir `next` a `16.3.8` (aviso crítico en 16.2.0) antes del próximo despliegue.

## 6. Supabase (opcional, para inventario)

Si el equipo comercial va a editar propiedades sin tocar código: tabla `properties` con el tipo `Property` de [AUDITORIA-FUNCIONALIDADES.md](auditorias/AUDITORIA-FUNCIONALIDADES.md) (Bloque B), Storage para fotos, **RLS**: lectura pública de `estado = 'disponible'`, escritura solo para asesores autenticados. Hasta entonces: `src/data/properties.ts` (mismo tipo, migración sin reescribir).

## 7. Anti-spam

Honeypot (campo oculto) + Cloudflare Turnstile (o reCAPTCHA) + límite por IP en la Server Action. Los formularios públicos son el principal vector de abuso: no los dejes sin protección.
