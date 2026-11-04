import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormPropiedad from "@/components/admin/FormPropiedad";
import { estilos } from "@/components/admin/ui";
import { requerirAdmin } from "@/lib/admin/sesion";
import { guardarPropiedad } from "../../../acciones";

export const metadata: Metadata = { title: "Nueva propiedad" };

const Page = async () => {
  await requerirAdmin();
  return (
    <>
      <Link href="/admin" className="inline-flex items-center text-primary font-black text-xs uppercase tracking-widest hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Volver al listado
      </Link>
      <div className="mb-8">
        <span className={estilos.eyebrow}>Paso 1 de 2 · datos</span>
        <h1 className={estilos.titulo}>Nueva propiedad</h1>
        <p className="text-gray-700 mt-2 max-w-2xl">
          Se guarda como borrador: nadie la ve hasta que subas al menos una foto y la publiques. Usa solo datos reales
          que te haya entregado el cliente.
        </p>
      </div>
      <FormPropiedad accion={guardarPropiedad.bind(null, null)} />
    </>
  );
};

export default Page;
