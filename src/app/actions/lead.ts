"use server";

import { after } from "next/server";
import { construirPayload, leadSchema } from "@/lib/leads";
import type { CampoLead, ResultadoLead } from "@/lib/lead-tipos";

const TIMEOUT_MS = 8000;

/** Lee un campo JSON del formulario; si viene roto o no es un objeto, lo ignora. */
const leerJson = (valor: FormDataEntryValue | null): unknown => {
  if (typeof valor !== "string" || valor === "") return undefined;
  try {
    const parsed: unknown = JSON.parse(valor);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const texto = (valor: FormDataEntryValue | null): string => (typeof valor === "string" ? valor : "");

/** Métrica sin datos personales (el proveedor de analítica llega en la sesión 13). */
const registrarMetrica = (evento: "lead_enviado" | "lead_error", props: Record<string, string>) => {
  after(() => {
    console.info(`[metrica] ${evento}`, JSON.stringify(props));
  });
};

/**
 * Recibe un lead: honeypot → validación (zod) → POST al webhook de GoHighLevel.
 * Nunca registra la URL del webhook ni datos personales.
 */
export async function enviarLead(
  _estadoPrevio: ResultadoLead | null,
  formData: FormData
): Promise<ResultadoLead> {
  // Honeypot: un campo que las personas no ven. Si viene relleno es un bot; se descarta sin avisarle.
  if (texto(formData.get("sitio_web")).trim() !== "") {
    return { ok: true };
  }

  const analisis = leadSchema.safeParse({
    nombre: texto(formData.get("nombre")),
    celular: texto(formData.get("celular")),
    correo: texto(formData.get("correo")),
    interes: texto(formData.get("interes")),
    origen: texto(formData.get("origen")),
    pagina: texto(formData.get("pagina")),
    consentimiento: formData.get("consentimiento") === "on",
    contexto: leerJson(formData.get("contexto")),
    utm: leerJson(formData.get("utm")),
  });

  if (!analisis.success) {
    const errores: Partial<Record<CampoLead, string>> = {};
    for (const issue of analisis.error.issues) {
      const clave = issue.path[0];
      const campo: CampoLead =
        clave === "nombre" || clave === "celular" || clave === "correo" || clave === "consentimiento"
          ? clave
          : "general";
      errores[campo] ??= issue.message;
    }
    const origen = texto(formData.get("origen")).slice(0, 80);
    registrarMetrica("lead_error", { origen, motivo: "validacion" });
    return {
      ok: false,
      motivo: "validacion",
      mensaje: "Revisa los campos marcados y vuelve a enviar.",
      errores,
    };
  }

  const lead = analisis.data;
  const webhook = process.env.GHL_WEBHOOK_URL?.trim();

  if (!webhook) {
    registrarMetrica("lead_error", { origen: lead.origen, motivo: "no-configurado" });
    return {
      ok: false,
      motivo: "no-configurado",
      mensaje:
        "Por ahora no podemos recibir tu solicitud desde esta página. Escríbenos por WhatsApp con tus datos y te atendemos por ahí.",
      errores: {},
    };
  }

  const idEnvio = texto(formData.get("id_envio")).slice(0, 64) || crypto.randomUUID();

  try {
    const respuesta = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(construirPayload(lead, idEnvio)),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!respuesta.ok) {
      console.error(`[lead] el webhook respondió con estado ${respuesta.status}`);
      registrarMetrica("lead_error", { origen: lead.origen, motivo: `http-${respuesta.status}` });
      return servicioCaido();
    }
  } catch (error) {
    // Solo el tipo de error: el mensaje de fetch puede incluir la URL.
    console.error(`[lead] no se pudo contactar el webhook (${error instanceof Error ? error.name : "error"})`);
    registrarMetrica("lead_error", { origen: lead.origen, motivo: "red" });
    return servicioCaido();
  }

  registrarMetrica("lead_enviado", { origen: lead.origen, interes: lead.interes });
  return { ok: true };
}

const servicioCaido = (): ResultadoLead => ({
  ok: false,
  motivo: "servicio",
  mensaje:
    "No pudimos enviar tu solicitud. No se perdió lo que escribiste: inténtalo de nuevo o escríbenos por WhatsApp.",
  errores: {},
});
