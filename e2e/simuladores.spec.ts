import { expect, test, type Page } from "@playwright/test";

// Con valores límite, ningún simulador debe mostrar NaN, Infinity ni ∞.
const VALORES_LIMITE = ["0", "-1", "", "0.0001", "999999999999999", "1e308"];

const sinValoresImposibles = async (page: Page) => {
  const texto = await page.locator("main").innerText();
  expect(texto).not.toMatch(/NaN|Infinity|∞/);
};

const probarCampos = async (page: Page, etiquetas: string[]) => {
  for (const etiqueta of etiquetas) {
    const campo = page.getByLabel(etiqueta, { exact: true });
    const original = await campo.inputValue();
    for (const valor of VALORES_LIMITE) {
      await campo.fill(valor);
      await sinValoresImposibles(page);
    }
    await campo.fill(original);
  }
};

test("simulador hipotecario sin NaN ni ∞", async ({ page }) => {
  await page.goto("/simulador-hipotecario");
  await sinValoresImposibles(page);
  await probarCampos(page, [
    "Monto del préstamo",
    "Tasa anual (TEA) estimada",
    "Plazo (años)",
    "Tu ingreso mensual (opcional)",
    "Tope de cuota sobre ingreso (opcional)",
    "Tipo de cambio (opcional)",
  ]);

  // Caso extremo combinado: tasa 0 (división por cero en la fórmula) y plazo máximo.
  await page.getByLabel("Tasa anual (TEA) estimada", { exact: true }).fill("0");
  await page.getByLabel("Plazo (años)", { exact: true }).fill("40");
  await sinValoresImposibles(page);
  // Un valor inválido muestra un mensaje en vez de un resultado.
  await page.getByLabel("Plazo (años)", { exact: true }).fill("0");
  await expect(page.locator("main").getByRole("alert").first()).toBeVisible();
});

test("simulador de inversión sin NaN ni ∞", async ({ page }) => {
  await page.goto("/simulador-inversion");
  await sinValoresImposibles(page);
  await probarCampos(page, [
    "Precio de compra",
    "Alquiler mensual estimado",
    "Mantenimiento mensual",
    "Arbitrios e impuesto predial (anual)",
    "Impuesto a la renta del alquiler",
    "Alcabala",
    "Gastos notariales y registrales",
    "Plusvalía anual estimada",
    "Tipo de cambio (opcional)",
  ]);

  await page.getByLabel("Precio de compra", { exact: true }).fill("0");
  await expect(page.locator("main").getByRole("alert").first()).toBeVisible();
  await sinValoresImposibles(page);
});

test.describe("simuladores a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hipotecario con plazo 0 no rompe la página", async ({ page }) => {
    await page.goto("/simulador-hipotecario");
    await page.getByLabel("Plazo (años)", { exact: true }).fill("0");
    await sinValoresImposibles(page);
  });
});
