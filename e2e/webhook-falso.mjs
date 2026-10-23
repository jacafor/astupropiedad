// Webhook falso de GoHighLevel para las pruebas e2e: nada sale de la máquina.
// Responde 200 a cualquier lead, salvo que el nombre contenga "FALLA" (responde 503
// para probar el plan B de WhatsApp). No guarda ni imprime los datos recibidos.
import { createServer } from "node:http";

const puerto = Number(process.argv[2] ?? 3101);

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/salud") {
    res.writeHead(200).end("ok");
    return;
  }
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404).end();
    return;
  }
  let cuerpo = "";
  req.on("data", (trozo) => (cuerpo += trozo));
  req.on("end", () => {
    res.writeHead(cuerpo.includes("FALLA") ? 503 : 200, { "Content-Type": "application/json" });
    res.end("{}");
  });
}).listen(puerto, "127.0.0.1");
