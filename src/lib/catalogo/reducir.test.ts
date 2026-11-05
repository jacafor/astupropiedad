import { describe, expect, it } from "vitest";
import { medidasReducidas, nombreJpg, reducirSiPesa } from "./reducir";

describe("medidasReducidas", () => {
  it("lleva el lado mayor al máximo y conserva la proporción", () => {
    expect(medidasReducidas(4000, 2252, 2000)).toEqual({ ancho: 2000, alto: 1126 });
    expect(medidasReducidas(2252, 4000, 2000)).toEqual({ ancho: 1126, alto: 2000 });
  });
  it("no agranda fotos que ya caben", () => {
    expect(medidasReducidas(1200, 900, 2000)).toEqual({ ancho: 1200, alto: 900 });
  });
  it("nunca devuelve un lado en cero", () => {
    expect(medidasReducidas(10000, 1, 2000)).toEqual({ ancho: 2000, alto: 1 });
  });
});

describe("nombreJpg", () => {
  it("cambia la extensión a .jpg", () => {
    expect(nombreJpg("20260313_164900.png")).toBe("20260313_164900.jpg");
    expect(nombreJpg("sala.final.webp")).toBe("sala.final.jpg");
    expect(nombreJpg("sin-extension")).toBe("sin-extension.jpg");
  });
});

describe("reducirSiPesa", () => {
  it("devuelve el mismo archivo si ya cabe en el límite", async () => {
    const archivo = new File([new Uint8Array(10)], "foto.jpg", { type: "image/jpeg" });
    expect(await reducirSiPesa(archivo, 100, 2000)).toBe(archivo);
  });
});
