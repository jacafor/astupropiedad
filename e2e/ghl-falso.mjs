// API de GoHighLevel FALSA para las pruebas e2e: nada sale de la máquina (D-27).
// Imita las rutas que usa src/lib/ghl.ts y exige el token y la cabecera Version correctos.
// El nombre de la persona decide el resultado (datos ficticios):
//   "CAIDO"          → el contacto responde 503 (error honesto con WhatsApp)
//   "SINOPORTUNIDAD" → la oportunidad responde 500 (el lead no queda completo)
//   "SINCITA"        → la cita responde 422 (lead registrado, hora no reservada)
// Guarda en memoria qué rutas llamó cada contacto (GET /__registro/<id>) para que las pruebas
// lo comprueben; nunca guarda ni imprime nombres, celulares ni correos.
import { createServer } from "node:http";

const puerto = Number(process.argv[2] ?? 3101);
const TOKEN = "Bearer token-e2e";
const CRM = "2021-07-28";
const CALENDARIOS = "2021-04-15";

/** contactoId → ["POST /contacts/upsert", …] */
const registro = new Map();
const anotar = (id, linea) => registro.set(id, [...(registro.get(id) ?? []), linea]);

const slug = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Dos horarios por día, mañana y pasado mañana, a las 10:00 y 11:00 de Lima. */
const horariosLibres = () => {
  const respuesta = {};
  for (const dias of [1, 2]) {
    const fecha = new Date(Date.now() - 5 * 3_600_000 + dias * 86_400_000).toISOString().slice(0, 10);
    respuesta[fecha] = { slots: [`${fecha}T10:00:00-05:00`, `${fecha}T11:00:00-05:00`] };
  }
  return { ...respuesta, traceId: "falso" };
};

const json = (res, estado, cuerpo) => {
  res.writeHead(estado, { "Content-Type": "application/json" });
  res.end(JSON.stringify(cuerpo ?? {}));
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const ruta = url.pathname;

  if (req.method === "GET" && ruta === "/salud") return res.writeHead(200).end("ok");
  if (req.method === "GET" && ruta.startsWith("/__registro/")) {
    return json(res, 200, registro.get(decodeURIComponent(ruta.slice("/__registro/".length))) ?? []);
  }

  if (req.headers.authorization !== TOKEN) return json(res, 401, { message: "token" });
  const version = ruta.startsWith("/calendars") ? CALENDARIOS : CRM;
  if (req.headers.version !== version) return json(res, 400, { message: "version" });

  let texto = "";
  req.on("data", (trozo) => (texto += trozo));
  req.on("end", () => {
    const cuerpo = texto ? JSON.parse(texto) : {};

    if (req.method === "POST" && ruta === "/contacts/upsert") {
      const nombre = `${cuerpo.firstName ?? ""} ${cuerpo.lastName ?? ""}`;
      if (nombre.includes("CAIDO")) return json(res, 503);
      if (!cuerpo.locationId || !cuerpo.phone) return json(res, 422);
      const id = `c-${slug(nombre)}`;
      anotar(id, "POST /contacts/upsert");
      return json(res, 200, { new: true, contact: { id } });
    }

    const etiquetasONota = ruta.match(/^\/contacts\/([^/]+)\/(tags|notes)$/);
    if (req.method === "POST" && etiquetasONota) {
      anotar(etiquetasONota[1], `POST /contacts/${etiquetasONota[2]}`);
      return json(res, 201);
    }

    if (req.method === "GET" && ruta === "/opportunities/search") {
      anotar(url.searchParams.get("contact_id"), "GET /opportunities/search");
      return json(res, 200, { opportunities: [] });
    }

    if (req.method === "POST" && ruta === "/opportunities/") {
      if (String(cuerpo.contactId).includes("sinoportunidad")) return json(res, 500);
      if (!cuerpo.pipelineId || !cuerpo.pipelineStageId || !cuerpo.locationId) return json(res, 422);
      anotar(cuerpo.contactId, `POST /opportunities/ etapa=${cuerpo.pipelineStageId}`);
      return json(res, 201, { opportunity: { id: `o-${cuerpo.contactId}` } });
    }

    const oportunidad = ruta.match(/^\/opportunities\/o-(.+)$/);
    if (req.method === "PUT" && oportunidad) {
      anotar(oportunidad[1], `PUT /opportunities etapa=${cuerpo.pipelineStageId ?? ""}`);
      return json(res, 200, { opportunity: {} });
    }

    if (req.method === "GET" && /^\/calendars\/[^/]+\/free-slots$/.test(ruta)) {
      return json(res, 200, horariosLibres());
    }

    if (req.method === "POST" && ruta === "/calendars/events/appointments") {
      if (String(cuerpo.contactId).includes("sincita")) return json(res, 422, { message: "slot" });
      anotar(cuerpo.contactId, `POST /appointments ${cuerpo.startTime}`);
      return json(res, 200, { id: `cita-${cuerpo.contactId}` });
    }

    json(res, 404);
  });
}).listen(puerto, "127.0.0.1");
