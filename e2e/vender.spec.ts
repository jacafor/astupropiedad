import { expect, test, type Page } from "@playwright/test";

// El formulario de /vender envía a un webhook FALSO local (ver playwright.config.ts).
// Datos de prueba ficticios; nunca datos de clientes.

const llegarAlFormulario = async (page: Page) => {
  await page.goto("/vender");
  await page.getByRole("button", { name: "Departamento" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("¿Dónde está ubicado?").fill("Distrito de prueba");
  await page.getByRole("button", { name: "Último paso" }).click();
  await expect(page.getByRole("heading", { name: "Casi listo" })).toBeVisible();
};

const enviar = (page: Page) => page.getByRole("button", { name: "Enviar datos para la valoración" }).click();

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

test("datos válidos llegan al webhook falso y muestran confirmación", async ({ page }) => {
  await llegarAlFormulario(page);
  await page.getByLabel("Nombre completo").fill("Prueba E2E");
  await page.getByLabel("Celular").fill("987654321");
  await page.getByRole("checkbox").check();
  await enviar(page);
  await expect(page.getByText("Recibimos tu solicitud")).toBeVisible();
});

test("si el webhook falla, ofrece WhatsApp con los datos", async ({ page }) => {
  await llegarAlFormulario(page);
  await page.getByLabel("Nombre completo").fill("Prueba FALLA");
  await page.getByLabel("Celular").fill("987654321");
  await page.getByRole("checkbox").check();
  await enviar(page);
  await expect(page.locator("form").getByRole("alert")).toContainText("No pudimos enviar tu solicitud");
  const plan = page.getByRole("link", { name: "Escribir por WhatsApp con mis datos" });
  await expect(plan).toHaveAttribute("href", /^https:\/\/wa\.me\/51977588905\?text=/);
  await expect(page.getByLabel("Nombre completo")).toHaveValue("Prueba FALLA");
});
