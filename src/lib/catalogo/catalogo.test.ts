import { afterEach, describe, expect, it, vi } from "vitest";
import { leerConfigSupabase } from "@/lib/supabase/config";
import { aFila, aSlug, erroresPorCampo, esquemaAlt, esquemaPropiedad } from "./esquema";
import { filaAPropiedadAdmin, filasAPublicas, type FilaPropiedad } from "./mapeo";

// Datos FICTICIOS de prueba: no corresponden a ningún inmueble.
const valido = {
  codigo: "pr-001",
  titulo: "Departamento de prueba en Distrito Ficticio",
  slug: "",
  operacion: "venta",
  tipo: "departamento",
  distrito: "Distrito Ficticio",
  precio: "150 000",
  areaConstruidaM2: "85,5",
  areaTotalM2: "",
  dormitorios: "2",
  banos: "2",
  cocheras: "1",
  descripcion: "Descripción ficticia para pruebas automáticas del administrador.",
  caracteristicas: "Ascensor\n\n  Terraza  \n",
  estado: "disponible",
  destacada: false,
};

describe("esquemaPropiedad", () => {
  it("normaliza un formulario válido", () => {
    const r = esquemaPropiedad.parse(valido);
    expect(r.codigo).toBe("PR-001");
    expect(r.precio).toBe(150000);
    expect(r.areaConstruidaM2).toBe(85.5);
    expect(r.areaTotalM2).toBeUndefined();
    expect(r.caracteristicas).toEqual(["Ascensor", "Terraza"]);
    expect(r.slug).toBe("departamento-de-prueba-en-distrito-ficticio-pr-001");
  });

  it("fija la moneda por la operación (D-28)", () => {
    expect(esquemaPropiedad.parse(valido).moneda).toBe("USD");
    expect(esquemaPropiedad.parse({ ...valido, operacion: "alquiler" }).moneda).toBe("PEN");
  });

  it("respeta el slug escrito a mano", () => {
    expect(esquemaPropiedad.parse({ ...valido, slug: "mi-slug-1" }).slug).toBe("mi-slug-1");
  });

  it.each([
    ["precio", "0", "El precio debe ser mayor que 0."],
    ["precio", "", "Escribe el precio."],
    ["precio", "abc", "El precio: escribe solo números."],
    ["dormitorios", "-1", "Los dormitorios no puede ser negativo."],
    ["dormitorios", "1.5", "Escribe los dormitorios sin decimales."],
    ["codigo", "JM 001", "Usa solo letras, números y guiones (ej. JM-001)."],
    ["slug", "Con Tildes-á", "Usa minúsculas, números y guiones, sin tildes ni espacios."],
    ["titulo", "abc", "El título debe tener al menos 5 caracteres."],
    ["descripcion", "corta", "La descripción debe tener al menos 20 caracteres."],
    ["operacion", "permuta", "Elige si es venta o alquiler."],
  ])("rechaza %s = %j con un mensaje claro", (campo, valor, mensaje) => {
    const r = esquemaPropiedad.safeParse({ ...valido, [campo]: valor });
    expect(r.success).toBe(false);
    if (!r.success) expect(erroresPorCampo(r.error)[campo as keyof typeof valido]).toBe(mensaje);
  });

  it("convierte a columnas de la tabla", () => {
    const fila = aFila(esquemaPropiedad.parse(valido));
    expect(fila).toMatchObject({ codigo: "PR-001", area_construida_m2: 85.5, area_total_m2: null, moneda: "USD" });
  });
});

describe("aSlug", () => {
  it("quita tildes, eñes y signos", () => {
    expect(aSlug("Casa en Ñaña, ¡Chaclacayo!")).toBe("casa-en-nana-chaclacayo");
  });
});

describe("esquemaAlt", () => {
  it("exige describir la foto", () => {
    expect(esquemaAlt.safeParse("  ").success).toBe(false);
    expect(esquemaAlt.safeParse("Sala con ventanal").success).toBe(true);
  });
});

const fila = (cambios: Partial<FilaPropiedad> = {}): FilaPropiedad => ({
  id: "00000000-0000-4000-8000-000000000001",
  codigo: "PR-001",
  slug: "prueba",
  titulo: "Propiedad de prueba",
  operacion: "venta",
  tipo: "casa",
  distrito: "Distrito Ficticio",
  precio: "250000.00",
  moneda: "USD",
  area_construida_m2: "120.50",
  area_total_m2: null,
  dormitorios: 3,
  banos: 2,
  cocheras: 1,
  descripcion: "Descripción ficticia para pruebas.",
  caracteristicas: null,
  estado: "disponible",
  destacada: false,
  visibilidad: "publicada",
  publicada_en: "2026-10-31T00:00:00Z",
  creada_en: "2026-10-31T00:00:00Z",
  actualizada_en: "2026-10-31T00:00:00Z",
  fotos_propiedad: [
    { id: "b", propiedad_id: "x", ruta: "p/2.webp", alt: "Segunda", orden: 2, ancho: 10, alto: 10 },
    { id: "a", propiedad_id: "x", ruta: "p/1.webp", alt: "Portada", orden: 1, ancho: 10, alto: 10 },
  ],
  ...cambios,
});

describe("mapeo de filas", () => {
  it("convierte numeric de texto a número y ordena las fotos", () => {
    const p = filaAPropiedadAdmin(fila(), "https://proyecto.supabase.co");
    expect(p.precio).toBe(250000);
    expect(p.areaConstruidaM2).toBe(120.5);
    expect(p.areaTotalM2).toBeUndefined();
    expect(p.caracteristicas).toEqual([]);
    expect(p.fotos.map((f) => f.alt)).toEqual(["Portada", "Segunda"]);
    expect(p.fotos[0].url).toBe("https://proyecto.supabase.co/storage/v1/object/public/propiedades/p/1.webp");
  });

  it("al público solo llegan las publicadas con fotos", () => {
    const publicas = filasAPublicas(
      [
        fila(),
        fila({ id: "2", slug: "borrador", visibilidad: "borrador" }),
        fila({ id: "3", slug: "sin-fotos", fotos_propiedad: [] }),
      ],
      "https://proyecto.supabase.co"
    );
    expect(publicas.map((p) => p.slug)).toEqual(["prueba"]);
    expect(publicas[0]).not.toHaveProperty("uuid");
    expect(publicas[0]).not.toHaveProperty("visibilidad");
  });
});

describe("leerConfigSupabase", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("solo acepta una URL https y una clave", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proyecto.supabase.co/");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "clave-de-prueba");
    expect(leerConfigSupabase()).toEqual({ url: "https://proyecto.supabase.co", clave: "clave-de-prueba" });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "sin-supabase");
    expect(leerConfigSupabase()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://proyecto.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
    expect(leerConfigSupabase()).toBeNull();
  });
});
