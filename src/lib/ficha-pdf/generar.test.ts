import sharp from "sharp";
import { describe, expect, it } from "vitest";
import type { Property } from "@/data/properties";
import { fechaLima, fotosParaPdf, generarFichaPdf, nombreArchivoPdf } from "./generar";

// Datos ficticios de prueba (no es una propiedad real).
const base: Property = {
  id: "PRUEBA-9",
  slug: "prueba-ficha-pdf",
  titulo: "[Prueba] Departamento para la ficha PDF",
  operacion: "venta",
  tipo: "departamento",
  distrito: "Jesús María",
  precio: 250000,
  moneda: "USD",
  areaConstruidaM2: 95,
  areaTotalM2: 110,
  dormitorios: 3,
  banos: 2,
  cocheras: 1,
  descripcion: "Descripción ficticia con tildes y eñes: año, baño, señal. No es una oferta real.",
  caracteristicas: ["Ascensor", "Terraza"],
  estado: "reservado",
  fotos: [{ url: "/imagenes/portada.jpg", alt: "Foto de prueba" }],
};

describe("nombreArchivoPdf", () => {
  it("usa el código en minúsculas", () => {
    expect(nombreArchivoPdf(base)).toBe("ficha-prueba-9.pdf");
  });
});

describe("fechaLima", () => {
  it("formatea en español con la hora de Lima", () => {
    // 03:00 UTC del 6 de noviembre = 22:00 del 5 de noviembre en Lima.
    expect(fechaLima(new Date("2026-11-06T03:00:00Z"))).toBe("5 de noviembre de 2026");
  });
});

describe("fotosParaPdf", () => {
  it("convierte a JPG las fotos de /public", async () => {
    const [foto] = await fotosParaPdf(base);
    expect((await sharp(foto.datos).metadata()).format).toBe("jpeg");
  });
  it("omite la foto que no se puede leer en lugar de fallar", async () => {
    const fotos = await fotosParaPdf({ ...base, fotos: [{ url: "/imagenes/no-existe.jpg", alt: "No existe" }] });
    expect(fotos).toEqual([]);
  });
});

describe("generarFichaPdf", () => {
  it("devuelve un PDF válido, con fotos y sin ellas", async () => {
    const conFotos = await generarFichaPdf(base, "https://ejemplo.test/propiedades/prueba-ficha-pdf");
    expect(conFotos.subarray(0, 5).toString()).toBe("%PDF-");
    const sinFotos = await generarFichaPdf(base, "https://ejemplo.test/x", []);
    expect(sinFotos.subarray(0, 5).toString()).toBe("%PDF-");
    expect(conFotos.length).toBeGreaterThan(sinFotos.length);
  }, 30_000);
});

describe("una ficha corta cabe en una página", () => {
  it("con 4 fotos, área total y 6 características", async () => {
    const foto = (await fotosParaPdf(base))[0];
    const pdf = await generarFichaPdf(
      { ...base, descripcion: `${"Texto de prueba ficticio. ".repeat(12)}\n\n`, caracteristicas: ["Ascensor", "Terraza", "Cocina equipada", "Depósito", "Gimnasio", "Piscina"] },
      "https://ejemplo.test/x",
      [foto, foto, foto, foto]
    );
    const paginas = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [];
    expect(paginas).toHaveLength(1);
  }, 30_000);
});
