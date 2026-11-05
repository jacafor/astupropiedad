import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { FotoInvalida, LADO_MAXIMO, procesarFoto, reordenar } from "./fotos";

const imagen = (ancho: number, alto: number, formato: "jpeg" | "png" | "gif") =>
  sharp({ create: { width: ancho, height: alto, channels: 3, background: { r: 1, g: 72, b: 152 } } })
    .toFormat(formato)
    .toBuffer();

describe("procesarFoto", () => {
  it("convierte a WebP y reduce el lado mayor", async () => {
    const r = await procesarFoto(await imagen(3000, 1500, "jpeg"));
    expect((await sharp(r.datos).metadata()).format).toBe("webp");
    expect(r.ancho).toBe(LADO_MAXIMO);
    expect(r.alto).toBe(1000);
  });

  it("no agranda fotos pequeñas", async () => {
    const r = await procesarFoto(await imagen(800, 600, "png"));
    expect([r.ancho, r.alto]).toEqual([800, 600]);
  });

  it("quita los metadatos", async () => {
    const conExif = await sharp(await imagen(100, 100, "jpeg"))
      .withExif({ IFD0: { Copyright: "dato-de-prueba" } })
      .toBuffer();
    const r = await procesarFoto(conExif);
    expect((await sharp(r.datos).metadata()).exif).toBeUndefined();
  });

  it("acepta JPG de celular con avisos menores del decodificador", async () => {
    // Bytes sobrantes antes de un marcador: libjpeg avisa ("extraneous bytes") pero la foto se ve bien.
    const jpg = await imagen(64, 48, "jpeg");
    const i = jpg.indexOf(Buffer.from([0xff, 0xdb]));
    const conAviso = Buffer.concat([jpg.subarray(0, i), Buffer.from([0x12, 0x34, 0x56]), jpg.subarray(i)]);
    const r = await procesarFoto(conAviso);
    expect([r.ancho, r.alto]).toEqual([64, 48]);
  });

  it("rechaza con un mensaje claro una foto cortada", async () => {
    const jpg = await imagen(400, 300, "jpeg");
    await expect(procesarFoto(jpg.subarray(0, Math.floor(jpg.length * 0.6)))).rejects.toBeInstanceOf(FotoInvalida);
  });

  it("rechaza formatos no admitidos y archivos que no son imagen", async () => {
    await expect(procesarFoto(await imagen(10, 10, "gif"))).rejects.toBeInstanceOf(FotoInvalida);
    await expect(procesarFoto(Buffer.from("no soy una imagen"))).rejects.toBeInstanceOf(FotoInvalida);
  });
});

describe("reordenar", () => {
  const ids = ["a", "b", "c"];
  it("sube, baja y hace portada", () => {
    expect(reordenar(ids, "b", "arriba")).toEqual(["b", "a", "c"]);
    expect(reordenar(ids, "b", "abajo")).toEqual(["a", "c", "b"]);
    expect(reordenar(ids, "c", "portada")).toEqual(["c", "a", "b"]);
  });
  it("no se sale de los extremos ni inventa fotos", () => {
    expect(reordenar(ids, "a", "arriba")).toEqual(ids);
    expect(reordenar(ids, "c", "abajo")).toEqual(ids);
    expect(reordenar(ids, "z", "portada")).toEqual(ids);
  });
});
