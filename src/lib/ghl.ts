/**
 * Cliente de la API v2 de GoHighLevel (integración privada) y registro de un lead:
 * contacto → oportunidad → (si se pidió) cita. Solo servidor.
 *
 * Endpoints, cabeceras y campos verificados el 2026-10-30 en la especificación OpenAPI oficial
 * (github.com/GoHighLevel/highlevel-api-docs, apps/contacts.json, opportunities.json, calendars.json).
 * Contrato y mapeo: docs/INTEGRACIONES.md §2. Decisión: docs/DECISIONES.md D-27.
 *
 * Reglas: cada llamada tiene un límite de 8 s y no se reintenta (una cita repetida es peor que un
 * error honesto). Los errores solo llevan el paso y el estado HTTP: nunca el token, la URL completa,
 * el cuerpo de la respuesta ni datos personales.
 */
import { ETIQUETA_INTERES, type Lead } from "./leads";
import { ORIGENES_CON_CITA } from "./lead-tipos";
import { DIAS_A_MOSTRAR, ZONA_LIMA, agruparHorarios, etiquetaHorario, type DiaHorarios } from "./horarios";

export const GHL_URL_BASE = "https://services.leadconnectorhq.com";
const VERSION_CRM = "2021-07-28"; // contactos y oportunidades
const VERSION_CALENDARIOS = "2021-04-15";
export const TIMEOUT_MS = 8000;

/**
 * IDs de campos personalizados que ya existían en la cuenta de GHL (revisados el 2026-10-30).
 * No son secretos. Si cambian en GHL, actualízalos aquí y en INTEGRACIONES §2.
 */
export const CAMPOS = {
  contactoOrigen: "3oSKMTmr29FnJLZSTlcu", // contact.origen
  contactoPagina: "gSmLxQGeevXfPLDdXUjn", // contact.source_url
  oportunidadTipoPropiedad: "V47stKT3Yv0pEvogw2K1", // opportunity.tipo_propiedad (lista)
  oportunidadHabitaciones: "xplyMUCvkI4jEjqspAod", // opportunity.habitaciones
  oportunidadComentarios: "87aOype9vhOsFxRPypmF", // opportunity.comentarios_adicionales
  oportunidadAgendoLlamada: "TbihFa1fpAPpMupFokQ1", // opportunity.agendo_llamada
} as const;

/** Opciones de la lista `opportunity.tipo_propiedad` en GHL; lo que no coincide va solo en comentarios. */
const TIPO_PROPIEDAD_GHL: Record<string, string> = {
  Casa: "Casa",
  Departamento: "Departamento",
  Terreno: "Terreno / Lote",
  Oficina: "Oficina",
};

/** Formularios que crean contacto pero no oportunidad (no son una venta). */
const ORIGENES_SIN_OPORTUNIDAD = ["home:reclutamiento"];

export type ConfigGhl = {
  token: string;
  ubicacionId: string;
  pipelineId: string;
  etapaId: string;
  calendarioId: string;
  /** Etapa a la que pasa la oportunidad si se agenda la llamada (opcional). */
  etapaCitaId?: string;
  urlBase: string;
};

const valor = (v: string | undefined) => {
  const limpio = v?.trim();
  return limpio && limpio !== "PENDIENTE" ? limpio : undefined;
};

/** Lee la configuración del entorno. `null` si falta algo (o sigue en "PENDIENTE"). */
export const leerConfigGhl = (env: Record<string, string | undefined> = process.env): ConfigGhl | null => {
  const token = valor(env.GHL_API_TOKEN);
  const ubicacionId = valor(env.GHL_LOCATION_ID);
  const pipelineId = valor(env.GHL_PIPELINE_ID);
  const etapaId = valor(env.GHL_PIPELINE_STAGE_ID);
  const calendarioId = valor(env.GHL_CALENDAR_ID);
  if (!token || !ubicacionId || !pipelineId || !etapaId || !calendarioId) return null;
  return {
    token,
    ubicacionId,
    pipelineId,
    etapaId,
    calendarioId,
    etapaCitaId: valor(env.GHL_PIPELINE_STAGE_CITA_ID),
    urlBase: (valor(env.GHL_API_BASE_URL) ?? GHL_URL_BASE).replace(/\/+$/, ""),
  };
};

export type PasoGhl = "contacto" | "etiquetas" | "nota" | "busqueda" | "oportunidad" | "horarios" | "cita" | "etapa";

/** Error de la API sin datos sensibles: qué paso falló y con qué estado (`red`, `tiempo` o HTTP). */
export class ErrorGhl extends Error {
  constructor(
    readonly paso: PasoGhl,
    readonly estado: number | "red" | "tiempo" | "respuesta"
  ) {
    super(`GHL ${paso}: ${estado}`);
    this.name = "ErrorGhl";
  }
}

type Fetch = typeof fetch;

export const crearClienteGhl = (config: ConfigGhl, fetchFn: Fetch = fetch) => {
  const llamar = async (
    paso: PasoGhl,
    metodo: "GET" | "POST" | "PUT",
    ruta: string,
    version: string,
    cuerpo?: unknown
  ): Promise<unknown> => {
    let respuesta: Response;
    try {
      respuesta = await fetchFn(`${config.urlBase}${ruta}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${config.token}`,
          Version: version,
          Accept: "application/json",
          ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      const nombre = error instanceof Error ? error.name : "";
      throw new ErrorGhl(paso, nombre === "TimeoutError" || nombre === "AbortError" ? "tiempo" : "red");
    }
    if (!respuesta.ok) throw new ErrorGhl(paso, respuesta.status);
    try {
      return await respuesta.json();
    } catch {
      return {};
    }
  };

  return {
    /** `POST /contacts/upsert`: crea o actualiza según la regla de duplicados de la ubicación. */
    async upsertContacto(cuerpo: Record<string, unknown>): Promise<string> {
      const r = (await llamar("contacto", "POST", "/contacts/upsert", VERSION_CRM, {
        ...cuerpo,
        locationId: config.ubicacionId,
      })) as { contact?: { id?: unknown } };
      const id = r?.contact?.id;
      if (typeof id !== "string" || !id) throw new ErrorGhl("contacto", "respuesta");
      return id;
    },

    /** `POST /contacts/{id}/tags`: añade etiquetas sin borrar las que ya tenga (el upsert las reemplazaría). */
    async agregarEtiquetas(contactoId: string, etiquetas: string[]): Promise<void> {
      await llamar("etiquetas", "POST", `/contacts/${encodeURIComponent(contactoId)}/tags`, VERSION_CRM, {
        tags: etiquetas,
      });
    },

    /** `POST /contacts/{id}/notes`. */
    async agregarNota(contactoId: string, texto: string): Promise<void> {
      await llamar("nota", "POST", `/contacts/${encodeURIComponent(contactoId)}/notes`, VERSION_CRM, {
        body: texto,
      });
    },

    /** `GET /opportunities/search`: oportunidad abierta del contacto en el pipeline, si existe. */
    async buscarOportunidadAbierta(contactoId: string): Promise<string | null> {
      const q = new URLSearchParams({
        location_id: config.ubicacionId,
        contact_id: contactoId,
        pipeline_id: config.pipelineId,
        status: "open",
        limit: "1",
      });
      const r = (await llamar("busqueda", "GET", `/opportunities/search?${q}`, VERSION_CRM)) as {
        opportunities?: { id?: unknown }[];
      };
      const id = r?.opportunities?.[0]?.id;
      return typeof id === "string" && id ? id : null;
    },

    /** `POST /opportunities/`. */
    async crearOportunidad(cuerpo: Record<string, unknown>): Promise<string> {
      const r = (await llamar("oportunidad", "POST", "/opportunities/", VERSION_CRM, {
        ...cuerpo,
        locationId: config.ubicacionId,
        pipelineId: config.pipelineId,
        pipelineStageId: config.etapaId,
        status: "open",
      })) as { opportunity?: { id?: unknown } };
      const id = r?.opportunity?.id;
      if (typeof id !== "string" || !id) throw new ErrorGhl("oportunidad", "respuesta");
      return id;
    },

    /** `PUT /opportunities/{id}`. */
    async actualizarOportunidad(id: string, cuerpo: Record<string, unknown>): Promise<void> {
      await llamar("etapa", "PUT", `/opportunities/${encodeURIComponent(id)}`, VERSION_CRM, cuerpo);
    },

    /** `GET /calendars/{id}/free-slots` en hora de Lima, desde ahora hasta `DIAS_A_MOSTRAR` días. */
    async horariosLibres(ahora: Date = new Date()): Promise<DiaHorarios[]> {
      const q = new URLSearchParams({
        startDate: String(ahora.getTime()),
        endDate: String(ahora.getTime() + DIAS_A_MOSTRAR * 86_400_000),
        timezone: ZONA_LIMA,
      });
      const r = await llamar(
        "horarios",
        "GET",
        `/calendars/${encodeURIComponent(config.calendarioId)}/free-slots?${q}`,
        VERSION_CALENDARIOS
      );
      return agruparHorarios(r, ahora);
    },

    /** `POST /calendars/events/appointments`. La API rechaza horarios que ya no están libres. */
    async crearCita(contactoId: string, inicio: string, titulo: string): Promise<string> {
      const r = (await llamar("cita", "POST", "/calendars/events/appointments", VERSION_CALENDARIOS, {
        calendarId: config.calendarioId,
        locationId: config.ubicacionId,
        contactId: contactoId,
        startTime: inicio,
        title: titulo,
        appointmentStatus: "confirmed",
      })) as { id?: unknown };
      if (typeof r?.id !== "string" || !r.id) throw new ErrorGhl("cita", "respuesta");
      return r.id;
    },
  };
};

export type ClienteGhl = ReturnType<typeof crearClienteGhl>;

// --- Mapeo del lead (funciones puras) ------------------------------------------------------

/** Separa "Ana María Pérez" en nombre ("Ana") y apellidos ("María Pérez"). */
export const separarNombre = (nombre: string) => {
  const [primero, ...resto] = nombre.trim().split(/\s+/);
  return { firstName: primero ?? "", lastName: resto.join(" ") };
};

export const etiquetasLead = (lead: Lead) => ["web-astupropiedad", `interes:${lead.interes}`, `origen:${lead.origen}`];

/** Cuerpo del upsert: solo campos estándar y los personalizados que no pisan trabajo del asesor. */
export const cuerpoContacto = (lead: Lead) => ({
  ...separarNombre(lead.nombre),
  phone: lead.celular,
  ...(lead.correo ? { email: lead.correo } : {}), // sin correo no se envía: no se borra el que ya tenga
  source: "Web AS Tupropiedad",
  customFields: [
    { id: CAMPOS.contactoOrigen, field_value: lead.origen },
    { id: CAMPOS.contactoPagina, field_value: lead.pagina },
  ],
});

const formatoNumero = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });

/** Resumen legible de la solicitud: va en la nota del contacto y en los comentarios de la oportunidad. */
export const resumenLead = (lead: Lead, idEnvio: string, fechaConsentimiento: string, horario?: string) => {
  const c = lead.contexto ?? {};
  const u = lead.utm ?? {};
  const n = (v?: number) => (v === undefined ? undefined : formatoNumero.format(v));
  const datos: [string, string | undefined][] = [
    ["Tipo de propiedad", c.tipoPropiedad],
    ["Distrito", c.distrito],
    ["Área", c.areaM2 === undefined ? undefined : `${n(c.areaM2)} m²`],
    ["Habitaciones", n(c.habitaciones)],
    ["Monto del préstamo", n(c.montoPrestamo)],
    ["Plazo", c.plazoAnios === undefined ? undefined : `${n(c.plazoAnios)} años`],
    ["TEA", c.tea === undefined ? undefined : `${n(c.tea)} %`],
    ["Cuota estimada", n(c.cuota)],
    ["Precio del inmueble", n(c.precio)],
    ["Alquiler mensual", n(c.alquilerMensual)],
    ["Rentabilidad neta", c.capRateNeto === undefined ? undefined : `${n(c.capRateNeto)} %`],
    ["Propiedad", c.propiedadId],
  ];
  const utm = Object.entries(u)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  const montos = c.montoPrestamo || c.cuota || c.precio || c.alquilerMensual;
  return [
    `Solicitud desde la web: ${ETIQUETA_INTERES[lead.interes]} (${lead.origen}, página ${lead.pagina}).`,
    ...datos.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ...(montos ? ["Los montos van en la moneda que eligió la persona en el simulador (no se envía)."] : []),
    ...(horario ? [`Llamada solicitada: ${etiquetaHorario(horario)}.`] : []),
    `Consentimiento de datos (Ley 29733): ${fechaConsentimiento}.`,
    ...(utm ? [`UTM: ${utm}`] : []),
    `Id de envío: ${idEnvio}`,
  ].join("\n");
};

export const cuerpoOportunidad = (lead: Lead, contactoId: string, resumen: string) => {
  const c = lead.contexto ?? {};
  const tipo = c.tipoPropiedad ? TIPO_PROPIEDAD_GHL[c.tipoPropiedad] : undefined;
  return {
    name: `Web · ${ETIQUETA_INTERES[lead.interes]} · ${lead.nombre}`.slice(0, 200),
    contactId: contactoId,
    customFields: [
      ...(tipo ? [{ id: CAMPOS.oportunidadTipoPropiedad, field_value: tipo }] : []),
      ...(c.habitaciones ? [{ id: CAMPOS.oportunidadHabitaciones, field_value: c.habitaciones }] : []),
      { id: CAMPOS.oportunidadComentarios, field_value: resumen },
    ],
  };
};

// --- Registro completo -------------------------------------------------------------------

export type ResultadoRegistro = {
  contactoId: string;
  oportunidadId: string | null;
  /** `no-pedida`: el formulario no pidió cita · `reservada` · `fallida`: el lead quedó, la hora no. */
  cita: { estado: "no-pedida" } | { estado: "reservada"; horario: string } | { estado: "fallida"; motivo: string };
  /** Pasos secundarios que fallaron (etiquetas, nota, etapa): se registran, no bloquean. */
  avisos: string[];
};

/**
 * Registra el lead. Lanza `ErrorGhl` si falla el contacto o la oportunidad: en ese caso el lead
 * NO está completo y la persona debe ver el error con WhatsApp. Reintentar es seguro: el contacto
 * se actualiza (upsert) y la oportunidad abierta se reutiliza. La cita nunca se reintenta.
 */
export const registrarLead = async (
  cliente: ClienteGhl,
  lead: Lead,
  opciones: { idEnvio: string; horario?: string; etapaCitaId?: string; ahora?: Date }
): Promise<ResultadoRegistro> => {
  const fecha = (opciones.ahora ?? new Date()).toISOString();
  const avisos: string[] = [];
  const conCita = Boolean(opciones.horario) && (ORIGENES_CON_CITA as readonly string[]).includes(lead.origen);
  const resumen = resumenLead(lead, opciones.idEnvio, fecha, conCita ? opciones.horario : undefined);

  const contactoId = await cliente.upsertContacto(cuerpoContacto(lead));

  // Etiquetas y nota no bloquean: si fallan, el lead ya está y el asesor ve la oportunidad.
  const secundarios = await Promise.allSettled([
    cliente.agregarEtiquetas(contactoId, etiquetasLead(lead)),
    cliente.agregarNota(contactoId, resumen),
  ]);
  for (const s of secundarios) if (s.status === "rejected") avisos.push(describir(s.reason));

  let oportunidadId: string | null = null;
  if (!ORIGENES_SIN_OPORTUNIDAD.includes(lead.origen)) {
    oportunidadId =
      (await cliente.buscarOportunidadAbierta(contactoId)) ??
      (await cliente.crearOportunidad(cuerpoOportunidad(lead, contactoId, resumen)));
  }

  if (!conCita || !opciones.horario) return { contactoId, oportunidadId, cita: { estado: "no-pedida" }, avisos };

  try {
    await cliente.crearCita(contactoId, opciones.horario, `Llamada web · ${lead.nombre}`.slice(0, 200));
  } catch (error) {
    return { contactoId, oportunidadId, cita: { estado: "fallida", motivo: describir(error) }, avisos };
  }

  if (oportunidadId) {
    try {
      await cliente.actualizarOportunidad(oportunidadId, {
        ...(opciones.etapaCitaId ? { pipelineStageId: opciones.etapaCitaId } : {}),
        customFields: [{ id: CAMPOS.oportunidadAgendoLlamada, field_value: etiquetaHorario(opciones.horario) }],
      });
    } catch (error) {
      avisos.push(describir(error));
    }
  }
  return { contactoId, oportunidadId, cita: { estado: "reservada", horario: opciones.horario }, avisos };
};

/** Texto para logs: paso y estado, nunca el mensaje original (podría llevar la URL). */
export const describir = (error: unknown): string =>
  error instanceof ErrorGhl ? `${error.paso}-${error.estado}` : "desconocido";
