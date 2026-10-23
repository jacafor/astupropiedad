import { expect, test } from "@playwright/test";

const WHATSAPP = "https://wa.me/51977588905";

test.describe("menú móvil a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("abre, navega y se cierra", async ({ page }) => {
    await page.goto("/");
    const boton = page.getByRole("button", { name: "Abrir menú" });
    await expect(boton).toBeVisible();
    await expect(page.locator("#menu-movil")).toHaveCount(0);

    await boton.click();
    const menu = page.locator("#menu-movil");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("button", { name: "Cerrar menú" }).click();
    await expect(menu).toHaveCount(0);

    // Esc también lo cierra.
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);

    // Un enlace del menú lleva a su ruta y el menú se cierra solo.
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await menu.getByRole("link", { name: "Propiedades" }).click();
    await expect(page).toHaveURL(/\/propiedades$/);
    await expect(menu).toHaveCount(0);
  });
});

test.describe("botón flotante de WhatsApp", () => {
  for (const ruta of ["/", "/propiedades", "/vender", "/simulador-hipotecario"]) {
    test(`apunta al número oficial en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      const boton = page.getByRole("link", { name: /Escribir por WhatsApp/ });
      await expect(boton).toBeVisible();
      const href = await boton.getAttribute("href");
      expect(href?.startsWith(`${WHATSAPP}?text=`)).toBe(true);
    });
  }

  test("ningún enlace de WhatsApp usa otro número", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator('a[href*="wa.me"]').evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href.startsWith(WHATSAPP)).toBe(true);
    expect(await page.content()).not.toContain("51900000000");
  });
});
