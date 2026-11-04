import Link from "next/link";
import { ExternalLink, LogOut, Plus } from "lucide-react";
import { estilos } from "@/components/admin/ui";
import { requerirAdmin } from "@/lib/admin/sesion";
import { BRAND_NAME } from "@/lib/contact";
import { salir } from "../acciones";

/** Cabecera del administrador. Cada página vuelve a llamar a `requerirAdmin()` (el layout no se repinta al navegar). */
const PanelLayout = async ({ children }: { children: React.ReactNode }) => {
  const { correo } = await requerirAdmin();

  return (
    <>
      <header className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/admin" className="font-serif font-black text-lg mr-auto">
            {BRAND_NAME} <span className="font-sans text-xs font-black uppercase tracking-widest text-gray-300">· Admin</span>
          </Link>
          <nav aria-label="Administrador" className="flex flex-wrap items-center gap-2">
            <Link href="/admin/propiedades/nueva" className={estilos.botonPrincipal}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Nueva propiedad
            </Link>
            <a
              href="/propiedades"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-11 px-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white"
            >
              Ver sitio
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          </nav>
          <form action={salir} className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-gray-300">{correo}</span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-11 px-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              Salir
            </button>
          </form>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">{children}</div>
    </>
  );
};

export default PanelLayout;
