import type { Metadata } from "next";
import FormClave from "@/components/admin/FormClave";
import { estilos } from "@/components/admin/ui";
import { DESCRIPCION_ROL, ETIQUETA_ROL } from "@/lib/admin/roles";
import { requerirAdmin } from "@/lib/admin/sesion";

export const metadata: Metadata = { title: "Mi cuenta" };

const Page = async () => {
  const { correo, rol, debeCambiarClave } = await requerirAdmin({ permitirClavePendiente: true });

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <span className={estilos.eyebrow}>Mi cuenta</span>
        <h1 className={estilos.titulo}>{debeCambiarClave ? "Elige tu contraseña" : "Tu contraseña"}</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          {debeCambiarClave
            ? "Entraste con una contraseña temporal. Elige una propia para seguir; desde ahora entrarás con ella."
            : "Cámbiala cuando quieras. Nadie más la ve: si la olvidas, pide a un administrador una contraseña temporal."}
        </p>
      </div>

      <dl className={`${estilos.tarjeta} p-6 mb-6 grid gap-4 sm:grid-cols-2`}>
        <div className="min-w-0">
          <dt className={estilos.etiqueta}>Correo</dt>
          <dd className="text-dark font-bold break-all">{correo}</dd>
        </div>
        <div>
          <dt className={estilos.etiqueta}>Rol</dt>
          <dd className="text-dark font-bold">{ETIQUETA_ROL[rol]}</dd>
          <dd className="text-sm text-gray-600 mt-1">{DESCRIPCION_ROL[rol]}</dd>
        </div>
      </dl>

      <FormClave pideActual={!debeCambiarClave} correo={correo} />
    </div>
  );
};

export default Page;
