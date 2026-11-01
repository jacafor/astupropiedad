import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SinConfiguracion } from "@/components/admin/ui";
import { obtenerAdmin } from "@/lib/admin/sesion";
import { BRAND_NAME } from "@/lib/contact";
import { leerConfigSupabase } from "@/lib/supabase/config";
import FormIngreso from "./FormIngreso";

export const metadata: Metadata = { title: "Ingresar" };

const Page = async () => {
  if (!leerConfigSupabase()) {
    return (
      <div className="px-4 py-16">
        <SinConfiguracion />
      </div>
    );
  }
  if (await obtenerAdmin()) redirect("/admin");

  return (
    <div className="px-4 py-16 sm:py-24">
      <div className="max-w-md mx-auto">
        <p className="text-secondary-dark font-black tracking-widest uppercase text-xs mb-2">{BRAND_NAME}</p>
        <h1 className="text-4xl font-serif font-black text-dark mb-2">Administrador</h1>
        <p className="text-gray-700 mb-8">Ingresa con la cuenta que te dio quien administra el sitio.</p>
        <FormIngreso />
      </div>
    </div>
  );
};

export default Page;
