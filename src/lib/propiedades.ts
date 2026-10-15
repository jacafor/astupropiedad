import { waLink } from "@/lib/contact";
import { formatearMoneda } from "@/lib/formato";
import { ETIQUETA_TIPO, type Property } from "@/data/properties";

/** "Departamento · Jesús María" */
export const resumenUbicacion = (p: Property): string => `${ETIQUETA_TIPO[p.tipo]} · ${p.distrito}`;

export const precioTexto = (p: Property): string => formatearMoneda(p.precio, p.moneda);

/** Enlace de WhatsApp con título, referencia y precio (docs/INTEGRACIONES.md §3). */
export const waPropiedad = (p: Property): string =>
  waLink(`Hola, me interesa "${p.titulo}" (ref. ${p.id}) — ${precioTexto(p)}. ¿Sigue disponible?`);
