"use server";

import { after } from "next/server";
import { construirPayload, leadSchema, type Lead } from "@/lib/leads";
import { ORIGENES_CON_CITA, type CampoLead, type ResultadoLead } from "@/lib/lead-tipos";
import { crearClienteGhl, describir, leerConfigGhl, registrarLead, type ConfigGhl, type ResultadoRegistro } from "@/lib/ghl";
import { horarioValido } from "@/lib/horarios";

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
 * Recibe un lead: honeypot → validación (zod) → API de GoHighLevel (contacto, oportunidad y,
 * si se pidió, cita; D-27). Sin credenciales de la API usa el webhook (D-18) o el plan B.
 * Nunca registra el token, URLs ni datos personales.
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

  // Cita (solo formularios que la ofrecen): si la persona la pidió, el horario debe ser uno válido.
  const conCita =
    (ORIGENES_CON_CITA as readonly string[]).includes(lead.origen) && formData.get("quiere_cita") === "on";
  const horario = conCita ? texto(formData.get("horario")).trim() : "";
  if (conCita && !horarioValido(horario)) {
    registrarMetrica("lead_error", { origen: lead.origen, motivo: "validacion" });
    return {
      ok: false,
      motivo: "validacion",
      mensaje: "Revisa los campos marcados y vuelve a enviar.",
      errores: { horario: "Elige un horario de la lista o desmarca la opción de agendar una llamada." },
    };
  }

  const idEnvio = texto(formData.get("id_envio")).slice(0, 64) || crypto.randomUUID();

  // Método vigente (D-27): API de GHL. El webhook (D-18) queda como respaldo mientras se confirma.
  const config = leerConfigGhl();
  if (config) return enviarPorApi(config, lead, idEnvio, horario || undefined);

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

/** Contacto → oportunidad → cita en GHL. Solo responde "ok" si el contacto y la oportunidad quedaron. */
const enviarPorApi = async (
  config: ConfigGhl,
  lead: Lead,
  idEnvio: string,
  horario: string | undefined
): Promise<ResultadoLead> => {
  let registro: ResultadoRegistro;
  try {
    registro = await registrarLead(crearClienteGhl(config), lead, {
      idEnvio,
      horario,
      etapaCitaId: config.etapaCitaId,
    });
  } catch (error) {
    // Solo paso y estado: ni la URL, ni el token, ni datos personales.
    console.error(`[lead] GHL falló (${describir(error)})`);
    registrarMetrica("lead_error", { origen: lead.origen, motivo: describir(error) });
    return servicioCaido();
  }

  for (const aviso of registro.avisos) console.warn(`[lead] paso secundario de GHL falló (${aviso})`);
  if (registro.cita.estado === "fallida") {
    console.error(`[lead] el lead quedó pero la cita no (${registro.cita.motivo})`);
  }
  registrarMetrica("lead_enviado", { origen: lead.origen, interes: lead.interes, cita: registro.cita.estado });

  if (registro.cita.estado === "reservada") return { ok: true, cita: { estado: "reservada", horario: registro.cita.horario } };
  if (registro.cita.estado === "fallida") return { ok: true, cita: { estado: "fallida" } };
  return { ok: true };
};

const servicioCaido = (): ResultadoLead => ({
  ok: false,
  motivo: "servicio",
  mensaje:
    "No pudimos enviar tu solicitud. No se perdió lo que escribiste: inténtalo de nuevo o escríbenos por WhatsApp.",
  errores: {},
});
