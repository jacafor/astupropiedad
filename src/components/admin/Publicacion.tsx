"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Archive, Eye, EyeOff, RotateCcw, Send } from "lucide-react";
import type { EstadoPropiedad } from "@/data/properties";
import type { ResultadoAccion } from "@/lib/admin/tipos";
import { ESTADOS, ETIQUETA_ESTADO } from "@/lib/catalogo/esquema";
import type { Visibilidad } from "@/lib/catalogo/mapeo";
import { cambiarEstado, cambiarVisibilidad } from "@/app/admin/acciones";
import { InsigniaVisibilidad } from "./Insignias";
import { Aviso, estilos } from "./ui";

type Props = {
  id: string;
  slug: string;
  visibilidad: Visibilidad;
  estado: EstadoPropiedad;
  cantidadFotos: number;
};

/** Publicar, pasar a borrador, archivar y cambiar el estado comercial (disponible, reservado, vendido). */
const Publicacion = ({ id, slug, visibilidad, estado, cantidadFotos }: Props) => {
  const [resultado, setResultado] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();

  const ejecutar = (fn: () => Promise<ResultadoAccion>) =>
    iniciar(async () => {
      setResultado(await fn());
    });

  const visibilidadA = (v: Visibilidad, confirmar?: string) => () => {
    if (confirmar && !window.confirm(confirmar)) return;
    ejecutar(() => cambiarVisibilidad(id, v));
  };

  return (
    <section aria-labelledby="publicacion" className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="publicacion" className="text-xl font-serif font-black text-dark mr-auto">
          Publicación
        </h2>
        <InsigniaVisibilidad valor={visibilidad} />
      </div>

      <div aria-live="polite">{resultado && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}</div>

      <p className="text-gray-700">
        {visibilidad === "publicada" && "Se ve en el sitio público."}
        {visibilidad === "borrador" &&
          (cantidadFotos === 0
            ? "Borrador: sube al menos una foto para poder publicarla."
            : "Borrador: solo la ves tú. Revisa la vista previa y publícala.")}
        {visibilidad === "archivada" && "Archivada: no aparece en el sitio y su enlace da 404. Puedes restaurarla."}
      </p>

      <div className="flex flex-wrap gap-3">
        <Link href={`/admin/propiedades/${id}/vista-previa`} className={estilos.botonSecundario}>
          <Eye className="w-4 h-4" aria-hidden="true" />
          Vista previa
        </Link>
        {visibilidad === "publicada" && (
          <a href={`/propiedades/${slug}`} target="_blank" rel="noopener noreferrer" className={estilos.botonSecundario}>
            Ver en el sitio<span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        )}
        {visibilidad === "borrador" && (
          <button
            type="button"
            disabled={pendiente || cantidadFotos === 0}
            onClick={visibilidadA("publicada")}
            className={estilos.botonPrincipal}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            Publicar
          </button>
        )}
        {visibilidad === "publicada" && (
          <button
            type="button"
            disabled={pendiente}
            onClick={visibilidadA("borrador", "¿Quitarla del sitio y volver a borrador?")}
            className={estilos.botonSecundario}
          >
            <EyeOff className="w-4 h-4" aria-hidden="true" />
            Pasar a borrador
          </button>
        )}
        {visibilidad !== "archivada" ? (
          <button
            type="button"
            disabled={pendiente}
            onClick={visibilidadA(
              "archivada",
              "¿Archivar esta propiedad? Dejará de verse en el sitio y su enlace dará 404. Puedes restaurarla después."
            )}
            className={estilos.botonPeligro}
          >
            <Archive className="w-4 h-4" aria-hidden="true" />
            Archivar
          </button>
        ) : (
          <button type="button" disabled={pendiente} onClick={visibilidadA("borrador")} className={estilos.botonSecundario}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Restaurar como borrador
          </button>
        )}
      </div>

      <fieldset>
        <legend className={estilos.etiqueta}>Estado comercial</legend>
        <div className="flex flex-wrap gap-2">
          {ESTADOS.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={estado === e}
              disabled={pendiente}
              onClick={() => estado !== e && ejecutar(() => cambiarEstado(id, e))}
              className={`min-h-11 px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest border transition-all ${
                estado === e ? "bg-dark text-white border-dark" : "bg-white text-dark border-gray-300 hover:border-primary"
              }`}
            >
              {ETIQUETA_ESTADO[e]}
            </button>
          ))}
        </div>
        <p className={estilos.ayuda}>Reservada o vendida: sale del catálogo pero su ficha sigue existiendo con la etiqueta.</p>
      </fieldset>
    </section>
  );
};

export default Publicacion;
