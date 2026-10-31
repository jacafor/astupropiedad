# Despliegue

Cómo llega el código a Vercel, qué revisar antes y cómo volver atrás. Detalle de la integración: [INTEGRACIONES.md](INTEGRACIONES.md) §5. Pruebas: [PRUEBAS.md](PRUEBAS.md).

> **Advertencia:** el proyecto Vercel `web-as-tupropiedad` está conectado a `jacafor/astupropiedad`. Un `push` (o merge) a **`main` despliega a producción**. Trabaja siempre en ramas.

> `main` **no está protegido** por decisión de jforero (2026-10-05, mientras dure el desarrollo): GitHub no bloquea el push directo, así que la disciplina de ramas depende de nosotros. El dominio raíz `astupropiedad.com` **no está asignado** a este proyecto (hoy sirve otra web). Desde el 2026-10-29 el sitio también responde en el subdominio `https://web.astupropiedad.com` (lo asignó jforero); su canonical, `robots` y sitemap siguen apuntando a `astupropiedad.com`. Producción: `https://web-as-tupropiedad.vercel.app` y ese subdominio.

## Flujo acordado

> **Regla de desarrollo (jforero, 2026-10-05, hasta que él diga que terminó; D-14):** al cerrar cada sesión, Claude hace `push` de la rama, abre el pull request y **lo fusiona** si tipos, lint y build pasan, el CI está en verde y el preview está en *Ready*. Cada merge despliega a producción; para deshacerlo, ver "Volver atrás".

1. Una rama por sesión/tarea (`git switch -c <nombre>`).
2. En local: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build` (detalle en [PRUEBAS.md](PRUEBAS.md)).
3. `push` de la rama → GitHub Actions corre el CI (typecheck, lint, test, build) y Vercel genera un **preview** (URL propia por rama/commit; revisa que el estado sea *Ready*).
4. Pull request hacia `main` → lista previa (abajo) y revisión del preview a 390 px y 1280 px.
5. Merge a `main` = despliegue a **producción**. Durante el desarrollo lo hace Claude con las condiciones de arriba; al terminar el desarrollo vuelve a requerir confirmación de jforero.
6. Tras el merge, verificar en `https://web-as-tupropiedad.vercel.app` lo que cambió (no basta con que el despliegue figure como *success*; las URLs por despliegue piden login de Vercel).

Nadie despliega a mano con `vercel --prod`: el único camino a producción es el merge a `main`.

## Lista previa al merge

Ejecuta el comando de proyecto **`/revisar-deploy`** (`.claude/commands/revisar-deploy.md`): tipos, lint, build, `npm audit --omit=dev`, contacto único, enlaces, formularios con webhook de prueba, títulos únicos, secretos y cabeceras. Entrega un semáforo y una recomendación "desplegar / no desplegar". Resumen mínimo si no usas Claude Code:

- [ ] CI en verde en el pull request y preview de Vercel en *Ready*.
- [ ] `npm run test:e2e` pasó en local (no corre en CI).
- [ ] `npm audit --omit=dev` sin críticas ni altas.
- [ ] Ningún dato de negocio inventado; contacto solo desde `src/lib/contact.ts`.
- [ ] Variables de entorno del entorno de destino definidas (tabla de abajo).
- [ ] Preview revisado a 390 px: menú, CTA, botón de WhatsApp, simuladores.

## Volver atrás

- **Rápido (minutos, sin tocar git):** Vercel → proyecto `web-as-tupropiedad` → *Deployments* → elegir el último despliegue de producción bueno (estado *Ready*) → menú ⋯ → *Instant Rollback* (o *Promote to Production*). Producción vuelve a esa versión al instante. Ojo: mientras el rollback esté activo, Vercel puede no promover solos los merges nuevos a `main`; al arreglar, revisa en el panel que el último despliegue quedó en producción.
- **Definitivo:** `git revert -m 1 <commit del merge>` en una rama nueva, pull request y merge (repite el flujo). Así `main` vuelve a coincidir con producción.
- Tras cualquiera de los dos, comprueba la URL pública y anota el incidente en el PR.

## Configuración verificada (2026-10-05)

| Ajuste | Valor |
|---|---|
| Rama de producción | `main` |
| Framework | `nextjs` (fijado en `vercel.json`; el panel muestra "Other") |
| Install / Build | `npm install` / `npm run build` (en `vercel.json`) |
| Node | 24.x (el CI de GitHub Actions usa también Node 24) |
| Previews por rama | activos |

## Variables de entorno por entorno

Solo nombres; los valores se escriben en Vercel → *Settings* → *Environment Variables* (y en `.env.local` para desarrollo, que git ignora). Los secretos nunca llevan prefijo `NEXT_PUBLIC_` ni van al chat ni al repo. Comprobado en el código el 2026-10-23: solo se leen las tres primeras.

| Variable | Qué hace | Development (`.env.local`) | Preview | Production |
|---|---|---|---|---|
| `GHL_API_TOKEN` | Token de la integración privada de GHL (solo servidor, *Sensitive*). Con las 4 siguientes, los leads van por la API (D-27) | en `.env.local` solo si vas a escribir en el GHL real | cargado | cargado |
| `GHL_LOCATION_ID`, `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID`, `GHL_CALENDAR_ID`, `GHL_PIPELINE_STAGE_CITA_ID` (opcional) | Subcuenta, pipeline, etapa inicial, calendario de llamadas y etapa al agendar | cargadas en Vercel (Development) | cargadas | cargadas |
| `GHL_WEBHOOK_URL` | Respaldo (D-18): solo si falta alguna variable de la API. Sin ninguna, los formularios muestran un error honesto y ofrecen WhatsApp | vacía | vacía | vacía |
| `NEXT_PUBLIC_SITE_URL` | Dominio canónico (metadata, sitemap, OG). Por defecto `https://astupropiedad.com` | opcional | opcional | definir al asignar el dominio (P-12) |
| `MOSTRAR_EJEMPLO` | `1` muestra la propiedad de EJEMPLO en un build de producción (D-20) | no hace falta (en `dev` ya se ve) | opcional, para revisar fichas | **nunca** |
| `NEXT_PUBLIC_GHL_CALENDAR_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Previstas en `.env.example`; **ningún código las lee todavía** | — | — | — |

Estado en Vercel (verificado el 2026-10-30 con `vercel env ls`, solo nombres): las seis `GHL_*` de la API (el token solo en Production y Preview). Las variables de solo servidor se leen al ejecutar: tras cambiarlas, vuelve a desplegar para que la función las tome. El build no necesita ninguna, por eso el CI corre sin secretos. Las variables `NEXT_PUBLIC_*` se fijan **en el build**: si cambias una en Vercel, vuelve a desplegar.
