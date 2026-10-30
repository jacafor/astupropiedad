# 15 · Enviar los leads a GoHighLevel por API (contacto, oportunidad y cita)

**Cuándo:** cuando jforero tenga listo el token y los IDs en Vercel. Reemplaza el método de webhook de la sesión 05 (D-18) por la decisión D-27 (2026-10-29): el servidor crea el contacto, la oportunidad y la cita con la API de GHL.
**Tú haces (en GHL y en Vercel, la sesión no puede):**
1. En GHL, crea una **integración privada** (Settings → Private Integrations) con permisos para contactos, oportunidades y calendarios (lectura y escritura). Copia el token **sin pegarlo en el chat**.
2. Define en GHL el **pipeline y sus etapas**, los **campos personalizados** que quieras guardar y el **calendario de llamadas**.
3. En Vercel → Settings → Environment Variables, crea (solo los nombres se comparten en el chat): `GHL_API_TOKEN`, `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID`, `GHL_CALENDAR_ID`. Para pruebas locales, las mismas en `.env.local`.
4. Pásale a la sesión, **en texto y sin valores secretos**: nombres de las etapas y de los campos personalizados, y cuáles formularios deben agendar cita.
**Depende de:** 05 (hecha). Mejor con una cuenta o subcuenta de **prueba** de GHL.
**Autorizo en este prompt:** leer los nombres de las variables (no sus valores), llamar a la API de GHL **solo con contactos de prueba** (nombre "PRUEBA …", correo `@example.com`) y borrar luego esos contactos de prueba si la API lo permite. **No autorizo:** datos reales de clientes, imprimir el token en logs o respuestas, ni desplegar a producción sin mi confirmación.

## Procedimiento

1. Haz tus 4 pasos de arriba.
2. **Abre una sesión nueva** en esta carpeta y pega el bloque de texto de abajo.
3. La sesión te presentará un plan corto (qué formularios solo crean contacto y oportunidad, cuáles agendan cita, y cómo se elige el horario) y esperará tu OK antes de programar.
4. Revisa el preview y prueba con un contacto de prueba. Comprueba en GHL que aparecen el contacto, la oportunidad en la etapa correcta y, si hubo cita, el evento en el calendario.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md (en especial D-18, D-27 y P-5), docs/INTEGRACIONES.md §1-§2 y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md.

Objetivo: que `enviarLead` (src/app/actions/lead.ts) cree en GoHighLevel, por su API, el contacto, la oportunidad y —solo donde corresponda— la cita, sin romper el plan B de WhatsApp. Responde en español, con tratamiento "tú".

Contexto: decisión D-27 (2026-10-29). Hoy el envío es por webhook (`GHL_WEBHOOK_URL`) y funciona contra un receptor local. Los formularios, la validación (zod, src/lib/leads.ts), el honeypot y el consentimiento ya existen: no los rehagas. Las credenciales están en variables de entorno (`GHL_API_TOKEN`, `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID`, `GHL_CALENDAR_ID`); léelas solo en servidor, nunca las imprimas ni las devuelvas al navegador, y no las pidas por chat.

Antes de programar, verifica la API vigente en la documentación oficial de GoHighLevel (API v2 / "Private Integrations"): URL base, cabecera de versión, nombres de endpoints y campos para (a) crear o actualizar un contacto, (b) crear una oportunidad en un pipeline y etapa, (c) consultar horarios libres de un calendario y (d) crear una cita. No uses de memoria nombres de endpoints ni de campos: confírmalos y dime qué fuente usaste.

Pasos:
1. Diagnóstico sin cambiar nada: lista los NOMBRES de las variables que existen en Vercel (`vercel env ls`) y en `.env.example`; dime cuáles faltan. Si falta alguna, detente y dímelo.
2. Plan corto, y espera mi OK antes de programar. Incluye: qué campos del lead (src/lib/leads.ts, INTEGRACIONES §2 "Mapeo de campos") van a campos estándar y cuáles a campos personalizados de GHL (te paso los nombres); qué formularios solo crean contacto + oportunidad y cuáles agendan cita; cómo elige el horario la persona (lista de horarios libres del calendario de llamadas, con estado de carga, vacío y error honestos); cómo evitas duplicados (actualizar el contacto si ya existe por celular o correo); y qué pasa si falla un paso a medias (por ejemplo, el contacto se creó pero la oportunidad no): el usuario nunca debe ver "Enviado" si el lead no quedó registrado, y siempre debe quedar el botón de WhatsApp con sus datos.
3. Implementa en una capa aparte (por ejemplo `src/lib/ghl.ts`, funciones puras o con `fetch` inyectable) con pruebas Vitest que simulen la API (sin red real). Tiempo máximo por llamada (8 s, como hoy), sin reintentos que puedan duplicar la cita, y sin registrar datos personales ni el token en logs.
4. Interfaz de la cita (solo donde acordemos): selector de horario accesible (teclado, `aria-live` en los cambios de disponibilidad), zona horaria de Lima explícita, a 390 px y 1280 px, con los tokens y patrones de docs/DISENO.md. Si no hay horarios libres, ofrece WhatsApp.
5. Pruebas e2e: ajusta `e2e/vender.spec.ts` y `e2e/webhook-falso.mjs` (o crea un GHL falso local) para comprobar contacto + oportunidad + cita contra un receptor local. Nunca llames a la API real desde las pruebas automáticas.
6. Prueba real, con mi OK explícito y solo con datos de prueba: un envío contra mi cuenta de GHL de prueba; confirma conmigo qué ves en GHL (contacto, oportunidad en la etapa correcta, cita en el calendario). Borra lo de prueba si puedo o dime cómo borrarlo.
7. Cuando funcione: quita `GHL_WEBHOOK_URL` del código y de la documentación solo si yo lo confirmo; actualiza docs/INTEGRACIONES.md (§1 variables, §2 contrato y mapeo), docs/DECISIONES.md (D-27 con lo hecho y P-5 con lo que sigue abierto), docs/ROADMAP.md, docs/PRUEBAS.md y .env.example (solo nombres).

Pruebas: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`. Interfaz de la cita a 390 y 1280 px.

Hecho cuando: un lead de prueba crea contacto, oportunidad y (donde corresponde) cita en GHL; un fallo de la API muestra error honesto con WhatsApp; ningún secreto aparece en el código, los logs ni el navegador; la documentación y las pruebas están al día. Dime qué verificaste de verdad (incluido lo que viste en GHL) y qué no, y qué decidiste sin consultarme.
````
