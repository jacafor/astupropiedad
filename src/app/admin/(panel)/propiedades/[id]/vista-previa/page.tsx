import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FichaPropiedad from "@/components/FichaPropiedad";
import { InsigniaVisibilidad } from "@/components/admin/Insignias";
import { requerirAdmin } from "@/lib/admin/sesion";
import { obtenerParaAdmin } from "@/lib/catalogo/admin";
import { aPropiedadPublica } from "@/lib/catalogo/mapeo";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Vista previa" };

/** La ficha tal como se verá en el sitio, aunque sea un borrador. Sin analítica ni JSON-LD. */
const Page = async ({ params }: Props) => {
  const sesion = await requerirAdmin();
  const { id } = await params;
  const p = await obtenerParaAdmin(sesion, id);
  if (!p) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white border border-gray-200 p-4">
        <Link
          href={`/admin/propiedades/${p.uuid}`}
          className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mr-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
          Volver a editar
        </Link>
        <p className="text-sm text-gray-700">Vista previa: así se verá la ficha en el sitio.</p>
        <InsigniaVisibilidad valor={p.visibilidad} />
      </div>
      {p.fotos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-700">
          Sube al menos una foto para ver la vista previa: la ficha necesita una portada.
        </p>
      ) : (
        <div className="-mx-4 sm:-mx-6 lg:-mx-12 mt-6">
          <FichaPropiedad propiedad={aPropiedadPublica(p)} vistaPrevia />
        </div>
      )}
    </>
  );
};

export default Page;
