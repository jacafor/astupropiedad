"use client";

import React, { useId } from "react";
import type { Moneda } from "@/lib/finance";
import { SIMBOLO } from "@/lib/formato";

/** Piezas compartidas por los simuladores: campo numérico con mensaje de error, selector de moneda y aviso. */

type Variante = "claro" | "oscuro";

const ESTILO = {
  claro: {
    etiqueta: "text-gray-600",
    input: "bg-gray-50 border-gray-200 text-dark focus-visible:ring-primary placeholder:text-gray-500",
    afijo: "text-gray-600",
    ayuda: "text-gray-600",
    error: "text-red-700",
    errorBorde: "border-red-600",
  },
  oscuro: {
    etiqueta: "text-gray-300",
    input: "bg-white/5 border-white/20 text-white focus-visible:ring-secondary placeholder:text-gray-400",
    afijo: "text-gray-300",
    ayuda: "text-gray-300",
    error: "text-red-300",
    errorBorde: "border-red-400",
  },
} as const;

type CampoNumericoProps = {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  /** Mensaje de validación en español; si existe, el campo se marca como inválido. */
  error?: string;
  ayuda?: string;
  prefijo?: string;
  sufijo?: string;
  placeholder?: string;
  step?: string;
  variante?: Variante;
};

export const CampoNumerico = ({
  etiqueta,
  valor,
  onChange,
  error,
  ayuda,
  prefijo,
  sufijo,
  placeholder,
  step = "any",
  variante = "claro",
}: CampoNumericoProps) => {
  const id = useId();
  const e = ESTILO[variante];
  const idMensaje = `${id}-msg`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={`block text-xs font-black uppercase tracking-widest ${e.etiqueta}`}>
        {etiqueta}
      </label>
      <div className="relative">
        {prefijo && (
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold ${e.afijo}`} aria-hidden="true">
            {prefijo}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={valor}
          placeholder={placeholder}
          onChange={(ev) => onChange(ev.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          className={`w-full border p-4 rounded-xl font-black text-xl outline-none focus-visible:ring-2 ${e.input} ${
            error ? e.errorBorde : ""
          } ${prefijo ? "pl-14" : ""} ${sufijo ? "pr-12" : ""}`}
        />
        {sufijo && (
          <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold ${e.afijo}`} aria-hidden="true">
            {sufijo}
          </span>
        )}
      </div>
      <p id={idMensaje} className={`text-xs leading-snug ${error ? `${e.error} font-bold` : e.ayuda}`} role={error ? "alert" : undefined}>
        {error ?? ayuda}
      </p>
    </div>
  );
};

type SelectorMonedaProps = {
  moneda: Moneda;
  onMoneda: (m: Moneda) => void;
  tipoCambio: string;
  onTipoCambio: (t: string) => void;
  errorTipoCambio?: string;
  variante?: Variante;
};

/** Moneda de la simulación + tipo de cambio que escribe la persona (no hay valor por defecto). */
export const SelectorMoneda = ({ moneda, onMoneda, tipoCambio, onTipoCambio, errorTipoCambio, variante = "claro" }: SelectorMonedaProps) => {
  const id = useId();
  const e = ESTILO[variante];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label htmlFor={id} className={`block text-xs font-black uppercase tracking-widest ${e.etiqueta}`}>
          Moneda
        </label>
        <select
          id={id}
          value={moneda}
          onChange={(ev) => onMoneda(ev.target.value as Moneda)}
          className={`w-full border p-4 rounded-xl font-black text-xl outline-none focus-visible:ring-2 ${e.input}`}
        >
          <option value="USD" className="text-dark">Dólares (US$)</option>
          <option value="PEN" className="text-dark">Soles (S/)</option>
        </select>
        <p className={`text-xs leading-snug ${e.ayuda}`}>Los montos que escribas se toman en esta moneda.</p>
      </div>
      <CampoNumerico
        etiqueta="Tipo de cambio (opcional)"
        valor={tipoCambio}
        onChange={onTipoCambio}
        error={errorTipoCambio}
        ayuda={`Escribe cuántos soles equivalen a ${SIMBOLO.USD} 1 para ver los resultados en la otra moneda.`}
        prefijo="S/"
        step="0.001"
        variante={variante}
      />
    </div>
  );
};

/** Aviso visible de que el resultado es una simulación referencial. */
export const AvisoSimulacion = ({ children, variante = "claro" }: { children?: React.ReactNode; variante?: Variante }) => (
  <p
    className={`text-sm leading-relaxed rounded-xl border p-4 ${
      variante === "claro" ? "bg-gray-50 border-gray-200 text-gray-700" : "bg-white/5 border-white/20 text-gray-200"
    }`}
  >
    <strong className="font-black">Simulación referencial.</strong>{" "}
    {children ??
      "Estos resultados son estimados con los datos que ingresaste y no constituyen una oferta ni una aprobación. Están sujetos a la evaluación y las condiciones de la entidad financiera."}
  </p>
);
