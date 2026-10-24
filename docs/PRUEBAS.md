# Pruebas

Red de seguridad del proyecto: qué se prueba, cómo correrlo y qué **no** cubre todavía. Creada en la sesión 12 (2026-10-23).

## Correr todo

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (línea base: 0 errores, 0 advertencias)
npm test            # Vitest: pruebas unitarias de src/lib/finance.ts
npm run test:e2e    # Playwright: compila el build de producción y lo prueba en Chromium
npm run build       # build de producción
```

La primera vez en una máquina nueva, instala el navegador de Playwright:

```bash
npx playwright install chromium
```

`npm run test:e2e` hace su propio `next build` y levanta `next start` en el puerto **3100** (y un webhook falso en el **3101**); los apaga al terminar. Si alguno de esos puertos está ocupado, falla al arrancar: libéralo o cambia `PUERTO` en `playwright.config.ts`. Para ver el detalle de una prueba fallida: `npx playwright show-trace test-results/<carpeta>/trace.zip`.

## Qué cubre

### Unitarias — Vitest (`src/lib/finance.test.ts`)
Matemática financiera pura de `src/lib/finance.ts`: cuota francesa, TEA → TEM, cronograma, rentabilidad, validación de entradas. El origen de cada valor de referencia está en los comentarios del archivo.

### De extremo a extremo — Playwright (`e2e/`)
Contra el **build de producción**, en Chromium, a 1280 px salvo donde se indica 390 px.

| Archivo | Qué comprueba |
|---|---|
| `rutas.spec.ts` | Cada ruta de `RUTAS` (`src/lib/rutas.ts`) responde 200, tiene `<title>` y un solo `<main>`; ningún título se repite; `/robots.txt` y `/sitemap.xml` responden 200; una ruta inexistente da 404 |
| `navegacion.spec.ts` | **390 px:** el menú móvil abre, se cierra con el botón y con Esc, y se cierra solo al navegar. El botón flotante de WhatsApp apunta a `wa.me/51977588905` en 4 rutas; ningún enlace `wa.me` usa otro número; no aparece `51900000000` |
| `simuladores.spec.ts` | Los dos simuladores con valores límite en **cada** campo (`0`, `-1`, vacío, `0.0001`, `999999999999999`, `1e308`) y TEA 0: nunca muestran `NaN`, `Infinity` ni `∞`; un valor inválido muestra un mensaje de error. También a 390 px |
| `analitica.spec.ts` | Build con IDs **ficticios** y Google/Meta/`wa.me` interceptados (nada sale de la máquina): sin decisión no hay peticiones a Google ni Meta; el rechazo persiste al recargar; al aceptar se piden `gtag.js` y `fbevents.js`; un evento por acción (WhatsApp, simulador, error y envío de formulario) sin nombre/celular/correo; "Preferencias de cookies" reabre el banner y rechazar detiene los eventos; a 390 px los botones son iguales, ≥ 44 px y alcanzables con Tab |
| `vender.spec.ts` | Asistente de `/vender` hasta el formulario: datos inválidos muestran errores por campo sin borrar lo escrito; sin consentimiento no se envía; datos válidos muestran la confirmación; si el webhook responde error, aparece el plan B de WhatsApp con el número oficial |

### Cómo se evita enviar datos reales
Los formularios usan la Server Action `enviarLead`, que hace el `fetch` **en el servidor**: el navegador de Playwright no puede interceptarlo. Por eso `playwright.config.ts` arranca `e2e/webhook-falso.mjs` (un servidor local que responde 200, o 503 si el nombre contiene `FALLA`) y fija `GHL_WEBHOOK_URL` hacia él como variable de proceso, que Next no sobrescribe con un `.env.local`. El webhook falso no guarda ni imprime lo que recibe. Los datos de prueba son ficticios (`Prueba E2E`, `987654321`).

## Integración continua (`.github/workflows/ci.yml`)

En cada `push` y pull request, GitHub Actions corre con Node 24 y caché de npm: `npm ci` → `typecheck` → `lint` → `test` → `build`. Sin secretos ni variables de entorno. **Las pruebas e2e no corren en CI** (instalar Chromium en cada ejecución alarga el CI ~1-2 min); se corren en local antes de cerrar la sesión. Si se quieren en CI, añadir `npx playwright install --with-deps chromium` y `npm run test:e2e`.

## Qué no cubre (todavía)

- Envío contra **GoHighLevel real** (depende de P-5; ver [INTEGRACIONES.md](INTEGRACIONES.md)).
- Formularios de la home, simuladores y servicios (solo se prueba el de `/vender`; todos usan el mismo `LeadForm`).
- Catálogo: filtros y fichas `/propiedades/[slug]` (hoy no hay propiedades publicadas, D-20).
- Otros navegadores (Firefox, Safari/WebKit) y dispositivos reales.
- Accesibilidad automática (axe) y lector de pantalla; regresión visual.
- Exactitud financiera frente a un simulador bancario real (D-19).

## Al añadir algo

- Ruta nueva: basta con añadirla a `RUTAS`; `rutas.spec.ts` la recorre sola.
- Banner de cookies: el build de e2e lleva IDs de analítica ficticios, así que el banner existe; `playwright.config.ts` arranca cada prueba con la decisión `rechazado` (`storageState`) para que no tape nada. Solo `analitica.spec.ts` la vacía.
- Campo nuevo en un simulador: añade su etiqueta a la lista de `simuladores.spec.ts`.
- Cálculo nuevo: función pura en `finance.ts` con su prueba en `finance.test.ts`.
