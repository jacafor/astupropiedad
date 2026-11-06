"use client";

import { useEffect, useId, useRef, useState } from "react";
/* eslint-disable @next/next/no-img-element -- vistas previas locales (blob:), next/image no las optimiza */
import { ImagePlus, Upload, X } from "lucide-react";
import { subirFoto } from "@/app/admin/acciones";
import { esquemaAlt, LADO_MAXIMO_FOTO, MAX_BYTES_FOTO, TIPOS_FOTO } from "@/lib/catalogo/esquema";
import { FotoIlegible, reducirSiPesa } from "@/lib/catalogo/reducir";
import { Aviso, estilos } from "./ui";

/** Tope por tanda: cada foto viaja en su propio envío, pero una tanda enorme se hace eterna. */
export const MAX_FOTOS_POR_TANDA = 20;

type Pendiente = { clave: string; archivo: File; vista: string; alt: string; error?: string };

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Subida de varias fotos a la vez: se eligen (o se arrastran) todas juntas, se describe cada una y
 * se suben una por una (Vercel no acepta envíos de más de 4,5 MB). Las que fallan quedan en la
 * lista con su error; las que suben se van. El servidor repite todas las comprobaciones.
 */
const SubirFotos = ({ id, hayFotos }: { id: string; hayFotos: boolean }) => {
  const campo = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [cola, setCola] = useState<Pendiente[]>([]);
  const [limpia, setLimpia] = useState(false);
  const [errorLimpia, setErrorLimpia] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [progreso, setProgreso] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);
  const vistas = useRef(new Set<string>());

  // Al salir de la página se liberan las vistas previas que queden.
  useEffect(() => {
    const abiertas = vistas.current;
    return () => abiertas.forEach((v) => URL.revokeObjectURL(v));
  }, []);

  const soltarVista = (v: string) => {
    URL.revokeObjectURL(v);
    vistas.current.delete(v);
  };

  const agregar = (archivos: Iterable<File>) => {
    const lista = [...archivos];
    const validos = lista.filter((a) => (TIPOS_FOTO as readonly string[]).includes(a.type));
    const espacio = Math.max(0, MAX_FOTOS_POR_TANDA - cola.length);
    const nuevos = validos.slice(0, espacio).map((archivo) => {
      const vista = URL.createObjectURL(archivo);
      vistas.current.add(vista);
      return { clave: crypto.randomUUID(), archivo, vista, alt: "" };
    });
    setCola((c) => [...c, ...nuevos]);
    const avisos: string[] = [];
    if (validos.length < lista.length) avisos.push(`${plural(lista.length - validos.length, "archivo no es", "archivos no son")} JPG, PNG o WebP y no se agregó.`);
    if (validos.length > espacio) avisos.push(`Puedes subir hasta ${MAX_FOTOS_POR_TANDA} fotos por vez; agrega las demás después.`);
    setAviso(avisos.length ? { ok: false, mensaje: avisos.join(" ") } : null);
    if (entrada.current) entrada.current.value = "";
  };

  const quitar = (clave: string) =>
    setCola((c) => {
      const p = c.find((x) => x.clave === clave);
      if (p) soltarVista(p.vista);
      return c.filter((x) => x.clave !== clave);
    });

  const cambiarAlt = (clave: string, alt: string) =>
    setCola((c) => c.map((x) => (x.clave === clave ? { ...x, alt, error: undefined } : x)));

  const subir = async () => {
    setAviso(null);
    // 1) Validar todo antes de enviar nada: así no queda media tanda subida por un error de texto.
    const revisada = cola.map((p) => {
      const r = esquemaAlt.safeParse(p.alt);
      return r.success ? { ...p, alt: r.data, error: undefined } : { ...p, error: r.error.issues[0].message };
    });
    setCola(revisada);
    setErrorLimpia(!limpia);
    const conError = revisada.find((p) => p.error);
    if (conError || !limpia) {
      setAviso({ ok: false, mensaje: "Revisa los campos marcados." });
      document.getElementById(conError ? `${campo}-${conError.clave}` : `${campo}-limpia`)?.focus();
      return;
    }

    // 2) Subir una por una.
    let subidas = 0;
    const fallidas: Pendiente[] = [];
    for (const [i, p] of revisada.entries()) {
      setProgreso(`Subiendo ${i + 1} de ${revisada.length}…`);
      try {
        const archivo = await reducirSiPesa(p.archivo, MAX_BYTES_FOTO, LADO_MAXIMO_FOTO);
        const fd = new FormData();
        fd.set("foto", archivo);
        fd.set("alt", p.alt);
        fd.set("limpia", "on");
        const r = await subirFoto(id, null, fd);
        if (r.ok) {
          subidas++;
          soltarVista(p.vista);
        } else {
          fallidas.push({ ...p, error: r.errores?.foto ?? r.errores?.alt ?? r.mensaje });
        }
      } catch (e) {
        fallidas.push({
          ...p,
          error: e instanceof FotoIlegible ? e.message : "No se pudo subir. Revisa tu conexión e inténtalo de nuevo.",
        });
      }
    }
    setProgreso(null);
    setCola(fallidas);
    if (fallidas.length === 0) setLimpia(false);

    const partes: string[] = [];
    if (subidas > 0) {
      partes.push(`${plural(subidas, "foto subida", "fotos subidas")} al final de la galería.`);
      if (!hayFotos) partes.push("La primera es la portada.");
    }
    if (fallidas.length > 0) partes.push(`${plural(fallidas.length, "no se pudo subir", "no se pudieron subir")}: revisa las marcadas.`);
    setAviso({ ok: fallidas.length === 0, mensaje: partes.join(" ") });
  };

  const ocupado = progreso !== null;

  return (
    <div className="rounded-2xl bg-light p-5 grid gap-5">
      <h3 className="font-black text-dark">Subir fotos</h3>
      <div aria-live="polite">{aviso && <Aviso ok={aviso.ok} mensaje={aviso.mensaje} />}</div>

      <label
        htmlFor={`${campo}-archivos`}
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          if (!ocupado) agregar(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary ${
          encima ? "border-primary bg-white" : "border-gray-300 bg-white/60 hover:border-primary"
        }`}
      >
        <ImagePlus className="w-8 h-8 text-primary" aria-hidden="true" />
        <span className="font-black text-dark">Elige o arrastra aquí tus fotos</span>
        <span className="text-sm text-gray-700">
          JPG, PNG o WebP, hasta {MAX_FOTOS_POR_TANDA} por vez. Puedes subirlas tal como salen del celular: si alguna pesa
          más de 4 MB, se reduce antes de enviarla.
        </span>
        <input
          ref={entrada}
          id={`${campo}-archivos`}
          type="file"
          multiple
          accept={TIPOS_FOTO.join(",")}
          disabled={ocupado}
          onChange={(e) => e.target.files && agregar(e.target.files)}
          className="sr-only"
        />
      </label>

      {cola.length > 0 && (
        <>
          <ul className="grid gap-3" aria-label="Fotos por subir">
            {cola.map((p, i) => (
              <li key={p.clave} className="grid grid-cols-[5rem_1fr_auto] gap-3 items-start rounded-xl bg-white border border-gray-200 p-3">
                <img src={p.vista} alt="" className="w-20 h-16 object-cover rounded-lg bg-gray-100" />
                <div className="min-w-0">
                  <label htmlFor={`${campo}-${p.clave}`} className={estilos.etiqueta}>
                    Descripción de la foto nueva {i + 1}
                  </label>
                  <input
                    id={`${campo}-${p.clave}`}
                    value={p.alt}
                    onChange={(e) => cambiarAlt(p.clave, e.target.value)}
                    maxLength={160}
                    disabled={ocupado}
                    placeholder="Ej. Sala con ventanal hacia el parque"
                    aria-invalid={p.error ? true : undefined}
                    aria-describedby={`${campo}-${p.clave}-archivo${p.error ? ` ${campo}-${p.clave}-error` : ""}`}
                    className={`${estilos.campo} ${p.error ? estilos.campoError : estilos.campoNormal}`}
                  />
                  <p id={`${campo}-${p.clave}-archivo`} className="mt-1 text-xs text-gray-600 truncate">
                    {p.archivo.name}
                  </p>
                  {p.error && (
                    <p id={`${campo}-${p.clave}-error`} className={estilos.error}>
                      {p.error}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => quitar(p.clave)}
                  disabled={ocupado}
                  aria-label={`Quitar de la lista la foto nueva ${i + 1}`}
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-sm text-gray-700 hover:text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-700 -mt-2">Describe qué se ve y dónde: lo leen los lectores de pantalla y los buscadores.</p>

          <div>
            <div className="flex items-start gap-3">
              <input
                id={`${campo}-limpia`}
                type="checkbox"
                checked={limpia}
                disabled={ocupado}
                onChange={(e) => {
                  setLimpia(e.target.checked);
                  setErrorLimpia(false);
                }}
                aria-invalid={errorLimpia ? true : undefined}
                aria-describedby={errorLimpia ? `${campo}-limpia-error` : undefined}
                className="mt-1 w-5 h-5 accent-primary"
              />
              <label htmlFor={`${campo}-limpia`} className="text-dark">
                Confirmo que {cola.length === 1 ? "la foto no muestra" : "ninguna foto muestra"} teléfonos, precios, logos ni
                marcas de agua, y que tenemos derecho a usarlas.
              </label>
            </div>
            {errorLimpia && (
              <p id={`${campo}-limpia-error`} className={estilos.error}>
                Confirma que las fotos no muestran teléfonos, precios ni marcas de agua.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={subir} disabled={ocupado} className={estilos.botonPrincipal}>
              <Upload className="w-4 h-4" aria-hidden="true" />
              {ocupado ? progreso : `Subir ${plural(cola.length, "foto", "fotos")}`}
            </button>
            <span role="status" className="sr-only">
              {progreso ?? ""}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default SubirFotos;
