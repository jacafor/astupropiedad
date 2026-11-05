import { autorizado, pingProyecto, proyectosAPing } from "@/lib/mantener-activo";

/**
 * Cron diario de Vercel (`vercel.json`): consulta los proyectos de Supabase para que el plan
 * gratuito no los pause (P-16). Solo responde a Vercel (CRON_SECRET). Devuelve 502 si alguno
 * falla, para que se vea en los registros del cron.
 */
export const GET = async (request: Request) => {
  if (!autorizado(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const resultados = await Promise.all(proyectosAPing().map((p) => pingProyecto(p)));
  const ok = resultados.length > 0 && resultados.every((r) => r.ok);
  console.log(`[mantener-activo] ${resultados.map((r) => `${r.nombre}=${r.estado ?? "sin respuesta"}`).join(" ") || "sin proyectos"}`);
  return Response.json({ ok, resultados }, { status: ok ? 200 : 502, headers: { "Cache-Control": "no-store" } });
};
