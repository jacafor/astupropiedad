"use client";

import { useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical, Star, Trash2 } from "lucide-react";
import { actualizarAlt, moverFoto, ordenarFotos, quitarFoto } from "@/app/admin/acciones";
import type { DireccionFoto, ResultadoAccion } from "@/lib/admin/tipos";
import type { FotoAdmin } from "@/lib/catalogo/mapeo";
import SubirFotos from "./SubirFotos";
import { Aviso, estilos } from "./ui";

type Props = { id: string; fotos: FotoAdmin[] };

/** Texto alternativo de una foto ya subida: se guarda al salir del campo o con el botón. */
const AltFoto = ({ id, foto, numero }: { id: string; foto: FotoAdmin; numero: number }) => {
  const campo = useId();
  const [valor, setValor] = useState(foto.alt);
  const [resultado, setResultado] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();
  const cambiado = valor.trim() !== foto.alt;

  const guardar = () => {
    if (!cambiado) return;
    iniciar(async () => setResultado(await actualizarAlt(id, foto.id, valor)));
  };

  return (
    <div>
      <label htmlFor={campo} className={estilos.etiqueta}>
        Descripción de la foto {numero}
      </label>
      <div className="flex gap-2">
        <input
          id={campo}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onBlur={guardar}
          maxLength={160}
          aria-invalid={resultado && !resultado.ok ? true : undefined}
          aria-describedby={resultado ? `${campo}-r` : undefined}
          className={`${estilos.campo} ${resultado && !resultado.ok ? estilos.campoError : estilos.campoNormal}`}
        />
        {cambiado && (
          <button type="button" onClick={guardar} disabled={pendiente} className={estilos.botonSecundario}>
            Guardar
          </button>
        )}
      </div>
      {resultado && (
        <p id={`${campo}-r`} className={resultado.ok ? estilos.ayuda : estilos.error} role={resultado.ok ? "status" : "alert"}>
          {resultado.mensaje}
        </p>
      )}
    </div>
  );
};

type ItemProps = {
  id: string;
  foto: FotoAdmin;
  indice: number;
  total: number;
  pendiente: boolean;
  alSoltar: () => void;
  mover: (fotoId: string, direccion: DireccionFoto) => void;
  quitar: (foto: FotoAdmin, numero: number) => void;
};

/**
 * Una foto de la galería. Se arrastra desde el asa (ratón o dedo); con teclado y lector de pantalla
 * se ordena con los botones de flecha y "Hacer portada", que hacen lo mismo.
 */
const ItemFoto = ({ id, foto: f, indice: i, total, pendiente, alSoltar, mover, quitar }: ItemProps) => {
  const controles = useDragControls();
  return (
    <Reorder.Item
      as="li"
      value={f}
      dragListener={false}
      dragControls={controles}
      onDragEnd={alSoltar}
      className="relative grid gap-4 sm:grid-cols-[auto_10rem_1fr] rounded-2xl border border-gray-200 bg-white p-4"
    >
      <div
        aria-hidden="true"
        onPointerDown={(e) => {
          e.preventDefault();
          controles.start(e);
        }}
        style={{ touchAction: "none" }}
        title="Arrastra para cambiar el orden"
        className="hidden sm:flex items-center justify-center w-8 -ml-1 rounded-lg text-gray-500 hover:text-primary hover:bg-light cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-6 h-6" />
      </div>
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
        <Image src={f.url} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover pointer-events-none" draggable={false} />
        <span className={`${estilos.insignia} absolute top-2 left-2 ${i === 0 ? "bg-primary text-white" : "bg-white/90 text-dark"}`}>
          {i === 0 ? "Portada" : `Foto ${i + 1}`}
        </span>
        {/* En celular el asa va sobre la foto, a la derecha, para no robar ancho al texto. */}
        <div
          aria-hidden="true"
          onPointerDown={(e) => {
            e.preventDefault();
            controles.start(e);
          }}
          style={{ touchAction: "none" }}
          className="sm:hidden absolute top-2 right-2 flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-dark shadow cursor-grab"
        >
          <GripVertical className="w-6 h-6" />
        </div>
      </div>
      <div className="space-y-3 min-w-0">
        <AltFoto id={id} foto={f} numero={i + 1} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pendiente || i === 0}
            onClick={() => mover(f.id, "arriba")}
            className={estilos.botonSecundario}
            aria-label={`Subir la foto ${i + 1}`}
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={pendiente || i === total - 1}
            onClick={() => mover(f.id, "abajo")}
            className={estilos.botonSecundario}
            aria-label={`Bajar la foto ${i + 1}`}
          >
            <ArrowDown className="w-4 h-4" aria-hidden="true" />
          </button>
          {i > 0 && (
            <button type="button" disabled={pendiente} onClick={() => mover(f.id, "portada")} className={estilos.botonSecundario}>
              <Star className="w-4 h-4" aria-hidden="true" />
              Hacer portada
            </button>
          )}
          <button type="button" disabled={pendiente} onClick={() => quitar(f, i + 1)} className={estilos.botonPeligro}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Quitar<span className="sr-only"> la foto {i + 1}</span>
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
};

/**
 * Subir (varias a la vez), describir, ordenar y quitar fotos. La primera es la portada. El orden se
 * cambia arrastrando o con botones; al soltar se guarda el orden completo.
 */
const GestorFotos = ({ id, fotos }: Props) => {
  const [accion, setAccion] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();

  // Orden local mientras se arrastra. Si el servidor manda otras fotos u otro orden, se toma ese.
  const firma = fotos.map((f) => f.id).join(",");
  const [local, setLocal] = useState({ firma, orden: fotos });
  if (local.firma !== firma) setLocal({ firma, orden: fotos });
  const orden = local.firma === firma ? local.orden : fotos;
  // Último orden arrastrado, con la firma del orden del servidor sobre el que se hizo.
  const arrastrado = useRef<{ firma: string; ids: string[] } | null>(null);

  const alSoltar = () => {
    const ultimo = arrastrado.current;
    arrastrado.current = null;
    if (!ultimo || ultimo.firma !== firma) return;
    const ids = ultimo.ids;
    if (ids.join(",") === firma) return;
    iniciar(async () => setAccion(await ordenarFotos(id, ids)));
  };

  const mover = (fotoId: string, direccion: DireccionFoto) =>
    iniciar(async () => setAccion(await moverFoto(id, fotoId, direccion)));

  const quitar = (foto: FotoAdmin, numero: number) => {
    if (!window.confirm(`¿Quitar la foto ${numero}? Se borra del almacenamiento y no se puede deshacer.`)) return;
    iniciar(async () => setAccion(await quitarFoto(id, foto.id)));
  };

  return (
    <section aria-labelledby="fotos" className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`}>
      <div>
        <h2 id="fotos" className="text-xl font-serif font-black text-dark">
          Fotos <span className="font-sans text-base font-bold text-gray-600">({fotos.length})</span>
        </h2>
        <p className="text-gray-700 mt-1">
          La primera es la portada. Ordénalas arrastrando el asa <GripVertical className="inline w-4 h-4 align-text-bottom" aria-label="(icono de seis puntos)" />{" "}
          o con las flechas. Se convierten a WebP y se les quitan los datos de ubicación. Usa fotos limpias: sin teléfonos,
          precios, logos ni marcas de agua.
        </p>
      </div>

      <div aria-live="polite">{accion && <Aviso ok={accion.ok} mensaje={accion.mensaje} />}</div>

      {fotos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-700">
          Aún no hay fotos. Sube la primera: será la portada.
        </p>
      ) : (
        <Reorder.Group
          as="ol"
          axis="y"
          values={orden}
          onReorder={(nuevo) => {
            arrastrado.current = { firma, ids: nuevo.map((f) => f.id) };
            setLocal({ firma, orden: nuevo });
          }}
          className={`grid gap-4 ${pendiente ? "opacity-80" : ""}`}
          aria-label="Fotos de la propiedad, en orden"
        >
          {orden.map((f, i) => (
            <ItemFoto
              key={f.id}
              id={id}
              foto={f}
              indice={i}
              total={orden.length}
              pendiente={pendiente}
              alSoltar={alSoltar}
              mover={mover}
              quitar={quitar}
            />
          ))}
        </Reorder.Group>
      )}

      <SubirFotos id={id} hayFotos={fotos.length > 0} />
    </section>
  );
};

export default GestorFotos;
