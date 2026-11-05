import { afterEach, describe, expect, it, vi } from "vitest";
import { autorizado, pingProyecto, proyectosAPing } from "./mantener-activo";

// URLs y claves FICTICIAS: no corresponden a ningún proyecto.
const SITIO = "https://sitio-ficticio.supabase.co";
const PRUEBAS = "https://pruebas-ficticio.supabase.co";

afterEach(() => vi.unstubAllEnvs());

describe("autorizado", () => {
  it("exige el secreto exacto", () => {
    expect(autorizado("Bearer abc", "abc")).toBe(true);
    expect(autorizado("Bearer otro", "abc")).toBe(false);
    expect(autorizado(null, "abc")).toBe(false);
  });
  it("sin secreto configurado no deja pasar a nadie", () => {
    expect(autorizado("Bearer ", "")).toBe(false);
    expect(autorizado("Bearer undefined", undefined)).toBe(false);
  });
});

describe("proyectosAPing", () => {
  it("incluye el sitio y el de pruebas si están configurados", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SITIO);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "clave-sitio");
    const p = proyectosAPing({ SUPABASE_PRUEBAS_URL: `${PRUEBAS}/`, SUPABASE_PRUEBAS_PUBLISHABLE_KEY: "clave-pruebas" });
    expect(p.map((x) => [x.nombre, x.url])).toEqual([
      ["sitio", SITIO],
      ["pruebas", PRUEBAS],
    ]);
  });
  it("no repite el proyecto si el de pruebas es el mismo del despliegue (previews)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", PRUEBAS);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "clave-pruebas");
    expect(proyectosAPing({ SUPABASE_PRUEBAS_URL: PRUEBAS, SUPABASE_PRUEBAS_PUBLISHABLE_KEY: "x" })).toHaveLength(1);
  });
  it("sin variables no consulta nada", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(proyectosAPing({})).toEqual([]);
  });
});

describe("pingProyecto", () => {
  const proyecto = { nombre: "sitio", url: SITIO, clave: "clave" };
  it("hace una lectura mínima con la clave publicable", async () => {
    const f = vi.fn(async () => new Response("[]", { status: 200 }));
    expect(await pingProyecto(proyecto, f as unknown as typeof fetch)).toEqual({ nombre: "sitio", ok: true, estado: 200 });
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`${SITIO}/rest/v1/propiedades?select=id&limit=1`);
    expect((init.headers as Record<string, string>).apikey).toBe("clave");
  });
  it("informa el fallo sin lanzar", async () => {
    const f = vi.fn(async () => {
      throw new Error("sin red");
    });
    expect(await pingProyecto(proyecto, f as unknown as typeof fetch)).toEqual({ nombre: "sitio", ok: false, estado: null });
  });
});
