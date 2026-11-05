"use client";

import { startTransition, useActionState, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import { actualizarAlt, moverFoto, quitarFoto, subirFoto } from "@/app/admin/acciones";
import type { DireccionFoto, ResultadoAccion, ResultadoFoto } from "@/lib/admin/tipos";
import { LADO_MAXIMO_FOTO, MAX_BYTES_FOTO, TIPOS_FOTO } from "@/lib/catalogo/esquema";
import { FotoIlegible, reducirSiPesa } from "@/lib/catalogo/reducir";
import type { FotoAdmin } from "@/lib/catalogo/mapeo";
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

/**
 * Subir, describir, ordenar y quitar fotos. La primera es la portada. El orden se cambia con
 * botones (funciona con teclado y lector de pantalla; no hay arrastrar y soltar).
 */
const GestorFotos = ({ id, fotos }: Props) => {
  const campo = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [reduciendo, setReduciendo] = useState(false);
  const [resultado, enviar, subiendo] = useActionState<ResultadoFoto | null, FormData>(async (previo, fd) => {
    const r = await subirFoto(id, previo, fd);
    // Solo se vacía el formulario si la foto se guardó: si falla, lo elegido y escrito sigue ahí.
    if (r.ok) formRef.current?.reset();
    return r;
  }, null);
  const [accion, setAccion] = useState<ResultadoAccion | null>(null);
  const [pendiente, iniciar] = useTransition();
  const errores = resultado?.errores ?? {};

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const archivo = fd.get("foto");
    setErrorLocal(null);
    // Las fotos de celular de más de 4 MB se reducen aquí (Vercel no acepta envíos mayores);
    // el servidor repite todas las comprobaciones.
    if (archivo instanceof File && archivo.size > MAX_BYTES_FOTO) {
      setReduciendo(true);
      try {
        fd.set("foto", await reducirSiPesa(archivo, MAX_BYTES_FOTO, LADO_MAXIMO_FOTO));
      } catch (error) {
        setErrorLocal(error instanceof FotoIlegible ? error.message : "No se pudo reducir la foto. Redúcela antes de subirla.");
        return;
      } finally {
        setReduciendo(false);
      }
    }
    startTransition(() => enviar(fd));
  };

  const mover = (fotoId: string, direccion: DireccionFoto) =>
    iniciar(async () => setAccion(await moverFoto(id, fotoId, direccion)));

  const quitar = (foto: FotoAdmin, numero: number) => {
    if (!window.confirm(`¿Quitar la foto ${numero}? Se borra del almacenamiento y no se puede deshacer.`)) return;
    iniciar(async () => setAccion(await quitarFoto(id, foto.id)));
  };

  const errorFoto = errorLocal ?? errores.foto;

  return (
    <section aria-labelledby="fotos" className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`}>
      <div>
        <h2 id="fotos" className="text-xl font-serif font-black text-dark">
          Fotos <span className="font-sans text-base font-bold text-gray-600">({fotos.length})</span>
        </h2>
        <p className="text-gray-700 mt-1">
          La primera es la portada. Se convierten a WebP y se les quitan los datos de ubicación. Usa fotos limpias: sin
          teléfonos, precios, logos ni marcas de agua.
        </p>
      </div>

      <div aria-live="polite">{accion && <Aviso ok={accion.ok} mensaje={accion.mensaje} />}</div>

      {fotos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-700">
          Aún no hay fotos. Sube la primera: será la portada.
        </p>
      ) : (
        <ol className="grid gap-4">
          {fotos.map((f, i) => (
            <li key={f.id} className="grid gap-4 sm:grid-cols-[10rem_1fr] rounded-2xl border border-gray-200 p-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                <Image src={f.url} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
                {i === 0 && (
                  <span className={`${estilos.insignia} absolute top-2 left-2 bg-primary text-white`}>Portada</span>
                )}
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
                    disabled={pendiente || i === fotos.length - 1}
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
            </li>
          ))}
        </ol>
      )}

      <form ref={formRef} onSubmit={onSubmit} noValidate className="rounded-2xl bg-light p-5 grid gap-5">
        <h3 className="font-black text-dark">Subir una foto</h3>
        {resultado && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}
        <div>
          <label htmlFor={`${campo}-foto`} className={estilos.etiqueta}>
            Archivo (JPG, PNG o WebP)
          </label>
          <p id={`${campo}-foto-ayuda`} className={estilos.ayuda}>
            Puedes subirla tal como sale del celular: si pesa más de 4 MB, se reduce antes de enviarla.
          </p>
          <input
            id={`${campo}-foto`}
            name="foto"
            type="file"
            accept={TIPOS_FOTO.join(",")}
            aria-invalid={errorFoto ? true : undefined}
            aria-describedby={`${campo}-foto-ayuda${errorFoto ? ` ${campo}-foto-error` : ""}`}
            className="block w-full text-base text-dark file:mr-4 file:min-h-11 file:rounded-sm file:border-0 file:bg-dark file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white"
          />
          {errorFoto && (
            <p id={`${campo}-foto-error`} className={estilos.error}>
              {errorFoto}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={`${campo}-alt`} className={estilos.etiqueta}>
            Descripción de la foto
          </label>
          <input
            id={`${campo}-alt`}
            name="alt"
            maxLength={160}
            placeholder="Ej. Sala con ventanal hacia el parque"
            aria-invalid={errores.alt ? true : undefined}
            aria-describedby={`${campo}-alt-ayuda${errores.alt ? ` ${campo}-alt-error` : ""}`}
            className={`${estilos.campo} ${errores.alt ? estilos.campoError : estilos.campoNormal}`}
          />
          <p id={`${campo}-alt-ayuda`} className={estilos.ayuda}>
            Qué se ve y dónde. La leen los lectores de pantalla y los buscadores.
          </p>
          {errores.alt && (
            <p id={`${campo}-alt-error`} className={estilos.error}>
              {errores.alt}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-start gap-3">
            <input
              id={`${campo}-limpia`}
              name="limpia"
              type="checkbox"
              aria-invalid={errores.limpia ? true : undefined}
              aria-describedby={errores.limpia ? `${campo}-limpia-error` : undefined}
              className="mt-1 w-5 h-5 accent-primary"
            />
            <label htmlFor={`${campo}-limpia`} className="text-dark">
              Confirmo que la foto no muestra teléfonos, precios, logos ni marcas de agua, y que tenemos derecho a usarla.
            </label>
          </div>
          {errores.limpia && (
            <p id={`${campo}-limpia-error`} className={estilos.error}>
              {errores.limpia}
            </p>
          )}
        </div>
        <div>
          <button type="submit" disabled={subiendo || reduciendo} className={estilos.botonPrincipal}>
            <Upload className="w-4 h-4" aria-hidden="true" />
            {reduciendo ? "Reduciendo la foto…" : subiendo ? "Subiendo y convirtiendo…" : "Subir foto"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default GestorFotos;
