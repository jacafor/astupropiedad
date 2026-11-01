"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { Save } from "lucide-react";
import { ETIQUETA_OPERACION, ETIQUETA_TIPO, MONEDA_POR_OPERACION, type Operacion } from "@/data/properties";
import type { ResultadoFormulario } from "@/lib/admin/tipos";
import { ESTADOS, ETIQUETA_ESTADO, OPERACIONES, TIPOS, type CampoPropiedad } from "@/lib/catalogo/esquema";
import type { PropiedadAdmin } from "@/lib/catalogo/mapeo";
import { Aviso, estilos } from "./ui";

type Accion = (previo: ResultadoFormulario | null, fd: FormData) => Promise<ResultadoFormulario>;

type Props = {
  accion: Accion;
  inicial?: PropiedadAdmin;
  /** Tras publicar, el slug queda fijo (enlaces y sitemap). */
  slugBloqueado?: boolean;
};

/**
 * Crear o editar una propiedad. El envío se hace con `onSubmit` + `startTransition` en lugar de
 * `<form action>` para que React no vacíe el formulario: si algo falla, no se pierde lo escrito.
 */
/** Campos que llevan texto de ayuda debajo (se enlaza con aria-describedby). */
const CON_AYUDA = new Set<CampoPropiedad>([
  "codigo",
  "titulo",
  "operacion",
  "distrito",
  "precio",
  "estado",
  "areaTotalM2",
  "descripcion",
  "caracteristicas",
  "slug",
]);

const FormPropiedad = ({ accion, inicial, slugBloqueado = false }: Props) => {
  const [sinGuardar, setSinGuardar] = useState(false);
  // La acción envuelta marca "guardado" al terminar bien (no hace falta un efecto para eso).
  const [resultado, enviar, guardando] = useActionState<ResultadoFormulario | null, FormData>(async (previo, fd) => {
    const r = await accion(previo, fd);
    if (r.ok) setSinGuardar(false);
    return r;
  }, null);
  const [operacion, setOperacion] = useState<Operacion>(inicial?.operacion ?? "venta");
  const id = useId();
  const resumenRef = useRef<HTMLDivElement>(null);
  const errores = resultado?.errores ?? {};

  // Tras guardar, lleva el foco al resultado (éxito o lista de errores).
  useEffect(() => {
    if (resultado) resumenRef.current?.focus();
  }, [resultado]);

  // Avisa antes de salir con cambios sin guardar.
  useEffect(() => {
    if (!sinGuardar) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [sinGuardar]);

  const props = (campo: CampoPropiedad) => ({
    id: `${id}-${campo}`,
    name: campo,
    "aria-invalid": errores[campo] ? true : undefined,
    "aria-describedby":
      [errores[campo] ? `${id}-${campo}-error` : "", CON_AYUDA.has(campo) ? `${id}-${campo}-ayuda` : ""].join(" ").trim() ||
      undefined,
    className: `${estilos.campo} ${errores[campo] ? estilos.campoError : estilos.campoNormal}`,
  });

  const etiqueta = (campo: CampoPropiedad, texto: string, opcional = false) => (
    <label htmlFor={`${id}-${campo}`} className={estilos.etiqueta}>
      {texto}
      {opcional && <span className="normal-case tracking-normal font-bold"> (opcional)</span>}
    </label>
  );

  const error = (campo: CampoPropiedad) =>
    errores[campo] ? (
      <p id={`${id}-${campo}-error`} className={estilos.error}>
        {errores[campo]}
      </p>
    ) : null;

  const ayuda = (campo: CampoPropiedad, contenido: React.ReactNode) => (
    <p id={`${id}-${campo}-ayuda`} className={estilos.ayuda}>
      {contenido}
    </p>
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => enviar(fd));
  };

  const numero = { inputMode: "decimal" as const, autoComplete: "off" };

  return (
    <form onSubmit={onSubmit} onChange={() => setSinGuardar(true)} noValidate className="space-y-8">
      <div ref={resumenRef} tabIndex={-1} className="focus-visible:outline-none">
        {resultado && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}
      </div>

      <fieldset className={`${estilos.tarjeta} p-6 sm:p-8 grid gap-6 md:grid-cols-2`}>
        <legend className="sr-only">Datos principales</legend>
        <h2 className="md:col-span-2 text-xl font-serif font-black text-dark">Datos principales</h2>
        <div>
          {etiqueta("codigo", `Código de referencia`)}
          <input {...props("codigo")} defaultValue={inicial?.id} autoComplete="off" maxLength={20} />
          {ayuda("codigo", <>Corto y único, ej. JM-001. Se muestra en la ficha y en el mensaje de WhatsApp.</>)}
          {error("codigo")}
        </div>
        <div>
          {etiqueta("titulo", `Título`)}
          <input {...props("titulo")} defaultValue={inicial?.titulo} maxLength={90} />
          {ayuda("titulo", <>Unos 40 caracteres. Sin precio ni teléfono.</>)}
          {error("titulo")}
        </div>
        <div>
          {etiqueta("operacion", `Operación`)}
          <select
            {...props("operacion")}
            defaultValue={operacion}
            onChange={(e) => setOperacion(e.target.value as Operacion)}
          >
            {OPERACIONES.map((o) => (
              <option key={o} value={o}>
                {ETIQUETA_OPERACION[o]}
              </option>
            ))}
          </select>
          {ayuda("operacion", <>
            Moneda: <strong>{MONEDA_POR_OPERACION[operacion] === "USD" ? "dólares (USD)" : "soles (PEN)"}</strong>. La venta se
            publica en dólares y el alquiler en soles.
          </>)}
          {error("operacion")}
        </div>
        <div>
          {etiqueta("tipo", `Tipo de inmueble`)}
          <select {...props("tipo")} defaultValue={inicial?.tipo ?? "departamento"}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {ETIQUETA_TIPO[t]}
              </option>
            ))}
          </select>
          {error("tipo")}
        </div>
        <div>
          {etiqueta("distrito", `Distrito`)}
          <input {...props("distrito")} defaultValue={inicial?.distrito} maxLength={60} />
          {ayuda("distrito", <>Solo el distrito: la dirección exacta no se publica.</>)}
          {error("distrito")}
        </div>
        <div>
          {etiqueta("precio", `Precio (${MONEDA_POR_OPERACION[operacion]})`)}
          <input {...props("precio")} {...numero} defaultValue={inicial?.precio} />
          {ayuda("precio", <>Solo el número, sin símbolo ni puntos de miles.</>)}
          {error("precio")}
        </div>
        <div>
          {etiqueta("estado", `Estado`)}
          <select {...props("estado")} defaultValue={inicial?.estado ?? "disponible"}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
          {ayuda("estado", <>En el catálogo solo salen las disponibles; las reservadas y vendidas conservan su ficha.</>)}
          {error("estado")}
        </div>
        <div className="flex items-start gap-3 md:pt-8">
          <input
            id={`${id}-destacada`}
            name="destacada"
            type="checkbox"
            defaultChecked={inicial?.destacada ?? false}
            className="mt-1 w-5 h-5 accent-primary"
          />
          <label htmlFor={`${id}-destacada`} className="text-dark">
            <span className="font-black">Destacada</span>
            <span className="block text-sm text-gray-600">Aparece en la home (máximo 2, las más recientes).</span>
          </label>
        </div>
      </fieldset>

      <fieldset className={`${estilos.tarjeta} p-6 sm:p-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3`}>
        <legend className="sr-only">Superficie y ambientes</legend>
        <h2 className="sm:col-span-2 lg:col-span-3 text-xl font-serif font-black text-dark">Superficie y ambientes</h2>
        <div>
          {etiqueta("areaConstruidaM2", `Área construida (m²)`)}
          <input {...props("areaConstruidaM2")} {...numero} defaultValue={inicial?.areaConstruidaM2} />
          {error("areaConstruidaM2")}
        </div>
        <div>
          {etiqueta("areaTotalM2", "Área total (m²)", true)}
          <input {...props("areaTotalM2")} {...numero} defaultValue={inicial?.areaTotalM2} />
          {ayuda("areaTotalM2", <>Solo si es distinta de la construida (terreno, jardín).</>)}
          {error("areaTotalM2")}
        </div>
        <div>
          {etiqueta("dormitorios", `Dormitorios`)}
          <input {...props("dormitorios")} inputMode="numeric" defaultValue={inicial?.dormitorios ?? 0} />
          {error("dormitorios")}
        </div>
        <div>
          {etiqueta("banos", `Baños`)}
          <input {...props("banos")} inputMode="numeric" defaultValue={inicial?.banos ?? 0} />
          {error("banos")}
        </div>
        <div>
          {etiqueta("cocheras", `Cocheras`)}
          <input {...props("cocheras")} inputMode="numeric" defaultValue={inicial?.cocheras ?? 0} />
          {error("cocheras")}
        </div>
      </fieldset>

      <fieldset className={`${estilos.tarjeta} p-6 sm:p-8 grid gap-6`}>
        <legend className="sr-only">Descripción</legend>
        <h2 className="text-xl font-serif font-black text-dark">Descripción</h2>
        <div>
          {etiqueta("descripcion", `Descripción`)}
          <textarea {...props("descripcion")} rows={8} defaultValue={inicial?.descripcion} maxLength={5000} />
          {ayuda("descripcion", <>Sin teléfonos ni promesas absolutas (&quot;garantizado&quot;, &quot;100 % seguro&quot;).</>)}
          {error("descripcion")}
        </div>
        <div>
          {etiqueta("caracteristicas", "Características", true)}
          <textarea {...props("caracteristicas")} rows={5} defaultValue={inicial?.caracteristicas?.join("\n")} />
          {ayuda("caracteristicas", <>Una por línea (ascensor, terraza…). Hasta 20.</>)}
          {error("caracteristicas")}
        </div>
        <div>
          {etiqueta("slug", "Dirección web", true)}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 shrink-0">/propiedades/</span>
            <input
              {...props("slug")}
              defaultValue={inicial?.slug}
              readOnly={slugBloqueado}
              autoComplete="off"
              maxLength={100}
              className={`${props("slug").className} ${slugBloqueado ? "bg-gray-100 text-gray-700" : ""}`}
            />
          </div>
          {ayuda("slug", <>
            {slugBloqueado
              ? "Ya se publicó: la dirección no cambia para no romper los enlaces compartidos."
              : "Si la dejas vacía se crea con el título y el código. Después de publicar ya no se puede cambiar."}
          </>)}
          {error("slug")}
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-light/95 backdrop-blur border-t border-gray-200 sm:border-0 px-4 sm:px-0 py-4 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={guardando} className={estilos.botonPrincipal}>
          <Save className="w-4 h-4" aria-hidden="true" />
          {guardando ? "Guardando…" : inicial ? "Guardar cambios" : "Crear propiedad"}
        </button>
        {sinGuardar && !guardando && <p className="text-sm text-gray-700">Tienes cambios sin guardar.</p>}
      </div>
    </form>
  );
};

export default FormPropiedad;
