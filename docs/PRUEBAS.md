# Pruebas

Red de seguridad del proyecto: qué se prueba, cómo correrlo y qué **no** cubre todavía. Creada en la sesión 12 (2026-10-23).

## Correr todo

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (línea base: 0 errores, 0 advertencias)
npm test            # Vitest: pruebas unitarias de src/lib y src/data
npm run test:e2e    # Playwright: compila el build de producción y lo prueba en Chromium
npm run build       # build de producción
```

La primera vez en una máquina nueva, instala el navegador de Playwright:

```bash
npx playwright install chromium
```

`npm run test:e2e` hace su propio `next build` y levanta `next start` en el puerto **3100** (y la API de GHL falsa en el **3101**); los apaga al terminar. Si alguno de esos puertos está ocupado, falla al arrancar: libéralo o cambia `PUERTO` en `playwright.config.ts`. Para ver el detalle de una prueba fallida: `npx playwright show-trace test-results/<carpeta>/trace.zip`. En el equipo de jforero, con los procesos por defecto, varias pruebas agotan los 30 s por carga de la máquina (2026-10-30); con `npx playwright test --workers=2` pasan todas.

## Qué cubre

### Unitarias — Vitest
- `src/lib/finance.test.ts`: matemática financiera pura de `src/lib/finance.ts` (cuota francesa, TEA → TEM, cronograma, rentabilidad, validación de entradas). El origen de cada valor de referencia está en los comentarios del archivo.
- `src/lib/ghl.test.ts`: cliente de GHL con una API **simulada** (`fetch` inyectado): token y cabecera `Version` por endpoint, errores sin token ni URL, tiempo agotado frente a red, mapeo de contacto/oportunidad, oportunidad reutilizada, fallo de la oportunidad (lanza, sin cita), fallo de la cita (lead registrado, sin reintento), etiquetas caídas que no bloquean, reclutamiento sin oportunidad.
- `src/lib/horarios.test.ts`: horarios en hora de Lima, margen y horizonte, agrupado y etiquetas en español.
- `src/data/properties.test.ts`: moneda por operación (D-28) e `id`/`slug` sin repetir.
- `src/lib/catalogo/catalogo.test.ts`: esquema zod del formulario de `/admin` (normaliza números con coma y espacios, moneda fijada por la operación, slug automático, un mensaje en español por cada campo inválido), conversión a columnas, mapeo de filas de Supabase (numéricos en texto, orden de fotos, solo publicadas con fotos llegan al público) y `leerConfigSupabase` (solo URL `https://`).
- `src/lib/catalogo/fotos.test.ts`: conversión a WebP con `sharp` (reduce a 2000 px, no agranda, quita metadatos, rechaza GIF y archivos que no son imagen) y reordenar fotos.

### De extremo a extremo — Playwright (`e2e/`)
Contra el **build de producción**, en Chromium, a 1280 px salvo donde se indica 390 px.

| Archivo | Qué comprueba |
|---|---|
| `rutas.spec.ts` | Cada ruta de `RUTAS` (`src/lib/rutas.ts`) responde 200, tiene `<title>` y un solo `<main>`; ningún título se repite; `/robots.txt` y `/sitemap.xml` responden 200; una ruta inexistente da 404 |
| `navegacion.spec.ts` | **390 px:** el menú móvil abre, se cierra con el botón y con Esc, y se cierra solo al navegar. El botón flotante de WhatsApp apunta a `wa.me/51977588905` en 4 rutas; ningún enlace `wa.me` usa otro número; no aparece `51900000000` |
| `simuladores.spec.ts` | Los dos simuladores con valores límite en **cada** campo (`0`, `-1`, vacío, `0.0001`, `999999999999999`, `1e308`) y TEA 0: nunca muestran `NaN`, `Infinity` ni `∞`; un valor inválido muestra un mensaje de error. También a 390 px |
| `analitica.spec.ts` | Build con IDs **ficticios** y Google/Meta/`wa.me` interceptados (nada sale de la máquina): sin decisión no hay peticiones a Google ni Meta; el rechazo persiste al recargar; al aceptar se piden `gtag.js` y `fbevents.js`; un evento por acción (WhatsApp, simulador, error y envío de formulario) sin nombre/celular/correo; "Preferencias de cookies" reabre el banner y rechazar detiene los eventos; a 390 px los botones son iguales, ≥ 44 px y alcanzables con Tab |
| `admin.spec.ts` | **Sin Supabase** (lo normal): `/admin` lleva a `/admin/ingresar`, avisa que no está conectado, lleva `noindex` (meta y `X-Robots-Tag`) y no muestra barra, pie ni WhatsApp; el catálogo no muestra el `EJEMPLO`; el sitemap no anuncia `/admin`; a 390 px no se desborda. **Con el Supabase de pruebas** (`E2E_*`): credenciales erróneas → error claro; crear con errores sin perder lo escrito, subir dos fotos, hacer portada, publicar, verla en el catálogo y en su ficha, editar el precio (slug bloqueado), archivar → 404 |
| `vender.spec.ts` | Asistente de `/vender` hasta el formulario: datos inválidos muestran errores por campo sin borrar lo escrito; sin consentimiento no se envía; **sin cita** llegan contacto, etiquetas, nota y oportunidad en la etapa inicial; **con cita** se pide elegir hora, se eligen día y hora de Lima, se crea la cita y la oportunidad pasa a la etapa de cita; si la cita falla, el lead queda y se ofrece WhatsApp; si la oportunidad o el contacto fallan, no aparece "Recibimos" y sí el plan B; a 390 px el selector cabe y se usa con flechas |

### Cómo se evita enviar datos reales
Los formularios usan las Server Actions `enviarLead` y `obtenerHorarios`, que hacen el `fetch` **en el servidor**: el navegador de Playwright no puede interceptarlo. Por eso `playwright.config.ts` arranca `e2e/ghl-falso.mjs` (API de GHL falsa: exige `Bearer token-e2e` y la `Version` correcta, da horarios de mañana y pasado a las 10:00 y 11:00 de Lima, y falla a propósito si el nombre contiene `CAIDO`, `SINOPORTUNIDAD` o `SINCITA`) y fija **todas** las variables `GHL_*`, incluida `GHL_API_BASE_URL`, como variables de proceso, que Next no sobrescribe con un `.env.local` (que podría tener el token real). La API falsa guarda en memoria qué rutas llamó cada contacto (`GET /__registro/<id>`) y nunca nombres, celulares ni correos. Los datos de prueba son ficticios (`Prueba E2E`, `987654321`).

**Supabase:** `playwright.config.ts` fija `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como variables de proceso: con las `E2E_*` exportadas apuntan al proyecto **de pruebas**; sin ellas valen `sin-supabase` (no es una URL https, así que el sitio queda sin base de datos). Así nunca se usa el proyecto del sitio de `.env.local`. Para correr el flujo completo de `/admin`, en PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File e2eadmin-con-supabase.ps1
```

El script (`e2e/admin-con-supabase.ps1`) fija las `E2E_*` del proyecto de pruebas, instala el navegador de Playwright si falta, **pide la clave oculta** (no queda en el historial ni pasa por el chat) y corre con `--headed` (se ve la ventana; no la toques). Otra cuenta: `-Correo <correo>`. Superada el 2026-11-05 con la cuenta de administración de jforero en Pruebas: 3 pruebas OK (las 3 omitidas son las de "sin Supabase", que cubre la batería normal).

La cuenta se crea y se autoriza en el proyecto de pruebas igual que la real (NEGOCIO-Y-CONTENIDO → "Dar acceso…"). Cada ejecución deja una propiedad `E2E-…` archivada y sus fotos en ese proyecto.

## Integración continua (`.github/workflows/ci.yml`)

En cada `push` y pull request, GitHub Actions corre con Node 24 y caché de npm: `npm ci` → `typecheck` → `lint` → `test` → `build`. Sin secretos ni variables de entorno. **Las pruebas e2e no corren en CI** (instalar Chromium en cada ejecución alarga el CI ~1-2 min); se corren en local antes de cerrar la sesión. Si se quieren en CI, añadir `npx playwright install --with-deps chromium` y `npm run test:e2e`.

## Qué no cubre (todavía)

- Envío contra **GoHighLevel real** (prueba manual pendiente con OK de jforero, P-5; ver [INTEGRACIONES.md](INTEGRACIONES.md)).
- Selector de cita **sin horarios** y con **error al cargarlos** (la API falsa siempre da 4 horarios); el tiempo agotado sí está en `ghl.test.ts`.
- Formularios de la home, simuladores y servicios (solo se prueba el de `/vender`; todos usan el mismo `LeadForm`).
- Catálogo: filtros del catálogo público (hoy no hay propiedades publicadas, D-20). Las fichas creadas desde `/admin` solo se prueban con el Supabase de pruebas.
- Políticas RLS de Supabase de forma automática (se revisan con SQL en el proyecto; ver D-30).
- Otros navegadores (Firefox, Safari/WebKit) y dispositivos reales.
- Accesibilidad automática (axe) y lector de pantalla; regresión visual.
- Exactitud financiera frente a un simulador bancario real (D-19).

## Al añadir algo

- Ruta nueva: basta con añadirla a `RUTAS`; `rutas.spec.ts` la recorre sola.
- Banner de cookies: el build de e2e lleva IDs de analítica ficticios, así que el banner existe; `playwright.config.ts` arranca cada prueba con la decisión `rechazado` (`storageState`) para que no tape nada. Solo `analitica.spec.ts` la vacía.
- Campo nuevo en un simulador: añade su etiqueta a la lista de `simuladores.spec.ts`.
- Cálculo nuevo: función pura en `finance.ts` con su prueba en `finance.test.ts`.
