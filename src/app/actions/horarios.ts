"use server";

import { crearClienteGhl, describir, leerConfigGhl } from "@/lib/ghl";
import type { DiaHorarios } from "@/lib/horarios";

export type ResultadoHorarios =
  | { ok: true; dias: DiaHorarios[] }
  | { ok: false; motivo: "no-configurado" | "servicio" };

/**
 * Horarios libres del calendario de llamadas de GHL para los próximos días, en hora de Lima.
 * El token se queda en el servidor: al navegador solo llegan fechas ISO.
 */
export async function obtenerHorarios(): Promise<ResultadoHorarios> {
  const config = leerConfigGhl();
  if (!config) return { ok: false, motivo: "no-configurado" };
  try {
    return { ok: true, dias: await crearClienteGhl(config).horariosLibres() };
  } catch (error) {
    console.error(`[horarios] GHL falló (${describir(error)})`);
    return { ok: false, motivo: "servicio" };
  }
}
