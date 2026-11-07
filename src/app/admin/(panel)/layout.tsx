import Link from "next/link";
import { ExternalLink, LogOut, Plus, UserRound, Users } from "lucide-react";
import { estilos } from "@/components/admin/ui";
import { puedeGestionarUsuarios } from "@/lib/admin/roles";
import { requerirAdmin } from "@/lib/admin/sesion";
import { BRAND_NAME } from "@/lib/contact";
import { salir } from "../acciones";

/** Cabecera del administrador. Cada página vuelve a llamar a `requerirAdmin()` (el layout no se repinta al navegar). */
const PanelLayout = async ({ children }: { children: React.ReactNode }) => {
  // La página de cambiar la contraseña temporal también usa este layout: aquí no se redirige.
  const { correo, rol, debeCambiarClave } = await requerirAdmin({ permitirClavePendiente: true });

  return (
    <>
      <header className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/admin" className="font-serif font-black text-lg mr-auto">
            {BRAND_NAME} <span className="font-sans text-xs font-black uppercase tracking-widest text-gray-300">· Admin</span>
          </Link>
          <nav aria-label="Administrador" className="flex flex-wrap items-center gap-2">
            {!debeCambiarClave && (
              <Link href="/admin/propiedades/nueva" className={estilos.botonPrincipal}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Nueva propiedad
              </Link>
            )}
            {!debeCambiarClave && puedeGestionarUsuarios(rol) && (
              <Link href="/admin/usuarios" className={estilos.enlaceCabecera}>
                <Users className="w-4 h-4" aria-hidden="true" />
                Usuarios
              </Link>
            )}
            <Link href="/admin/cuenta" className={estilos.enlaceCabecera}>
              <UserRound className="w-4 h-4" aria-hidden="true" />
              Mi cuenta
            </Link>
            <a
              href="/propiedades"
              target="_blank"
              rel="noopener noreferrer"
              className={estilos.enlaceCabecera}
            >
              Ver sitio
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          </nav>
          <form action={salir} className="flex items-center gap-3">
            {/* Con "Usuarios" y "Mi cuenta" la cabecera ya no cabe en una línea con el correo hasta 1536 px; "Mi cuenta" lo muestra. */}
            <span className="hidden 2xl:inline text-sm text-gray-300">{correo}</span>
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
