import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// El build de e2e lleva IDs de PRUEBA (playwright.config.ts). Las peticiones a Google, Meta y
// WhatsApp se interceptan y se responden en local: nada sale de la máquina. Aun así quedan
// registradas, que es lo que se comprueba ("¿se pidió algo a google/facebook?").
// Datos de formulario ficticios; nunca datos de clientes.

const TERCEROS = /googletagmanager\.com|google-analytics\.com|facebook\.(net|com)|wa\.me/;
const ANALITICA = /googletagmanager\.com|google-analytics\.com|facebook\.(net|com)/;

// Estas pruebas empiezan sin decisión guardada (el resto del proyecto arranca con "rechazado").
test.use({ storageState: { cookies: [], origins: [] } });

const interceptar = async (context: BrowserContext) => {
  const pedidas: string[] = [];
  await context.route(TERCEROS, (ruta) => {
    pedidas.push(ruta.request().url());
    return ruta.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return () => pedidas.filter((u) => ANALITICA.test(u));
};

const banner = (page: Page) => page.getByRole("region", { name: "Tu privacidad, tu decisión" });

/** Eventos registrados: GA4 (dataLayer) y Meta (cola de fbq; el script real está interceptado). */
const eventos = (page: Page) =>
  page.evaluate(() => {
    const ga = (window.dataLayer ?? [])
      .map((e) => Array.from(e as ArrayLike<unknown>))
      .filter((a) => a[0] === "event")
      .map((a) => ({ nombre: a[1] as string, params: a[2] }));
    const cola = ((window.fbq as unknown as { queue?: ArrayLike<unknown>[] })?.queue ?? []).map((a) => Array.from(a));
    const meta = cola.filter((a) => a[0] === "track" || a[0] === "trackCustom").map((a) => a[1] as string);
    return { ga, meta, crudo: JSON.stringify({ ga, cola }) };
  });

const cuantos = async (page: Page, nombre: string) => (await eventos(page)).ga.filter((e) => e.nombre === nombre).length;

test("sin decisión: banner visible y ninguna petición a Google ni Meta", async ({ page, context }) => {
  const analitica = await interceptar(context);
  await page.goto("/");
  await expect(banner(page)).toBeVisible();
  await page.waitForTimeout(1500);
  expect(analitica()).toEqual([]);
  expect(await page.evaluate(() => typeof window.gtag)).toBe("undefined");
});

test("rechazar: no carga nada y la decisión persiste al recargar", async ({ page, context }) => {
  const analitica = await interceptar(context);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Rechazar" }).click();
  await expect(banner(page)).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(1500);
  await expect(banner(page)).toHaveCount(0);
  expect(analitica()).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("astp-consentimiento-cookies"))).toBe("rechazado");
});

test("aceptar: carga GA4 y el píxel de Meta, y persiste al recargar", async ({ page, context }) => {
  const analitica = await interceptar(context);
  await page.goto("/");
  await banner(page).getByRole("button", { name: "Aceptar" }).click();
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => analitica().some((u) => u.includes("googletagmanager.com/gtag/js?id=G-"))).toBe(true);
  await expect.poll(() => analitica().some((u) => u.includes("connect.facebook.net"))).toBe(true);
  await page.reload();
  await expect(banner(page)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe("function");
});

test.describe("con cookies aceptadas", () => {
  test.beforeEach(async ({ page, context }) => {
    await interceptar(context);
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Aceptar" }).click();
    await expect.poll(() => page.evaluate(() => typeof window.gtag)).toBe("function");
  });

  test("clic en WhatsApp: un evento con su origen", async ({ page }) => {
    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: /Escribir por WhatsApp/ }).click();
    await (await popup).close();
    const { ga, meta } = await eventos(page);
    const clics = ga.filter((e) => e.nombre === "cta_whatsapp_click");
    expect(clics).toHaveLength(1);
    expect(clics[0].params).toMatchObject({ origen: "boton-flotante", pagina: "/" });
    expect(meta.filter((n) => n === "Contact")).toHaveLength(1);
  });

  test("simulador: un evento por cálculo, no por tecla", async ({ page }) => {
    await page.goto("/simulador-hipotecario");
    await page.waitForTimeout(2000);
    expect(await cuantos(page, "simulador_calculado")).toBe(0); // los valores iniciales no cuentan
    await page.getByLabel("Monto del préstamo", { exact: true }).pressSequentially("5", { delay: 50 });
    await page.getByLabel("Monto del préstamo", { exact: true }).pressSequentially("0", { delay: 50 });
    await expect.poll(() => cuantos(page, "simulador_calculado"), { timeout: 5000 }).toBe(1);
    await page.waitForTimeout(2000);
    expect(await cuantos(page, "simulador_calculado")).toBe(1);
  });

  test("formulario: error y envío, una vez cada uno y sin datos personales", async ({ page }) => {
    await page.goto("/vender");
    await page.getByRole("button", { name: "Departamento" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByLabel("¿Dónde está ubicado?").fill("Distrito de prueba");
    await page.getByRole("button", { name: "Último paso" }).click();
    const enviar = page.getByRole("button", { name: "Enviar datos para la valoración" });

    await page.getByLabel("Nombre completo").fill("Prueba E2E");
    await enviar.click();
    await expect(page.locator("form").getByRole("alert")).toBeVisible();
    await expect.poll(() => cuantos(page, "formulario_error")).toBe(1);

    await page.getByLabel("Celular").fill("987654321");
    await page.getByLabel("Correo").fill("prueba@example.com");
    await page.getByRole("checkbox", { name: /Acepto que AS Tupropiedad/ }).check();
    await enviar.click();
    await expect(page.getByText("Recibimos tu solicitud")).toBeVisible();
    await expect.poll(() => cuantos(page, "lead_enviado")).toBe(1);

    const { ga, meta, crudo } = await eventos(page);
    expect(ga.find((e) => e.nombre === "lead_enviado")?.params).toEqual({ origen: "vender:valoracion", interes: "vender" });
    expect(ga.filter((e) => e.nombre === "formulario_error")).toHaveLength(1);
    expect(meta.filter((n) => n === "Lead")).toHaveLength(1);
    for (const personal of ["Prueba E2E", "987654321", "prueba@example.com"]) expect(crudo).not.toContain(personal);
  });

  test("Preferencias de cookies reabre el banner y rechazar detiene los eventos", async ({ page }) => {
    const preferencias = page.getByRole("button", { name: "Preferencias de cookies" });
    await preferencias.click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("heading")).toBeFocused();
    await expect(banner(page)).toContainText("aceptadas");
    await banner(page).getByRole("button", { name: "Rechazar" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect(preferencias).toBeFocused();

    const popup = page.waitForEvent("popup");
    await page.getByRole("link", { name: /Escribir por WhatsApp/ }).click();
    await (await popup).close();
    expect(await cuantos(page, "cta_whatsapp_click")).toBe(0);
  });
});

test.describe("banner a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("botones visibles, del mismo tamaño y alcanzables con teclado", async ({ page, context }) => {
    await interceptar(context);
    await page.goto("/");
    const rechazar = banner(page).getByRole("button", { name: "Rechazar" });
    const aceptar = banner(page).getByRole("button", { name: "Aceptar" });
    await expect(rechazar).toBeInViewport();
    await expect(aceptar).toBeInViewport();
    const [r, a] = [await rechazar.boundingBox(), await aceptar.boundingBox()];
    expect(r?.width).toBeCloseTo(a?.width ?? 0, 0);
    expect(r?.height).toBeCloseTo(a?.height ?? 0, 0);
    expect(r?.height ?? 0).toBeGreaterThanOrEqual(44);

    // El banner va justo después de "Saltar al contenido": es lo primero que se alcanza con Tab.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(banner(page).getByRole("link", { name: "Más información" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(rechazar).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(aceptar).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(banner(page)).toHaveCount(0);
  });
});
