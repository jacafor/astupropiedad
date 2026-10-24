/**
 * Eventos de analítica (GA4 y píxel de Meta). Solo se importa desde componentes cliente.
 *
 * `track()` no hace nada si el visitante no aceptó las cookies o si no hay IDs configurados
 * (NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_META_PIXEL_ID). Nunca recibe nombre, celular ni correo:
 * los parámetros están tipados y, por si acaso, se filtran antes de salir.
 * Lista de eventos y cómo probarlos: docs/INTEGRACIONES.md §4.
 */
import { useEffect, useRef } from "react";
import { GA_ID, META_PIXEL_ID, consentimientoActual } from "@/lib/consentimiento";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type EventosAnalitica = {
  /** Clic en cualquier enlace a wa.me. `origen` sale de `data-origen` (o `pagina:<ruta>`). */
  cta_whatsapp_click: { origen: string; pagina: string };
  /** El servidor confirmó el lead (no se envía nada de lo escrito). */
  lead_enviado: { origen: string; interes: string };
  simulador_calculado: { tipo: TipoSimulador };
  propiedad_vista: { id: string };
  /** `motivo`: validacion | no-configurado | servicio. `campos`: nombres de los campos con error, nunca sus valores. */
  formulario_error: { origen: string; motivo: string; campos?: string };
};

export type TipoSimulador = "hipotecario" | "inversion" | "home-hipoteca" | "home-rentabilidad";

// En Meta, los eventos que tienen equivalente estándar usan ese nombre (sirve para optimizar campañas).
const EVENTO_META: Partial<Record<keyof EventosAnalitica, string>> = {
  lead_enviado: "Lead",
  cta_whatsapp_click: "Contact",
};

const CLAVE_PERSONAL = /nombre|celular|telefono|phone|correo|email|mensaje/i;
const PARECE_PERSONAL = /@|\d{7,}/; // un correo o un número largo (celular, documento)

const limpiar = (params: Record<string, unknown>): Record<string, string | number> => {
  const limpio: Record<string, string | number> = {};
  for (const [clave, valor] of Object.entries(params)) {
    if (CLAVE_PERSONAL.test(clave)) continue;
    if (typeof valor === "number" && Number.isFinite(valor)) limpio[clave] = valor;
    else if (typeof valor === "string" && valor && !PARECE_PERSONAL.test(valor)) limpio[clave] = valor.slice(0, 100);
  }
  return limpio;
};

export const analiticaActiva = (): boolean =>
  (GA_ID !== "" || META_PIXEL_ID !== "") && consentimientoActual() === "aceptado";

export const track = <E extends keyof EventosAnalitica>(evento: E, parametros: EventosAnalitica[E]): void => {
  if (typeof window === "undefined" || !analiticaActiva()) return;
  const params = limpiar(parametros);
  if (GA_ID) window.gtag?.("event", evento, params);
  if (META_PIXEL_ID) {
    const estandar = EVENTO_META[evento];
    if (estandar) window.fbq?.("track", estandar, params);
    else window.fbq?.("trackCustom", evento, params);
  }
};

/**
 * Tras "Rechazar" con los scripts ya cargados en esta visita: se les quita el permiso
 * y se borran sus cookies. Los scripts siguen en memoria hasta recargar, pero `track()` ya no envía nada.
 */
export const revocarAnalitica = (): void => {
  window.gtag?.("consent", "update", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.fbq?.("consent", "revoke");
  const dominios = ["", window.location.hostname, `.${window.location.hostname.replace(/^www\./, "")}`];
  for (const cookie of document.cookie.split(";")) {
    const nombre = cookie.split("=")[0].trim();
    if (!/^(_ga|_gid|_gat|_fbp|_fbc)/.test(nombre)) continue;
    for (const dominio of dominios) {
      document.cookie = `${nombre}=; Max-Age=0; path=/${dominio ? `; domain=${dominio}` : ""}`;
    }
  }
};

/**
 * `simulador_calculado`: una vez por cálculo "asentado". No cuenta los valores iniciales;
 * cuenta cuando la persona cambia algo, el resultado es válido y deja de escribir 1,5 s.
 * `clave` resume las entradas (p. ej. JSON de los campos).
 */
export const useEventoSimulador = (tipo: TipoSimulador, clave: string, valido: boolean): void => {
  const inicial = useRef(clave);
  const ultimaEnviada = useRef<string | null>(null);
  useEffect(() => {
    if (!valido || clave === inicial.current || clave === ultimaEnviada.current) return;
    const t = window.setTimeout(() => {
      ultimaEnviada.current = clave;
      track("simulador_calculado", { tipo });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [tipo, clave, valido]);
};
