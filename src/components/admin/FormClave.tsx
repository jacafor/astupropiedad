"use client";

import { useActionState, useId } from "react";
import { KeyRound } from "lucide-react";
import { cambiarMiClave } from "@/app/admin/acciones-usuarios";
import { CLAVE_MINIMA } from "@/lib/admin/roles";
import type { ResultadoCambioClave } from "@/lib/admin/tipos";
import { Aviso, estilos } from "./ui";

type Campo = "actual" | "clave" | "confirmacion";

/** Cambiar la propia contraseña (/admin/cuenta). Con contraseña temporal no pide la actual. */
const FormClave = ({ pideActual, correo }: { pideActual: boolean; correo: string }) => {
  const [resultado, accion, enviando] = useActionState<ResultadoCambioClave | null, FormData>(cambiarMiClave, null);
  const id = useId();
  const errores = resultado?.errores ?? {};

  const campo = (nombre: Campo, etiqueta: string, autoComplete: string, ayuda?: string) => {
    const error = errores[nombre];
    const ayudaId = `${id}-${nombre}-ayuda`;
    const errorId = `${id}-${nombre}-error`;
    return (
      <div>
        <label htmlFor={`${id}-${nombre}`} className={estilos.etiqueta}>
          {etiqueta}
        </label>
        <input
          id={`${id}-${nombre}`}
          name={nombre}
          type="password"
          autoComplete={autoComplete}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={[ayuda ? ayudaId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined}
          className={`${estilos.campo} ${error ? estilos.campoError : estilos.campoNormal}`}
        />
        {ayuda && (
          <p id={ayudaId} className={estilos.ayuda}>
            {ayuda}
          </p>
        )}
        {error && (
          <p id={errorId} className={estilos.error}>
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    // key: tras guardar bien, el formulario se vacía (las contraseñas no deben quedar escritas).
    <form key={resultado?.ok ? "listo" : "editando"} action={accion} className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`} noValidate>
      <div aria-live="polite">{resultado && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}</div>
      {/* Para los gestores de contraseñas: a qué cuenta pertenece la nueva. */}
      <input type="email" name="usuario" autoComplete="username" value={correo} readOnly hidden />
      {pideActual && campo("actual", "Contraseña actual", "current-password")}
      {campo("clave", "Contraseña nueva", "new-password", `Al menos ${CLAVE_MINIMA} caracteres. Mejor una frase que solo tú recuerdes.`)}
      {campo("confirmacion", "Repite la contraseña nueva", "new-password")}
      <button type="submit" disabled={enviando} className={`${estilos.botonPrincipal} w-full sm:w-auto`}>
        <KeyRound className="w-4 h-4" aria-hidden="true" />
        {enviando ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
};

export default FormClave;
