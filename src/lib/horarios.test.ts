import { describe, expect, it } from "vitest";
import { agruparHorarios, etiquetaDia, etiquetaDiaCorta, etiquetaHora, etiquetaHorario, fechaLima, horarioValido } from "./horarios";

const AHORA = new Date("2026-11-02T15:00:00Z"); // lunes 2 de noviembre, 10:00 en Lima

describe("horarios en hora de Lima", () => {
  it("fecha y hora de Lima aunque el instante venga en UTC", () => {
    expect(fechaLima("2026-11-03T03:00:00Z")).toBe("2026-11-02"); // 22:00 del día anterior en Lima
    expect(etiquetaHora("2026-11-03T03:00:00Z")).toBe("22:00");
  });

  it("etiquetas en español", () => {
    expect(etiquetaDia("2026-11-03")).toBe("martes, 3 de noviembre");
    expect(etiquetaDiaCorta("2026-11-03")).toMatch(/^Mar, 3 nov/);
    expect(etiquetaHorario("2026-11-03T10:00:00-05:00")).toBe("martes, 3 de noviembre a las 10:00 (hora de Lima)");
  });

  it("valida formato, margen y horizonte", () => {
    expect(horarioValido("2026-11-02T12:00:00-05:00", AHORA)).toBe(true);
    expect(horarioValido("2026-11-02T10:30:00-05:00", AHORA)).toBe(false); // dentro del margen
    expect(horarioValido("2026-12-30T10:00:00-05:00", AHORA)).toBe(false); // demasiado lejos
    expect(horarioValido("2026-11-03 10:00", AHORA)).toBe(false); // sin zona
    expect(horarioValido("mañana", AHORA)).toBe(false);
  });

  it("agrupa, ordena, quita repetidos y claves que no son fechas", () => {
    const dias = agruparHorarios(
      {
        "2026-11-04": { slots: ["2026-11-04T09:00:00-05:00"] },
        "2026-11-03": { slots: ["2026-11-03T11:00:00-05:00", "2026-11-03T10:00:00-05:00", "2026-11-03T10:00:00-05:00"] },
        traceId: "abc",
        "2026-11-05": { slots: "no es lista" },
      },
      AHORA
    );
    expect(dias).toEqual([
      { fecha: "2026-11-03", horarios: ["2026-11-03T10:00:00-05:00", "2026-11-03T11:00:00-05:00"] },
      { fecha: "2026-11-04", horarios: ["2026-11-04T09:00:00-05:00"] },
    ]);
    expect(agruparHorarios(null, AHORA)).toEqual([]);
  });
});
