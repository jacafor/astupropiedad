import { expect, test, type Page } from "@playwright/test";

// El formulario de /vender envía a una API de GHL FALSA y local (e2e/ghl-falso.mjs, ver
// playwright.config.ts). Datos de prueba ficticios; nunca datos de clientes.

const GHL_FALSO = "http://127.0.0.1:3101";

const llegarAlFormulario = async (page: Page) => {
  await page.goto("/vender");
  await page.getByRole("button", { name: "Departamento" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("¿Dónde está ubicado?").fill("Distrito de prueba");
  await page.getByRole("button", { name: "Último paso" }).click();
  await expect(page.getByRole("heading", { name: "Casi listo" })).toBeVisible();
};

const llenar = async (page: Page, nombre: string) => {
  await page.getByLabel("Nombre completo").fill(nombre);
  await page.getByLabel("Celular").fill("987654321");
  await page.getByRole("checkbox", { name: /Acepto que AS Tupropiedad/ }).check();
};

const enviar = (page: Page) => page.getByRole("button", { name: "Enviar datos para la valoración" }).click();

/** Rutas que la API falsa recibió para ese contacto (el id sale del nombre). */
const registro = async (page: Page, idContacto: string): Promise<string[]> =>
  (await page.request.get(`${GHL_FALSO}/__registro/${idContacto}`)).json();

test("datos inválidos muestran errores y no se pierde lo escrito", async ({ page }) => {
  await llegarAlFormulario(page);

  await enviar(page);
  await expect(page.locator("form").getByRole("alert")).toContainText("Revisa los campos marcados");
  await expect(page.getByText("Escribe tu nombre completo.")).toBeVisible();

  await page.getByLabel("Nombre completo").fill("Prueba E2E");
  await page.getByLabel("Celular").fill("123");
  await enviar(page);
  await expect(page.getByText("Escribe un celular peruano válido", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Celular")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Prueba E2E");

  // Sin consentimiento tampoco se envía.
  await page.getByLabel("Celular").fill("987654321");
  await enviar(page);
  await expect(page.locator("form").getByRole("alert")).toContainText("Revisa los campos marcados");
});

test("sin cita: crea contacto, etiquetas, nota y oportunidad en la etapa inicial", async ({ page }) => {
  await llegarAlFormulario(page);
  await llenar(page, "Prueba Solo Contacto");
  await enviar(page);
  await expect(page.getByText("Recibimos tu solicitud")).toBeVisible();

  const rutas = await registro(page, "c-prueba-solo-contacto");
  expect(rutas).toEqual(
    expect.arrayContaining([
      "POST /contacts/upsert",
      "POST /contacts/tags",
      "POST /contacts/notes",
      "GET /opportunities/search",
      "POST /opportunities/ etapa=etapa-nuevo-e2e",
    ])
  );
  expect(rutas.some((r) => r.includes("appointments"))).toBe(false);
});

test("con cita: elige día y hora de Lima, crea la cita y mueve la oportunidad", async ({ page }) => {
  await llegarAlFormulario(page);
  await llenar(page, "Prueba Con Cita");

  await page.getByRole("checkbox", { name: /Quiero agendar una llamada/ }).check();
  await expect(page.getByRole("status").filter({ hasText: "horarios libres" })).toContainText("Hay 4 horarios libres en 2 días");
  await expect(page.getByText("Horarios en hora de Lima (GMT-5).")).toBeVisible();

  // Sin elegir hora, el servidor lo pide y no se pierde nada.
  await enviar(page);
  await expect(page.getByText("Elige un horario de la lista")).toBeVisible();

  // Los radios son nativos pero visualmente ocultos (sr-only): se hace clic en su etiqueta.
  await page.getByRole("group", { name: "Día" }).locator("label").nth(1).click();
  await page.getByRole("group", { name: /^Hora/ }).locator("label", { hasText: "11:00" }).click();
  await expect(page.getByRole("group", { name: /^Hora/ }).getByRole("radio", { name: "11:00" })).toBeChecked();
  await enviar(page);

  await expect(page.getByText("Tu llamada quedó agendada para el")).toBeVisible();
  await expect(page.getByText(/a las 11:00 \(hora de Lima\)/)).toBeVisible();

  const rutas = await registro(page, "c-prueba-con-cita");
  expect(rutas).toContain("POST /opportunities/ etapa=etapa-nuevo-e2e");
  expect(rutas.some((r) => /^POST \/appointments \d{4}-\d{2}-\d{2}T11:00:00-05:00$/.test(r))).toBe(true);
  expect(rutas).toContain("PUT /opportunities etapa=etapa-cita-e2e");
});

test("si la cita falla, el lead queda y se ofrece coordinar por WhatsApp", async ({ page }) => {
  await llegarAlFormulario(page);
  await llenar(page, "Prueba SINCITA");
  await page.getByRole("checkbox", { name: /Quiero agendar una llamada/ }).check();
  await page.getByRole("group", { name: /^Hora/ }).locator("label", { hasText: "10:00" }).click();
  await enviar(page);

  await expect(page.getByText("Recibimos tu solicitud")).toBeVisible();
  await expect(page.getByText("no pudimos reservar la hora que elegiste")).toBeVisible();
  await expect(page.getByRole("link", { name: "Coordinar la llamada por WhatsApp" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/51977588905\?text=.*agendar%20una%20llamada/
  );
  expect(await registro(page, "c-prueba-sincita")).toContain("POST /opportunities/ etapa=etapa-nuevo-e2e");
});

test("si la oportunidad falla, no dice 'Recibimos' y ofrece WhatsApp con los datos", async ({ page }) => {
  await llegarAlFormulario(page);
  await llenar(page, "Prueba SINOPORTUNIDAD");
  await enviar(page);
  await expect(page.locator("form").getByRole("alert")).toContainText("No pudimos enviar tu solicitud");
  await expect(page.getByText("Recibimos tu solicitud")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Escribir por WhatsApp con mis datos" })).toBeVisible();
});

test("si GHL no responde, ofrece WhatsApp con los datos", async ({ page }) => {
  await llegarAlFormulario(page);
  await llenar(page, "Prueba CAIDO");
  await enviar(page);
  await expect(page.locator("form").getByRole("alert")).toContainText("No pudimos enviar tu solicitud");
  const plan = page.getByRole("link", { name: "Escribir por WhatsApp con mis datos" });
  await expect(plan).toHaveAttribute("href", /^https:\/\/wa\.me\/51977588905\?text=/);
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Prueba CAIDO");
});

test.describe("a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("el selector de horario cabe y se usa con teclado", async ({ page }) => {
    await llegarAlFormulario(page);
    await page.getByRole("checkbox", { name: /Quiero agendar una llamada/ }).check();
    const hora = page.getByRole("group", { name: /^Hora/ }).getByRole("radio").first();
    await expect(hora).toBeAttached();
    await hora.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("group", { name: /^Hora/ }).getByRole("radio").nth(1)).toBeChecked();
    const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(anchoPagina).toBeLessThanOrEqual(390);
  });
});
