import React from "react";
import Link from "next/link";

type Props = {
  /** Id base: el campo usa `id`, y el mensaje de error `${id}-error`. */
  id: string;
  checked: boolean;
  onChange: (marcada: boolean) => void;
  /** Mensaje de error; si existe, el campo se marca como inválido. */
  error?: string;
  /** Nombre del campo en el formulario (lo lee la Server Action). */
  name?: string;
  /** Texto antes del enlace; por defecto el de la casilla de leads. */
  texto?: React.ReactNode;
  /** "claro" para fondos blancos, "oscuro" para fondos dark/primary. */
  variante?: "claro" | "oscuro";
};

const ESTILOS = {
  claro: { texto: "text-gray-600", error: "text-red-700", enlace: "text-primary hover:text-dark" },
  oscuro: { texto: "text-gray-300", error: "text-red-300", enlace: "text-white hover:text-secondary" },
} as const;

/**
 * Casilla de consentimiento de datos personales (obligatoria, sin premarcar).
 * Reutilizable en cualquier formulario; la validación real vive en el servidor
 * (`consentimiento` en src/lib/leads.ts).
 */
const ConsentCheckbox = ({
  id,
  checked,
  onChange,
  error,
  name = "consentimiento",
  texto = "Acepto que AS Tupropiedad use mis datos para contactarme sobre mi consulta, según la",
  variante = "claro",
}: Props) => {
  const e = ESTILOS[variante];
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(ev) => onChange(ev.target.checked)}
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 h-5 w-5 shrink-0 accent-secondary focus-visible:ring-2 focus-visible:ring-secondary"
        />
        <label htmlFor={id} className={`text-sm leading-relaxed ${e.texto}`}>
          {texto}{" "}
          <Link href="/privacidad" target="_blank" className={`underline underline-offset-4 font-bold ${e.enlace}`}>
            política de privacidad
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </Link>
          .
        </label>
      </div>
      {error && (
        <p id={errorId} className={`text-sm ${e.error}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ConsentCheckbox;
