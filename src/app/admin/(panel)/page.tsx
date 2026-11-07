import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, Pencil, Plus, Search } from "lucide-react";
import { InsigniaEstado, InsigniaVisibilidad } from "@/components/admin/Insignias";
import { Aviso, estilos } from "@/components/admin/ui";
import { ETIQUETA_OPERACION, ETIQUETA_TIPO } from "@/data/properties";
import { requerirAdmin } from "@/lib/admin/sesion";
import { hayFiltros, leerFiltros, listarParaAdmin } from "@/lib/catalogo/admin";
import { ESTADOS, ETIQUETA_ESTADO, ETIQUETA_VISIBILIDAD, OPERACIONES, VISIBILIDADES } from "@/lib/catalogo/esquema";
import { precioTexto } from "@/lib/propiedades";

export const metadata: Metadata = { title: "Propiedades" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

const Page = async ({ searchParams }: Props) => {
  const sesion = await requerirAdmin();
  const parametros = await searchParams;
  const filtros = leerFiltros(parametros);
  const bienvenida = parametros.bienvenida === "1";
  const propiedades = await listarParaAdmin(sesion, filtros);
  const filtrando = hayFiltros(filtros);

  return (
    <>
      <div className="mb-8">
        <span className={estilos.eyebrow}>Inventario</span>
        <h1 className={estilos.titulo}>Propiedades</h1>
      </div>

      {bienvenida && (
        <div className="mb-8">
          <Aviso ok mensaje="Contraseña guardada. Desde ahora entras con ella; ya puedes cargar y editar propiedades." />
        </div>
      )}

      <form role="search" aria-label="Filtrar propiedades" className={`${estilos.tarjeta} p-5 mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end`}>
        <div>
          <label htmlFor="f-q" className={estilos.etiqueta}>
            Buscar
          </label>
          <input
            id="f-q"
            name="q"
            type="search"
            defaultValue={filtros.q}
            placeholder="Título, código o distrito"
            className={`${estilos.campo} ${estilos.campoNormal}`}
          />
        </div>
        <div>
          <label htmlFor="f-operacion" className={estilos.etiqueta}>
            Operación
          </label>
          <select id="f-operacion" name="operacion" defaultValue={filtros.operacion} className={`${estilos.campo} ${estilos.campoNormal}`}>
            <option value="">Todas</option>
            {OPERACIONES.map((o) => (
              <option key={o} value={o}>
                {ETIQUETA_OPERACION[o]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-estado" className={estilos.etiqueta}>
            Estado
          </label>
          <select id="f-estado" name="estado" defaultValue={filtros.estado} className={`${estilos.campo} ${estilos.campoNormal}`}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-visibilidad" className={estilos.etiqueta}>
            En el sitio
          </label>
          <select
            id="f-visibilidad"
            name="visibilidad"
            defaultValue={filtros.visibilidad}
            className={`${estilos.campo} ${estilos.campoNormal}`}
          >
            <option value="">Activas (sin archivadas)</option>
            {VISIBILIDADES.map((v) => (
              <option key={v} value={v}>
                {ETIQUETA_VISIBILIDAD[v]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={estilos.botonSecundario}>
            <Search className="w-4 h-4" aria-hidden="true" />
            Filtrar
          </button>
          {filtrando && (
            <Link href="/admin" className={estilos.botonSecundario}>
              Quitar filtros
            </Link>
          )}
        </div>
      </form>

      <p className="text-sm text-gray-600 mb-4" aria-live="polite">
        {propiedades.length === 1 ? "1 propiedad" : `${propiedades.length} propiedades`}
        {filtrando ? " con estos filtros" : ""}
      </p>

      {propiedades.length === 0 ? (
        <div className={`${estilos.tarjeta} p-10 text-center`}>
          {filtrando ? (
            <>
              <p className="text-lg font-black text-dark mb-2">Ninguna propiedad coincide con los filtros.</p>
              <Link href="/admin" className="text-primary font-black text-xs uppercase tracking-widest hover:underline">
                Quitar filtros
              </Link>
            </>
          ) : (
            <>
              <p className="text-lg font-black text-dark mb-2">Aún no hay propiedades.</p>
              <p className="text-gray-700 mb-6">Crea la primera; quedará como borrador hasta que la publiques.</p>
              <Link href="/admin/propiedades/nueva" className={estilos.botonPrincipal}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Nueva propiedad
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="grid gap-4">
          {propiedades.map((p) => (
            <li key={p.uuid} className={`${estilos.tarjeta} p-4 flex flex-col sm:flex-row gap-4 sm:items-center`}>
              <div className="relative w-full sm:w-36 aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                {p.fotos[0] ? (
                  <Image src={p.fotos[0].url} alt="" fill sizes="(min-width: 640px) 144px, 100vw" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 text-xs font-bold">
                    <ImageOff className="w-6 h-6 mb-1" aria-hidden="true" />
                    Sin fotos
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <InsigniaVisibilidad valor={p.visibilidad} />
                  <InsigniaEstado valor={p.estado} />
                </div>
                <h2 className="font-black text-dark text-lg leading-tight">{p.titulo}</h2>
                <p className="text-sm text-gray-700">
                  {p.id} · {ETIQUETA_OPERACION[p.operacion]} · {ETIQUETA_TIPO[p.tipo]} · {p.distrito} · {precioTexto(p)}
                </p>
                <p className="text-xs text-gray-600 mt-1">Actualizada: {fecha.format(new Date(p.actualizadaEn))}</p>
              </div>
              <Link href={`/admin/propiedades/${p.uuid}`} className={estilos.botonSecundario}>
                <Pencil className="w-4 h-4" aria-hidden="true" />
                Editar<span className="sr-only"> {p.titulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Page;
