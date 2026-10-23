import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo contra el build de producción (`next build` + `next start`).
 * Guía: docs/PRUEBAS.md.
 *
 * Los formularios nunca envían datos reales: `GHL_WEBHOOK_URL` apunta a un webhook
 * falso local (e2e/webhook-falso.mjs). Al ser una variable de proceso con valor,
 * Next no la sobrescribe con un posible `.env.local`.
 */
const PUERTO = 3100;
const PUERTO_WEBHOOK = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PUERTO}`,
    trace: "retain-on-failure",
  },
  // Escritorio por defecto (1280 px); las pruebas móviles fijan 390 px con `test.use`.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } }],
  webServer: [
    {
      command: `node e2e/webhook-falso.mjs ${PUERTO_WEBHOOK}`,
      url: `http://127.0.0.1:${PUERTO_WEBHOOK}/salud`,
      reuseExistingServer: false,
    },
    {
      command: `npm run build && npx next start -p ${PUERTO}`,
      url: `http://127.0.0.1:${PUERTO}`,
      timeout: 300_000,
      reuseExistingServer: false,
      env: { GHL_WEBHOOK_URL: `http://127.0.0.1:${PUERTO_WEBHOOK}/webhook` },
    },
  ],
});
