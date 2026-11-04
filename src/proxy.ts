import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { leerConfigSupabase } from "@/lib/supabase/config";

const INGRESO = "/admin/ingresar";

/**
 * Solo corre en /admin (ver `config.matcher`): el sitio público no pasa por aquí.
 * Refresca la sesión de Supabase en las cookies y manda a la pantalla de ingreso a quien no tenga
 * sesión. Es un filtro rápido; la comprobación de administrador la hace `requerirAdmin()` en cada
 * página y acción (src/lib/admin/sesion.ts).
 */
export async function proxy(request: NextRequest) {
  const supa = leerConfigSupabase();
  // Sin Supabase configurado, /admin muestra su propio aviso.
  if (!supa) return NextResponse.next({ request });

  let respuesta = NextResponse.next({ request });
  const supabase = createServerClient(supa.url, supa.clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (porGuardar) => {
        porGuardar.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        porGuardar.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const enIngreso = pathname === INGRESO;

  if (!user && !enIngreso) {
    const destino = NextResponse.redirect(new URL(INGRESO, request.url));
    respuesta.cookies.getAll().forEach((c) => destino.cookies.set(c));
    return destino;
  }

  // Las páginas de /admin dependen de la sesión: que nadie las guarde en caché.
  respuesta.headers.set("Cache-Control", "private, no-store");
  return respuesta;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
