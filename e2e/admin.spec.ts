import sharp from "sharp";
import { expect, test, type Page } from "@playwright/test";

/**
 * Administrador de propiedades (/admin, sesión 16).
 *
 * 1. Sin Supabase (lo normal en estas pruebas): /admin avisa que no está conectado, no se indexa
 *    y no muestra nada del sitio público.
 * 2. Flujo completo SOLO contra el proyecto de Supabase de PRUEBAS, nunca el del sitio: hace falta
 *    exportar E2E_SUPABASE_URL, E2E_SUPABASE_PUBLISHABLE_KEY, E2E_ADMIN_CORREO y E2E_ADMIN_CLAVE
 *    (ver docs/PRUEBAS.md). Sin ellas, esa parte se salta. Datos ficticios; las propiedades de
 *    prueba quedan archivadas en el proyecto de pruebas.
 */

const conSupabase = Boolean(process.env.E2E_SUPABASE_URL && process.env.E2E_ADMIN_CORREO && process.env.E2E_ADMIN_CLAVE);

test.describe("sin Supabase configurado", () => {
  test.skip(conSupabase, "Estas pruebas son para el build sin base de datos");

  test("/admin lleva al ingreso, avisa que no está conectado y no se indexa", async ({ page }) => {
    const respuesta = await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/ingresar$/);
    expect(respuesta?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    await expect(page.getByRole("heading", { level: 1, name: "El administrador aún no está conectado" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    // Nada del sitio público: ni barra, ni pie, ni WhatsApp flotante.
    await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.getByRole("complementary", { name: "Contacto por WhatsApp" })).toHaveCount(0);
  });

  test("el catálogo muestra su estado vacío honesto", async ({ page }) => {
    await page.goto("/propiedades");
    await expect(page.locator("main")).not.toContainText("EJEMPLO");
  });
});

test("el sitemap no anuncia /admin", async ({ request }) => {
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin");
});

// ───────────────────────── Flujo completo (proyecto de pruebas) ─────────────────────────

const fotoDePrueba = async (color: { r: number; g: number; b: number }) =>
  sharp({ create: { width: 1200, height: 900, channels: 3, background: color } }).jpeg().toBuffer();

const ingresar = async (page: Page) => {
  await page.goto("/admin/ingresar");
  await page.getByLabel("Correo").fill(process.env.E2E_ADMIN_CORREO ?? "");
  await page.getByLabel("Contraseña").fill(process.env.E2E_ADMIN_CLAVE ?? "");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Propiedades" })).toBeVisible();
};

const subirFoto = async (page: Page, alt: string, color: { r: number; g: number; b: number }) => {
  await page.getByLabel("Archivo (JPG, PNG o WebP, hasta 4 MB)").setInputFiles({
    name: "foto-prueba.jpg",
    mimeType: "image/jpeg",
    buffer: await fotoDePrueba(color),
  });
  await page.getByLabel("Descripción de la foto", { exact: true }).fill(alt);
  await page.getByRole("checkbox", { name: /no muestra teléfonos/ }).check();
  await page.getByRole("button", { name: "Subir foto" }).click();
};

test.describe("flujo completo contra el Supabase de pruebas", () => {
  test.skip(!conSupabase, "Faltan E2E_SUPABASE_URL, E2E_ADMIN_CORREO o E2E_ADMIN_CLAVE");
  test.describe.configure({ mode: "serial" });

  test("credenciales erróneas muestran un error claro", async ({ page }) => {
    await page.goto("/admin/ingresar");
    await page.getByLabel("Correo").fill("no-existe@ejemplo.com");
    await page.getByLabel("Contraseña").fill("clave-incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByRole("alert")).toContainText("Correo o contraseña incorrectos");
  });

  test("crear, subir fotos, publicar, editar, reordenar y archivar", async ({ page }) => {
    test.setTimeout(120_000);
    const codigo = `E2E-${Date.now()}`;
    const titulo = `Prueba E2E ${codigo}`;
    await ingresar(page);

    // Crear: primero con errores (no se pierde lo escrito), luego bien.
    await page.getByRole("link", { name: "Nueva propiedad" }).first().click();
    await page.getByLabel("Código de referencia").fill(codigo);
    await page.getByLabel("Título").fill(titulo);
    await page.getByLabel("Precio (USD)").fill("0");
    await page.getByRole("button", { name: "Crear propiedad" }).click();
    await expect(page.getByText("El precio debe ser mayor que 0.")).toBeVisible();
    await expect(page.getByLabel("Título")).toHaveValue(titulo);

    await page.getByLabel("Distrito").fill("Distrito Ficticio");
    await page.getByLabel("Precio (USD)").fill("123456");
    await page.getByLabel("Área construida (m²)").fill("90");
    await page.getByLabel("Dormitorios").fill("2");
    await page.getByLabel("Baños").fill("2");
    await page.getByLabel("Cocheras").fill("1");
    await page.getByLabel("Descripción", { exact: true }).fill("Propiedad ficticia creada por las pruebas automáticas.");
    await page.getByRole("button", { name: "Crear propiedad" }).click();
    await expect(page.getByText("Paso 2 de 2")).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar" })).toBeDisabled();

    // Fotos: la primera es la portada; la segunda pasa a portada.
    await subirFoto(page, "Foto azul de prueba", { r: 1, g: 72, b: 152 });
    await expect(page.getByText("Foto subida. Es la portada")).toBeVisible();
    await subirFoto(page, "Foto verde de prueba", { r: 124, g: 192, b: 75 });
    await expect(page.getByText("Foto subida al final")).toBeVisible();
    await page.getByRole("button", { name: "Hacer portada" }).click();
    await expect(page.getByText("Nueva portada guardada.")).toBeVisible();
    await expect(page.getByLabel("Descripción de la foto 1")).toHaveValue("Foto verde de prueba");

    // Publicar → aparece en el catálogo y su ficha responde.
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Publicada: ya aparece en el sitio.")).toBeVisible();
    const slug = await page.getByLabel("Dirección web").inputValue();
    await page.goto("/propiedades");
    await expect(page.getByRole("link", { name: titulo })).toBeVisible();
    await page.goto(`/propiedades/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
    await expect(page.locator("main")).toContainText(/123[.,\s  ]?456/);

    // Editar el precio → el sitio muestra el nuevo.
    await page.goBack();
    await page.goto("/admin");
    await page.getByRole("link", { name: `Editar ${titulo}` }).click();
    // Reservar desde el panel y luego editar: guardar el formulario no debe devolverla a "Disponible".
    await page.getByRole("button", { name: "Reservado" }).click();
    await expect(page.getByText("Estado actualizado.")).toBeVisible();
    await page.getByLabel("Precio (USD)").fill("120000");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Cambios guardados")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Reservado" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Dirección web")).toHaveAttribute("readonly", "");
    await page.goto(`/propiedades/${slug}`);
    await expect(page.locator("main")).toContainText(/120[.,\s  ]?000/);

    // Archivar → la ficha da 404.
    await page.goto("/admin");
    await page.getByRole("link", { name: `Editar ${titulo}` }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Archivar" }).click();
    await expect(page.getByText("Archivada: ya no aparece en el sitio.")).toBeVisible();
    expect((await page.request.get(`/propiedades/${slug}`)).status()).toBe(404);
  });
});

test.describe("a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.skip(conSupabase, "Sin Supabase basta con la pantalla de aviso");

  test("la pantalla de ingreso no se desborda", async ({ page }) => {
    await page.goto("/admin/ingresar");
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(390);
  });
});
