# 05 · Embudo de leads (P0 · C1, P-5)

**Tú das:**
- Una **URL de webhook de prueba** de GoHighLevel (o dime que aún no la tienes).
- Nombre del pipeline y campos/etiquetas que usa GHL, si ya existen.
- **No pegues la URL ni claves en el chat de la sesión**: ponlas en `.env.local` (cópialo de `.env.example`) como `GHL_WEBHOOK_URL=…`.

**Depende de:** 02 (botones con destino) y, para el consentimiento, 09 (puede hacerse antes con un enlace provisional).
**Autorizo en este prompt:** instalar `zod`. Quita la línea si no quieres.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: que los formularios del sitio envíen leads de verdad y que el visitante vea un resultado real. Responde en español, tono "tú". Hoy el submit de /vender no hace nada y ningún CTA captura datos (docs/auditorias/AUDITORIA-FUNCIONALIDADES.md Bloque A).

Antes de escribir código lee en node_modules/next/dist/docs/ la guía de formularios (01-app/02-guides/forms.md), Server Actions, useActionState y after(). Lee docs/INTEGRACIONES.md §2 (contrato de Lead y flujo).

Autorizo: instalar zod. No autorizo: enviar datos reales a ningún servicio; usa solo datos ficticios.

Tareas:
1. src/lib/leads.ts: esquema zod del Lead según docs/INTEGRACIONES.md (nombre, celular con normalización a +51 9XXXXXXXX, correo opcional, interés, origen, página, consentimiento obligatorio, contexto opcional, utm opcionales).
2. src/app/actions/lead.ts: Server Action enviarLead → valida → honeypot (campo oculto) → POST a process.env.GHL_WEBHOOK_URL → devuelve { ok: true } o { ok: false, errores }. Si GHL_WEBHOOK_URL está vacía, NO falles en silencio: devuelve un error controlado que haga que la interfaz ofrezca el plan B de WhatsApp. Nunca imprimas la URL ni datos personales en logs. Registra la métrica con after().
3. Componente de formulario reutilizable con useActionState: etiquetas <label>, errores por campo, estado "enviando", mensaje de éxito real, casilla de consentimiento con enlace a /privacidad. Si el envío falla: mensaje claro + botón de WhatsApp con los datos ya armados (waLink). Prohibido mostrar "¡Enviado!" si no se envió.
4. Conectar: el asistente de /vender (con "Atrás" y sin perder lo escrito si falla), el CTA del simulador hipotecario (incluye monto/plazo/cuota en contexto), el del simulador de inversión, "Contactar a un Broker", "Solicitar asesor privado" y reclutamiento.
5. Documenta el mapeo de campos/etiquetas en docs/INTEGRACIONES.md y deja .env.example al día.

Pruebas (build de producción, puerto libre, apágalo al terminar):
- Con webhook de prueba (si lo hay en .env.local): envía un lead ficticio desde cada formulario y confirma que llegó; verifica el contenido del POST.
- Sin webhook: confirma que aparece el error controlado y el botón de WhatsApp con mensaje.
- Casos: campos vacíos, celular inválido, sin consentimiento, honeypot relleno, doble clic en enviar.
- 390 px y 1280 px; npx tsc --noEmit && npm run lint && npm run build.

Dime qué verificaste de verdad y qué no (p. ej. si no hubo webhook real, di que el envío a GHL no se probó). Marca el ROADMAP y cierra P-5 en docs/DECISIONES.md con lo que corresponda.
````
