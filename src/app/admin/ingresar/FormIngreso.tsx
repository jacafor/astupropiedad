"use client";

import { useActionState, useId } from "react";
import { LogIn } from "lucide-react";
import { Aviso, estilos } from "@/components/admin/ui";
import type { ResultadoAccion } from "@/lib/admin/tipos";
import { ingresar } from "../acciones";

const FormIngreso = () => {
  const [resultado, accion, enviando] = useActionState<ResultadoAccion | null, FormData>(ingresar, null);
  const id = useId();

  return (
    <form action={accion} className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`} noValidate>
      {resultado && !resultado.ok && <Aviso ok={false} mensaje={resultado.mensaje} />}
      <div>
        <label htmlFor={`${id}-correo`} className={estilos.etiqueta}>
          Correo
        </label>
        <input
          id={`${id}-correo`}
          name="correo"
          type="email"
          autoComplete="username"
          required
          className={`${estilos.campo} ${estilos.campoNormal}`}
        />
      </div>
      <div>
        <label htmlFor={`${id}-clave`} className={estilos.etiqueta}>
          Contraseña
        </label>
        <input
          id={`${id}-clave`}
          name="clave"
          type="password"
          autoComplete="current-password"
          required
          className={`${estilos.campo} ${estilos.campoNormal}`}
        />
      </div>
      <button type="submit" disabled={enviando} className={`${estilos.botonPrincipal} w-full`}>
        <LogIn className="w-4 h-4" aria-hidden="true" />
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
};

export default FormIngreso;
