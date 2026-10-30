/**
 * Única fuente de verdad del inventario de propiedades (D-11): el catálogo, la
 * home, las fichas `/propiedades/[slug]` y el sitemap leen de aquí.
 * Para agregar una propiedad, ver docs/NEGOCIO-Y-CONTENIDO.md → "Cómo agregar una propiedad".
 *
 * Regla 1 de AGENTS.md: solo datos que entregó el cliente. Nada de cifras verosímiles.
 */
import type { Moneda } from "@/lib/finance";

export type TipoInmueble = "departamento" | "casa" | "oficina" | "terreno";
export type Operacion = "venta" | "alquiler";
export type EstadoPropiedad = "disponible" | "reservado" | "vendido";

export interface FotoPropiedad {
  /** Ruta bajo /public, en minúsculas y con guiones (ej. "/imagenes/propiedades/jm-001-sala.jpg"). */
  url: string;
  /** Descripción de lo que se ve en la foto (accesibilidad y SEO). */
  alt: string;
}

/**
 * Moneda en que se publica cada operación (D-28, cierra P-4): venta en dólares, alquiler en soles.
 * `Property.moneda` debe coincidir con esta tabla; `properties.test.ts` lo comprueba.
 */
export const MONEDA_POR_OPERACION: Record<Operacion, Moneda> = { venta: "USD", alquiler: "PEN" };

export interface Property {
  /** Referencia corta y estable que se muestra y viaja en el mensaje de WhatsApp (ej. "JM-001"). */
  id: string;
  /** Parte de la URL: minúsculas, sin tildes ni espacios (ej. "departamento-jesus-maria-calle-talara"). No cambiarlo una vez publicado. */
  slug: string;
  titulo: string;
  operacion: Operacion;
  tipo: TipoInmueble;
  distrito: string;
  precio: number;
  /** Venta = "USD", alquiler = "PEN" (ver `MONEDA_POR_OPERACION`). */
  moneda: Moneda;
  /** Área construida / techada en m². */
  areaConstruidaM2: number;
  /** Área total (con terreno) en m². Solo si difiere de la construida. */
  areaTotalM2?: number;
  dormitorios: number;
  banos: number;
  cocheras: number;
  descripcion: string;
  /** Lista corta (ascensor, terraza…). Opcional. */
  caracteristicas?: string[];
  estado: EstadoPropiedad;
  /** Aparece en la home. */
  destacada?: boolean;
  /** La primera foto es la portada. Al menos una. */
  fotos: FotoPropiedad[];
}

/**
 * ⚠ EJEMPLO: dato ficticio solo para desarrollo y pruebas de la ficha.
 * `visibles()` lo descarta en producción (salvo MOSTRAR_EJEMPLO=1 para probar el build).
 * Bórralo cuando cargues la primera propiedad real.
 */
const EJEMPLO: Property = {
  id: "EJEMPLO-000",
  slug: "ejemplo-no-publicar",
  titulo: "EJEMPLO — Departamento de prueba (no es una propiedad real)",
  operacion: "venta",
  tipo: "departamento",
  distrito: "Distrito de ejemplo",
  precio: 100000,
  moneda: "USD",
  areaConstruidaM2: 80,
  dormitorios: 2,
  banos: 2,
  cocheras: 1,
  descripcion:
    "Ficha ficticia para comprobar el diseño de la página. Los datos, el precio y la foto no corresponden a ningún inmueble.",
  caracteristicas: ["Característica de ejemplo"],
  estado: "disponible",
  destacada: true,
  fotos: [{ url: "/imagenes/portada.jpg", alt: "Foto de ejemplo, no corresponde a una propiedad real" }],
};

/** Inventario real. Agrega aquí las propiedades que entregue el cliente. */
const PROPIEDADES: Property[] = [];

const mostrarEjemplo =
  process.env.NODE_ENV !== "production" || process.env.MOSTRAR_EJEMPLO === "1";

const visibles = (): Property[] =>
  mostrarEjemplo ? [...PROPIEDADES, EJEMPLO] : PROPIEDADES;

/** Todas las propiedades publicadas (cualquier estado): se usan para generar las fichas y el sitemap. */
export const obtenerPropiedades = (): Property[] => visibles();

/** Las que se muestran en el catálogo y la home: solo las disponibles. */
export const listarDisponibles = (): Property[] =>
  visibles().filter((p) => p.estado === "disponible");

export const obtenerPorSlug = (slug: string): Property | undefined =>
  visibles().find((p) => p.slug === slug);

/** Hasta `max` propiedades disponibles parecidas: mismo distrito primero, luego misma operación. */
export const similares = (base: Property, max = 3): Property[] => {
  const otras = listarDisponibles().filter((p) => p.slug !== base.slug && p.operacion === base.operacion);
  const puntaje = (p: Property) => (p.distrito === base.distrito ? 2 : 0) + (p.tipo === base.tipo ? 1 : 0);
  return otras.sort((a, b) => puntaje(b) - puntaje(a)).slice(0, max);
};

export const ETIQUETA_OPERACION: Record<Operacion, string> = { venta: "Venta", alquiler: "Alquiler" };
export const ETIQUETA_TIPO: Record<TipoInmueble, string> = {
  departamento: "Departamento",
  casa: "Casa",
  oficina: "Oficina",
  terreno: "Terreno",
};
