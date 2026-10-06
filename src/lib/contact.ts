/**
 * Única fuente de verdad de los datos de contacto de AS Tupropiedad.
 * No repitas teléfono, correo ni dominio en componentes: impórtalos de aquí.
 * Confirmados por jforero el 2026-10-04 (ver docs/DECISIONES.md, D-9).
 */

/** Nombre comercial. */
export const BRAND_NAME = "AS Tupropiedad";

/** Número de WhatsApp en formato internacional, sin "+" ni espacios. */
export const WHATSAPP_NUMBER = "51977588905";

/** Mismo número, para mostrarlo en pantalla. */
export const PHONE_DISPLAY = "+51 977 588 905";

export const EMAIL = "ventas@astupropiedad.com";

/** Dominio canónico, sin barra final. Se puede sobrescribir con NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://astupropiedad.com"
).replace(/\/$/, "");

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hola, quisiera más información sobre los servicios de AS Tupropiedad";

/** Enlace a WhatsApp con mensaje prellenado. */
export const waLink = (message: string = DEFAULT_WHATSAPP_MESSAGE): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const telLink = `tel:+${WHATSAPP_NUMBER}`;
export const mailLink = `mailto:${EMAIL}`;
