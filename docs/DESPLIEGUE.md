# Despliegue

Resumen de cómo llega el código a Vercel. Detalle de la integración: [INTEGRACIONES.md](INTEGRACIONES.md) §5.

> **Advertencia:** el proyecto Vercel `web-as-tupropiedad` está conectado a `jacafor/astupropiedad`. Un `push` (o merge) a **`main` despliega a producción**. Trabaja siempre en ramas.

> `main` **no está protegido** por decisión de jforero (2026-10-05, mientras dure el desarrollo): GitHub no bloquea el push directo, así que la disciplina de ramas depende de nosotros. El dominio `astupropiedad.com` **no está asignado** a este proyecto (hoy sirve otra web); producción solo se ve en la URL `*.vercel.app`.

## Flujo acordado

> **Regla de desarrollo (jforero, 2026-10-05, hasta que él diga que terminó; D-14):** al cerrar cada sesión, Claude hace `push` de la rama, abre el pull request y **lo fusiona** si tipos, lint y build pasan y el preview está en *Ready*. Cada merge despliega a producción; para deshacerlo, ver "Volver atrás".

1. Una rama por sesión/tarea (`git switch -c <nombre>`).
2. `npx tsc --noEmit && npm run lint && npm run build` en local.
3. `push` de la rama → Vercel genera un **preview** (URL propia por rama/commit; revisa que el estado sea *Ready*).
4. Pull request hacia `main` → revisión del preview (7 rutas, 390 px y 1280 px).
5. Merge a `main` = despliegue a **producción**. Durante el desarrollo lo hace Claude con las condiciones de arriba; al terminar el desarrollo vuelve a requerir confirmación de jforero.

## Volver atrás

- **Rápido:** Vercel → proyecto → *Deployments* → elegir el despliegue anterior en *Ready* → *Promote to Production* (o *Instant Rollback*).
- **Definitivo:** `git revert <commit>` en una rama y repetir el flujo.

## Configuración verificada (2026-10-05)

| Ajuste | Valor |
|---|---|
| Rama de producción | `main` |
| Framework | `nextjs` (fijado en `vercel.json`; el panel muestra "Other") |
| Install / Build | `npm install` / `npm run build` (en `vercel.json`) |
| Node | 24.x |
| Previews por rama | activos |

## Variables de entorno (solo nombres; valores en Vercel → Settings → Environment Variables)

Hoy **no hay ninguna** definida en Production, Preview ni Development. Nombres previstos (ver `.env.example`): `NEXT_PUBLIC_SITE_URL`, `GHL_WEBHOOK_URL`, `GHL_API_KEY`, `GHL_LOCATION_ID`, `NEXT_PUBLIC_GHL_CALENDAR_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Ninguna es necesaria para el build actual. Los secretos nunca llevan prefijo `NEXT_PUBLIC_` ni van al chat.
