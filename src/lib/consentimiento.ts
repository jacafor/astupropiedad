/**
 * Decisión del visitante sobre las cookies de analítica y publicidad.
 * Se guarda en localStorage (no es una cookie) y cada lectura/escritura va con try/catch:
 * en modo privado o con el almacenamiento bloqueado, el banner vuelve a aparecer y no se carga nada.
 * Solo se importa desde componentes cliente.
 */

export type Consentimiento = "aceptado" | "rechazado";

const CLAVE = "astp-consentimiento-cookies";
const EVENTO_CAMBIO = "astp:consentimiento";
const EVENTO_ABRIR = "astp:abrir-preferencias-cookies";

/**
 * IDs públicos (se incrustan en el build). Un ID con formato inválido se ignora: va dentro
 * de un script en línea y no debe poder inyectar código. Si los dos faltan, no hay nada que consentir.
 */
const idValido = (valor: string | undefined, formato: RegExp): string => {
  const limpio = valor?.trim() ?? "";
  return formato.test(limpio) ? limpio : "";
};
export const GA_ID = idValido(process.env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,20}$/);
export const META_PIXEL_ID = idValido(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{5,20}$/);
export const HAY_ANALITICA = Boolean(GA_ID || META_PIXEL_ID);

// Respaldo en memoria cuando localStorage no está disponible.
let memoria: Consentimiento | null = null;

export const leerConsentimiento =(): Consentimiento | null => {
  try {
    const valor = window.localStorage.getItem(CLAVE);
    return valor === "aceptado" || valor === "rechazado" ? valor : null;
  } catch {
    return null;
  }
};

export const guardarConsentimiento = (valor: Consentimiento): void => {
  try {
    window.localStorage.setItem(CLAVE, valor);
  } catch {
    // Sin almacenamiento la decisión vale solo para esta página.
    memoria = valor;
  }
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
};

/** Lo que vale ahora: localStorage o, si está bloqueado, la decisión tomada en esta página. */
export const consentimientoActual = (): Consentimiento | null => leerConsentimiento() ?? memoria;

export const suscribirConsentimiento = (aviso: () => void): (() => void) => {
  window.addEventListener(EVENTO_CAMBIO, aviso);
  window.addEventListener("storage", aviso); // otra pestaña cambió la decisión
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, aviso);
    window.removeEventListener("storage", aviso);
  };
};

/** Reabre el banner (enlace "Preferencias de cookies" del pie). */
export const abrirPreferenciasCookies = (): void => {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
};

export const suscribirAbrirPreferencias = (aviso: () => void): (() => void) => {
  window.addEventListener(EVENTO_ABRIR, aviso);
  return () => window.removeEventListener(EVENTO_ABRIR, aviso);
};
