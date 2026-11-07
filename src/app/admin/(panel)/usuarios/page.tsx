import type { Metadata } from "next";
import { FilaUsuario, FormNuevoUsuario } from "@/components/admin/Usuarios";
import { Aviso, estilos } from "@/components/admin/ui";
import { requerirAdministrador } from "@/lib/admin/sesion";
import { ETIQUETA_ACCION, leerRegistro, listarUsuarios } from "@/lib/admin/usuarios";
import { SITE_URL } from "@/lib/contact";
import { leerClaveSecreta } from "@/lib/supabase/servicio";

export const metadata: Metadata = { title: "Usuarios" };

const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

/** Gestión de accesos al administrador (D-35). Solo rol administrador; un editor vuelve a /admin. */
const Page = async () => {
  const sesion = await requerirAdministrador();
  const [usuarios, registro] = await Promise.all([listarUsuarios(sesion), leerRegistro(sesion)]);
  const habilitado = leerClaveSecreta() !== null;
  const urlIngreso = `${SITE_URL}/admin/ingresar`;

  return (
    <>
      <div className="mb-8">
        <span className={estilos.eyebrow}>Accesos</span>
        <h1 className={estilos.titulo}>Usuarios</h1>
        <p className="mt-4 text-gray-700 max-w-2xl leading-relaxed">
          Quién puede entrar a este administrador y qué puede hacer. Los <strong>editores</strong> cargan y editan propiedades; los{" "}
          <strong>administradores</strong>, además, dan y quitan accesos.
        </p>
      </div>

      {!habilitado && (
        <div className="mb-8">
          <Aviso
            ok={false}
            mensaje="Puedes ver la lista, pero para crear o cambiar usuarios falta configurar la clave secreta de Supabase (SUPABASE_SECRET_KEY) en el servidor. Ver docs/INTEGRACIONES.md."
          />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <FormNuevoUsuario habilitado={habilitado} urlIngreso={urlIngreso} />

        <section aria-labelledby="con-acceso">
          <h2 id="con-acceso" className="text-xl font-serif font-black text-dark mb-4">
            Con acceso <span className="font-sans text-base font-bold text-gray-600">({usuarios.length})</span>
          </h2>
          <ul className="grid gap-4">
            {usuarios.map((u) => (
              <FilaUsuario key={u.id} usuario={u} esYo={u.id === sesion.userId} habilitado={habilitado} urlIngreso={urlIngreso} />
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="registro" className="mt-12">
        <h2 id="registro" className="text-xl font-serif font-black text-dark mb-2">
          Registro de cambios
        </h2>
        <p className="text-sm text-gray-600 mb-4">Los últimos {registro.length === 0 ? "" : `${registro.length} `}cambios de accesos, del más reciente al más antiguo.</p>
        {registro.length === 0 ? (
          <p className={`${estilos.tarjeta} p-6 text-gray-700`}>Aún no hay cambios registrados desde este panel.</p>
        ) : (
          <ol className={`${estilos.tarjeta} divide-y divide-gray-100`}>
            {registro.map((r) => (
              <li key={r.id} className="p-4 sm:px-6 text-sm text-gray-700 leading-relaxed">
                <time dateTime={r.creadoEn} className="block text-xs text-gray-600">
                  {fecha.format(new Date(r.creadoEn))}
                </time>
                <span className="break-all">
                  <strong className="text-dark">{r.actorCorreo}</strong> {ETIQUETA_ACCION[r.accion]?.toLowerCase() ?? r.accion}{" "}
                  <strong className="text-dark">{r.objetivoCorreo}</strong>
                  {r.detalle ? ` (${r.detalle})` : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
};

export default Page;
