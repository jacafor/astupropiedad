/**
 * Tipos y constantes del inventario de propiedades (se pueden importar desde componentes de
 * cliente). La lectura de datos está en `src/data/inventario.ts` (solo servidor). Desde la sesión 16
 * los datos viven en Supabase y se editan en /admin (D-30, reemplaza D-11); ver
 * docs/NEGOCIO-Y-CONTENIDO.md → "Cómo agregar una propiedad".
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

export const ETIQUETA_OPERACION: Record<Operacion, string> = { venta: "Venta", alquiler: "Alquiler" };
export const ETIQUETA_TIPO: Record<TipoInmueble, string> = {
  departamento: "Departamento",
  casa: "Casa",
  oficina: "Oficina",
  terreno: "Terreno",
};
