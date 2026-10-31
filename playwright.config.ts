import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo contra el build de producción (`next build` + `next start`).
 * Guía: docs/PRUEBAS.md.
 *
 * Los formularios nunca envían datos reales: las variables `GHL_*` apuntan a una API de
 * GoHighLevel falsa y local (e2e/ghl-falso.mjs) con un token ficticio. Al ser variables de
 * proceso con valor, Next no las sobrescribe con un posible `.env.local` (que podría tener
 * las credenciales reales): por eso se fijan TODAS, también `GHL_API_BASE_URL`.
 */
const PUERTO = 3100;
const PUERTO_GHL = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PUERTO}`,
    trace: "retain-on-failure",
    // Con IDs de prueba el banner de cookies aparece; las pruebas arrancan con "rechazado"
    // para que no tape nada. e2e/analitica.spec.ts lo vacía para probar el banner.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: `http://127.0.0.1:${PUERTO}`,
          localStorage: [{ name: "astp-consentimiento-cookies", value: "rechazado" }],
        },
      ],
    },
  },
  // Escritorio por defecto (1280 px); las pruebas móviles fijan 390 px con `test.use`.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } }],
  webServer: [
    {
      command: `node e2e/ghl-falso.mjs ${PUERTO_GHL}`,
      url: `http://127.0.0.1:${PUERTO_GHL}/salud`,
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npx next start -p ${PUERTO}`,
      url: `http://127.0.0.1:${PUERTO}`,
      timeout: 300_000,
      reuseExistingServer: false,
      // IDs de analítica FICTICIOS (formato válido, no existen): activan el banner y los scripts,
      // cuyas peticiones intercepta e2e/analitica.spec.ts.
      env: {
        GHL_API_BASE_URL: `http://127.0.0.1:${PUERTO_GHL}`,
        GHL_API_TOKEN: "token-e2e",
        GHL_LOCATION_ID: "ubicacion-e2e",
        GHL_PIPELINE_ID: "pipeline-e2e",
        GHL_PIPELINE_STAGE_ID: "etapa-nuevo-e2e",
        GHL_PIPELINE_STAGE_CITA_ID: "etapa-cita-e2e",
        GHL_CALENDAR_ID: "calendario-e2e",
        NEXT_PUBLIC_GA_ID: "G-PRUEBAE2E00",
        NEXT_PUBLIC_META_PIXEL_ID: "100000000000000",
      },
    },
  ],
});
