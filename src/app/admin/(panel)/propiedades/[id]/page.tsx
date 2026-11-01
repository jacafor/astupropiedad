import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FormPropiedad from "@/components/admin/FormPropiedad";
import GestorFotos from "@/components/admin/GestorFotos";
import Publicacion from "@/components/admin/Publicacion";
import { Aviso, estilos } from "@/components/admin/ui";
import { requerirAdmin } from "@/lib/admin/sesion";
import { obtenerParaAdmin } from "@/lib/catalogo/admin";
import { guardarPropiedad } from "../../../acciones";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Editar propiedad" };

const Page = async ({ params, searchParams }: Props) => {
  const sesion = await requerirAdmin();
  const { id } = await params;
  const recienCreada = (await searchParams).creada === "1";
  const p = await obtenerParaAdmin(sesion, id);
  if (!p) notFound();

  return (
    <>
      <Link href="/admin" className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Volver al listado
      </Link>
      <div className="mb-8">
        <span className={estilos.eyebrow}>{p.id}</span>
        <h1 className={estilos.titulo}>{p.titulo}</h1>
      </div>

      {recienCreada && (
        <div className="mb-8">
          <Aviso ok mensaje="Propiedad creada como borrador. Paso 2 de 2: sube las fotos y publícala cuando esté lista." />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="space-y-8 min-w-0">
          <GestorFotos id={p.uuid} fotos={p.fotos} />
          <FormPropiedad accion={guardarPropiedad.bind(null, p.uuid)} inicial={p} slugBloqueado={p.publicadaEn !== null} />
        </div>
        <div className="lg:sticky lg:top-6 order-first lg:order-none">
          <Publicacion
            id={p.uuid}
            slug={p.slug}
            visibilidad={p.visibilidad}
            estado={p.estado}
            cantidadFotos={p.fotos.length}
          />
        </div>
      </div>
    </>
  );
};

export default Page;
