import { expect, test } from "@playwright/test";
import { RUTAS } from "../src/lib/rutas";

// Cada ruta pública de src/lib/rutas.ts responde 200 y tiene un <title> propio.
for (const ruta of RUTAS) {
  test(`${ruta.path} responde 200 y tiene título`, async ({ page }) => {
    const respuesta = await page.goto(ruta.path);
    expect(respuesta?.status()).toBe(200);
    expect((await page.title()).trim()).not.toBe("");
    await expect(page.locator("main")).toHaveCount(1);
  });
}

test("los títulos no se repiten entre rutas", async ({ request }) => {
  const vistos = new Map<string, string>();
  for (const ruta of RUTAS) {
    const html = await (await request.get(ruta.path)).text();
    const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    expect(titulo, `${ruta.path} sin <title>`).not.toBe("");
    expect(vistos.get(titulo), `título repetido en ${ruta.path} y ${vistos.get(titulo)}`).toBeUndefined();
    vistos.set(titulo, ruta.path);
  }
});

test("robots.txt y sitemap.xml responden 200", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
});

test("una ruta inexistente responde 404", async ({ request }) => {
  expect((await request.get("/esta-ruta-no-existe")).status()).toBe(404);
});
