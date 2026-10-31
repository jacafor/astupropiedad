import { describe, expect, it } from "vitest";
import {
  CAMPOS,
  ErrorGhl,
  crearClienteGhl,
  cuerpoContacto,
  cuerpoOportunidad,
  leerConfigGhl,
  registrarLead,
  separarNombre,
  type ConfigGhl,
} from "./ghl";
import type { Lead } from "./leads";

// API de GHL simulada: nunca hay red real. Cada prueba decide qué responde cada ruta.

const CONFIG: ConfigGhl = {
  token: "token-de-prueba",
  ubicacionId: "ubi-1",
  pipelineId: "pipe-1",
  etapaId: "etapa-nuevo",
  calendarioId: "cal-1",
  etapaCitaId: "etapa-cita",
  urlBase: "https://ghl.prueba",
};

type Llamada = { metodo: string; ruta: string; headers: Record<string, string>; cuerpo: unknown };
type Respuesta = { estado?: number; json?: unknown; error?: Error };

const apiFalsa = (rutas: Record<string, Respuesta | ((l: Llamada) => Respuesta)>) => {
  const llamadas: Llamada[] = [];
  const fetchFalso: typeof fetch = async (url, init) => {
    const u = new URL(String(url));
    const llamada: Llamada = {
      metodo: init?.method ?? "GET",
      ruta: u.pathname + u.search,
      headers: init?.headers as Record<string, string>,
      cuerpo: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    llamadas.push(llamada);
    const clave = `${llamada.metodo} ${u.pathname}`;
    const def = rutas[clave];
    const r = typeof def === "function" ? def(llamada) : def;
    if (!r) return new Response("{}", { status: 404 });
    if (r.error) throw r.error;
    return new Response(JSON.stringify(r.json ?? {}), { status: r.estado ?? 200 });
  };
  return { llamadas, cliente: crearClienteGhl(CONFIG, fetchFalso) };
};

const OK_BASICO = {
  "POST /contacts/upsert": { json: { new: true, contact: { id: "c-1" } } },
  "POST /contacts/c-1/tags": { estado: 201 },
  "POST /contacts/c-1/notes": { estado: 201 },
  "GET /opportunities/search": { json: { opportunities: [] } },
  "POST /opportunities/": { estado: 201, json: { opportunity: { id: "o-1" } } },
  "POST /calendars/events/appointments": { json: { id: "cita-1" } },
  "PUT /opportunities/o-1": { json: {} },
};

const lead = (extra: Partial<Lead> = {}): Lead => ({
  nombre: "Ana María Prueba",
  celular: "+51987654321",
  correo: undefined,
  interes: "vender",
  origen: "vender:valoracion",
  pagina: "/vender",
  consentimiento: true,
  contexto: { tipoPropiedad: "Terreno", distrito: "Distrito de prueba", habitaciones: 3 },
  utm: { source: "prueba" },
  ...extra,
});

const HORARIO = "2026-11-03T10:00:00-05:00";

describe("leerConfigGhl", () => {
  const env = {
    GHL_API_TOKEN: "t",
    GHL_LOCATION_ID: "l",
    GHL_PIPELINE_ID: "p",
    GHL_PIPELINE_STAGE_ID: "e",
    GHL_CALENDAR_ID: "c",
  };
  it("con las cinco variables usa la URL oficial", () => {
    expect(leerConfigGhl(env)).toMatchObject({ token: "t", urlBase: "https://services.leadconnectorhq.com" });
  });
  it("falta una o sigue en PENDIENTE → null", () => {
    expect(leerConfigGhl({ ...env, GHL_CALENDAR_ID: "" })).toBeNull();
    expect(leerConfigGhl({ ...env, GHL_PIPELINE_ID: "PENDIENTE" })).toBeNull();
  });
  it("acepta otra URL base (solo pruebas) sin barra final", () => {
    expect(leerConfigGhl({ ...env, GHL_API_BASE_URL: "http://127.0.0.1:3102/" })?.urlBase).toBe("http://127.0.0.1:3102");
  });
});

describe("mapeo", () => {
  it("separa nombre y apellidos", () => {
    expect(separarNombre("  Ana   María Pérez ")).toEqual({ firstName: "Ana", lastName: "María Pérez" });
    expect(separarNombre("Ana")).toEqual({ firstName: "Ana", lastName: "" });
  });
  it("el contacto no manda correo vacío ni etiquetas (el upsert las reemplazaría)", () => {
    const c = cuerpoContacto(lead());
    expect(c).not.toHaveProperty("email");
    expect(c).not.toHaveProperty("tags");
    expect(c.phone).toBe("+51987654321");
    expect(c.customFields).toContainEqual({ id: CAMPOS.contactoOrigen, field_value: "vender:valoracion" });
  });
  it("la oportunidad traduce el tipo a la lista de GHL y solo usa campos existentes", () => {
    const o = cuerpoOportunidad(lead(), "c-1", "resumen");
    expect(o.name).toBe("Web · Venta · Ana María Prueba");
    expect(o.customFields).toContainEqual({ id: CAMPOS.oportunidadTipoPropiedad, field_value: "Terreno / Lote" });
    const sinTipo = cuerpoOportunidad(lead({ contexto: { tipoPropiedad: "Cochera" } }), "c-1", "r");
    expect(sinTipo.customFields.map((c) => c.id)).toEqual([CAMPOS.oportunidadComentarios]);
  });
});

describe("cliente", () => {
  it("manda token, versión por API y la ubicación", async () => {
    const { llamadas, cliente } = apiFalsa(OK_BASICO);
    await cliente.upsertContacto({ phone: "+51987654321" });
    expect(llamadas[0].headers).toMatchObject({ Authorization: "Bearer token-de-prueba", Version: "2021-07-28" });
    expect(llamadas[0].cuerpo).toMatchObject({ locationId: "ubi-1" });
  });

  it("los errores no llevan el token ni la URL", async () => {
    const { cliente } = apiFalsa({ "POST /contacts/upsert": { estado: 401 } });
    const error = await cliente.upsertContacto({}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorGhl);
    expect(String((error as Error).message)).toBe("GHL contacto: 401");
  });

  it("distingue tiempo agotado de fallo de red", async () => {
    const tiempo = new Error("x");
    tiempo.name = "TimeoutError";
    const a = apiFalsa({ "POST /contacts/upsert": { error: tiempo } });
    await expect(a.cliente.upsertContacto({})).rejects.toMatchObject({ estado: "tiempo" });
    const b = apiFalsa({ "POST /contacts/upsert": { error: new TypeError("fetch failed https://ghl") } });
    await expect(b.cliente.upsertContacto({})).rejects.toMatchObject({ estado: "red" });
  });

  it("horarios: versión de calendarios, milisegundos y zona de Lima", async () => {
    const ahora = new Date("2026-11-02T15:00:00Z"); // 10:00 en Lima
    const { llamadas, cliente } = apiFalsa({
      "GET /calendars/cal-1/free-slots": {
        json: {
          "2026-11-02": { slots: ["2026-11-02T10:30:00-05:00", "2026-11-02T16:00:00-05:00"] },
          "2026-11-03": { slots: ["2026-11-03T10:00:00-05:00"] },
          traceId: "x",
        },
      },
    });
    const dias = await cliente.horariosLibres(ahora);
    expect(llamadas[0].headers.Version).toBe("2021-04-15");
    expect(llamadas[0].ruta).toContain(`startDate=${ahora.getTime()}`);
    expect(llamadas[0].ruta).toContain("timezone=America%2FLima");
    // 10:30 queda dentro del margen de una hora: no se ofrece.
    expect(dias).toEqual([
      { fecha: "2026-11-02", horarios: ["2026-11-02T16:00:00-05:00"] },
      { fecha: "2026-11-03", horarios: ["2026-11-03T10:00:00-05:00"] },
    ]);
  });
});

describe("registrarLead", () => {
  it("contacto + etiquetas + nota + oportunidad + cita + etapa de cita", async () => {
    const { llamadas, cliente } = apiFalsa(OK_BASICO);
    const r = await registrarLead(cliente, lead(), { idEnvio: "id-1", horario: HORARIO, etapaCitaId: "etapa-cita" });
    expect(r).toEqual({
      contactoId: "c-1",
      oportunidadId: "o-1",
      cita: { estado: "reservada", horario: HORARIO },
      avisos: [],
    });
    const oportunidad = llamadas.find((l) => l.ruta === "/opportunities/")?.cuerpo;
    expect(oportunidad).toMatchObject({ pipelineId: "pipe-1", pipelineStageId: "etapa-nuevo", status: "open", contactId: "c-1" });
    const cita = llamadas.find((l) => l.ruta === "/calendars/events/appointments");
    expect(cita?.headers.Version).toBe("2021-04-15");
    expect(cita?.cuerpo).toMatchObject({ calendarId: "cal-1", contactId: "c-1", startTime: HORARIO });
    expect(llamadas.find((l) => l.metodo === "PUT")?.cuerpo).toMatchObject({ pipelineStageId: "etapa-cita" });
    expect(llamadas.find((l) => l.ruta.endsWith("/tags"))?.cuerpo).toEqual({
      tags: ["web-astupropiedad", "interes:vender", "origen:vender:valoracion"],
    });
  });

  it("reutiliza la oportunidad abierta (un reintento no duplica)", async () => {
    const { llamadas, cliente } = apiFalsa({
      ...OK_BASICO,
      "GET /opportunities/search": { json: { opportunities: [{ id: "o-vieja" }] } },
    });
    const r = await registrarLead(cliente, lead(), { idEnvio: "id-1" });
    expect(r.oportunidadId).toBe("o-vieja");
    expect(llamadas.some((l) => l.metodo === "POST" && l.ruta === "/opportunities/")).toBe(false);
  });

  it("si falla la oportunidad, lanza (el lead no está completo) y no intenta la cita", async () => {
    const { llamadas, cliente } = apiFalsa({ ...OK_BASICO, "POST /opportunities/": { estado: 500 } });
    await expect(registrarLead(cliente, lead(), { idEnvio: "id-1", horario: HORARIO })).rejects.toMatchObject({
      paso: "oportunidad",
      estado: 500,
    });
    expect(llamadas.some((l) => l.ruta.startsWith("/calendars"))).toBe(false);
  });

  it("si falla la cita, el lead queda y se informa como fallida (sin reintentar)", async () => {
    const { llamadas, cliente } = apiFalsa({ ...OK_BASICO, "POST /calendars/events/appointments": { estado: 422 } });
    const r = await registrarLead(cliente, lead(), { idEnvio: "id-1", horario: HORARIO });
    expect(r.cita).toEqual({ estado: "fallida", motivo: "cita-422" });
    expect(llamadas.filter((l) => l.ruta === "/calendars/events/appointments")).toHaveLength(1);
    expect(llamadas.some((l) => l.metodo === "PUT")).toBe(false);
  });

  it("etiquetas o nota caídas no bloquean el lead", async () => {
    const { cliente } = apiFalsa({ ...OK_BASICO, "POST /contacts/c-1/tags": { estado: 503 } });
    const r = await registrarLead(cliente, lead(), { idEnvio: "id-1" });
    expect(r.oportunidadId).toBe("o-1");
    expect(r.avisos).toEqual(["etiquetas-503"]);
  });

  it("un formulario sin cita ignora el horario; reclutamiento no crea oportunidad", async () => {
    const a = apiFalsa(OK_BASICO);
    const r = await registrarLead(a.cliente, lead({ origen: "simulador-hipotecario:cta", interes: "hipoteca" }), {
      idEnvio: "id-1",
      horario: HORARIO,
    });
    expect(r.cita).toEqual({ estado: "no-pedida" });
    expect(a.llamadas.some((l) => l.ruta.startsWith("/calendars"))).toBe(false);

    const b = apiFalsa(OK_BASICO);
    const r2 = await registrarLead(b.cliente, lead({ origen: "home:reclutamiento", interes: "reclutamiento" }), {
      idEnvio: "id-2",
    });
    expect(r2.oportunidadId).toBeNull();
    expect(b.llamadas.some((l) => l.ruta.startsWith("/opportunities"))).toBe(false);
  });

  it("la nota resume la solicitud sin el token", async () => {
    const { llamadas, cliente } = apiFalsa(OK_BASICO);
    await registrarLead(cliente, lead(), { idEnvio: "id-9", ahora: new Date("2026-11-02T15:00:00Z") });
    const nota = (llamadas.find((l) => l.ruta.endsWith("/notes"))?.cuerpo as { body: string }).body;
    expect(nota).toContain("Solicitud desde la web: Venta (vender:valoracion, página /vender).");
    expect(nota).toContain("Consentimiento de datos (Ley 29733): 2026-11-02T15:00:00.000Z.");
    expect(nota).toContain("Id de envío: id-9");
    expect(nota).not.toContain("token");
  });
});
