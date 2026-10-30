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

/**
 * Dirección y horario confirmados por jforero el 2026-10-29 (ver docs/DECISIONES.md, D-28).
 * No es necesariamente el domicilio fiscal: ese dato sigue como [PENDIENTE] en los textos legales.
 */
export const DIRECCION = {
  calle: "Calle San Juan 211",
  distrito: "La Molina",
  ciudad: "Lima",
  pais: "Perú",
  codigoPais: "PE",
};

/** Dirección en una línea, para el pie de página. */
export const DIRECCION_TEXTO = `${DIRECCION.calle}, ${DIRECCION.distrito}, ${DIRECCION.ciudad} - ${DIRECCION.pais}`;

/** Horario de atención: lunes a sábado, de 8:00 a 20:00 h. */
export const HORARIO = {
  texto: "Lunes a sábado, de 8:00 a. m. a 8:00 p. m.",
  dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  abre: "08:00",
  cierra: "20:00",
};

/**
 * Redes oficiales (tomadas de la web actual el 2026-10-29).
 * TikTok no está: el perfil enlazado allí parece personal; añádelo cuando el cliente lo confirme.
 */
export const REDES_SOCIALES = [
  { nombre: "Facebook", url: "https://www.facebook.com/astupropiedadsac" },
  { nombre: "Instagram", url: "https://www.instagram.com/as.tupropiedad" },
  { nombre: "LinkedIn", url: "https://www.linkedin.com/company/as-tupropiedad" },
  { nombre: "YouTube", url: "https://www.youtube.com/@AS_Tupropiedad" },
] as const;

/**
 * Bancos con los que AS Tupropiedad dice tener convenio (dato de jforero, 2026-10-29).
 * El respaldo escrito de cada convenio sigue pendiente de archivar (P-10): solo se nombran en texto, sin logos.
 */
export const BANCOS_CONVENIO = ["BBVA", "BCP", "Scotiabank", "Interbank"] as const;

/** "BBVA, BCP, Scotiabank e Interbank". */
export const BANCOS_CONVENIO_TEXTO = new Intl.ListFormat("es", { style: "long", type: "conjunction" }).format(
  BANCOS_CONVENIO
);

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
