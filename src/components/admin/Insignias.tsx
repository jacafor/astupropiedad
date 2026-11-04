import type { EstadoPropiedad } from "@/data/properties";
import { ETIQUETA_ESTADO, ETIQUETA_VISIBILIDAD } from "@/lib/catalogo/esquema";
import type { Visibilidad } from "@/lib/catalogo/mapeo";
import { estilos } from "./ui";

// Colores con contraste ≥ 4.5:1 (docs/DISENO.md §4): texto blanco sobre primary/dark, dark sobre gris claro.
const COLOR_VISIBILIDAD: Record<Visibilidad, string> = {
  publicada: "bg-primary text-white",
  borrador: "bg-gray-200 text-dark",
  archivada: "bg-white text-gray-700 border border-gray-300",
};

const COLOR_ESTADO: Record<EstadoPropiedad, string> = {
  disponible: "bg-white text-secondary-dark border border-secondary-dark",
  reservado: "bg-white text-primary border border-primary",
  vendido: "bg-dark text-white",
};

export const InsigniaVisibilidad = ({ valor }: { valor: Visibilidad }) => (
  <span className={`${estilos.insignia} ${COLOR_VISIBILIDAD[valor]}`}>{ETIQUETA_VISIBILIDAD[valor]}</span>
);

export const InsigniaEstado = ({ valor }: { valor: EstadoPropiedad }) => (
  <span className={`${estilos.insignia} ${COLOR_ESTADO[valor]}`}>{ETIQUETA_ESTADO[valor]}</span>
);
