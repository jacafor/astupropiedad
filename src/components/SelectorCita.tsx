"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { obtenerHorarios, type ResultadoHorarios } from "@/app/actions/horarios";
import { DIAS_A_MOSTRAR, etiquetaDia, etiquetaDiaCorta, etiquetaHora } from "@/lib/horarios";

type Props = {
  /** Id base (useId del formulario). */
  id: string;
  quiere: boolean;
  onQuiere: (quiere: boolean) => void;
  horario: string;
  onHorario: (iso: string) => void;
  /** Error del servidor sobre el horario (p. ej. ya no está libre). */
  error?: string;
  /** Enlace de WhatsApp con los datos escritos, para cuando no hay horarios o fallan. */
  enlaceWhatsApp: string;
  origen: string;
  variante: "claro" | "oscuro";
};

const ESTILOS = {
  claro: {
    texto: "text-dark",
    ayuda: "text-gray-600",
    error: "text-red-700",
    caja: "bg-gray-50 border-gray-200",
    chip: "bg-white border-gray-200 text-dark hover:border-primary",
    chipActivo: "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white",
    foco: "peer-focus-visible:ring-primary",
    boton: "text-primary hover:text-dark",
  },
  oscuro: {
    texto: "text-white",
    ayuda: "text-gray-300",
    error: "text-red-300",
    caja: "bg-white/5 border-white/20",
    chip: "bg-white/10 border-white/30 text-white hover:border-secondary",
    chipActivo: "peer-checked:bg-secondary peer-checked:border-secondary peer-checked:text-dark",
    foco: "peer-focus-visible:ring-secondary",
    boton: "text-white hover:text-secondary",
  },
} as const;

/**
 * Casilla "Quiero agendar una llamada" + selector de día y hora con los horarios libres del
 * calendario de GHL (hora de Lima). Estados honestos: cargando, sin horarios y error, los dos
 * últimos con WhatsApp. Radios nativos: se recorren con Tab y flechas.
 */
const SelectorCita = ({ id, quiere, onQuiere, horario, onHorario, error, enlaceWhatsApp, origen, variante }: Props) => {
  const e = ESTILOS[variante];
  const [estado, setEstado] = useState<ResultadoHorarios | null>(null);
  const [cargando, startTransition] = useTransition();
  const [dia, setDia] = useState("");

  const cargar = useCallback(() => {
    startTransition(async () => {
      let r: ResultadoHorarios;
      try {
        r = await obtenerHorarios();
      } catch {
        r = { ok: false, motivo: "servicio" };
      }
      setEstado(r);
      if (r.ok) {
        const vigente = r.dias.find((d) => d.horarios.includes(horario));
        setDia(vigente?.fecha ?? r.dias[0]?.fecha ?? "");
        if (!vigente) onHorario("");
      }
    });
  }, [horario, onHorario]);

  // Se cargan al marcar la casilla (no antes: no se consulta GHL a quien no lo pide).
  useEffect(() => {
    if (quiere && !estado) cargar();
  }, [quiere, estado, cargar]);

  const dias = estado?.ok ? estado.dias : [];
  const horasDelDia = dias.find((d) => d.fecha === dia)?.horarios ?? [];
  const total = dias.reduce((n, d) => n + d.horarios.length, 0);

  const aviso = !quiere
    ? ""
    : cargando
      ? "Buscando horarios libres…"
      : !estado
        ? ""
        : !estado.ok
          ? "No pudimos cargar los horarios."
          : total === 0
            ? `No hay horarios libres en los próximos ${DIAS_A_MOSTRAR} días.`
            : `Hay ${total} ${total === 1 ? "horario libre" : "horarios libres"} en ${dias.length} ${dias.length === 1 ? "día" : "días"}.`;

  const chip = `flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-sm font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 ${e.chip} ${e.chipActivo} ${e.foco}`;

  const planB = (texto: string) => (
    <a
      data-origen={`${origen}:cita-plan-b`}
      href={enlaceWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center justify-center gap-2 w-full py-3 bg-secondary text-dark font-black uppercase tracking-widest text-xs rounded-sm hover:bg-white transition-all"
    >
      <MessageCircle className="w-4 h-4" aria-hidden="true" />
      {texto}
    </a>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          id={`${id}-quiere-cita`}
          name="quiere_cita"
          type="checkbox"
          checked={quiere}
          onChange={(ev) => onQuiere(ev.target.checked)}
          aria-controls={`${id}-cita`}
          className="mt-1 h-5 w-5 shrink-0 accent-secondary focus-visible:ring-2 focus-visible:ring-secondary"
        />
        <label htmlFor={`${id}-quiere-cita`} className={`text-sm leading-relaxed ${e.texto}`}>
          <span className="font-bold">Quiero agendar una llamada con un asesor</span>{" "}
          <span className={e.ayuda}>(opcional, 15 minutos)</span>
        </label>
      </div>

      <div id={`${id}-cita`} hidden={!quiere} className={`rounded-xl border p-4 space-y-4 ${e.caja}`}>
        <p className={`text-sm ${e.ayuda}`}>Horarios en hora de Lima (GMT-5).</p>

        <p role="status" aria-live="polite" className={`text-sm ${estado && !estado.ok ? e.error : e.texto}`}>
          {cargando && <Loader2 className="inline w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
          {aviso}
        </p>

        {quiere && !cargando && estado && !estado.ok && (
          <div>
            <button
              type="button"
              onClick={cargar}
              className={`inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 ${e.boton}`}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" /> Reintentar
            </button>
            {planB("Coordinar la llamada por WhatsApp")}
          </div>
        )}

        {quiere && !cargando && estado?.ok && total === 0 && planB("Coordinar la llamada por WhatsApp")}

        {quiere && !cargando && estado?.ok && total > 0 && (
          <>
            <fieldset>
              <legend className={`mb-2 text-xs font-black uppercase tracking-widest ${e.texto}`}>Día</legend>
              <div className="flex flex-wrap gap-2">
                {dias.map((d) => (
                  <label key={d.fecha} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name={`${id}-dia`}
                      value={d.fecha}
                      checked={dia === d.fecha}
                      onChange={() => {
                        setDia(d.fecha);
                        onHorario("");
                      }}
                      className="peer sr-only"
                    />
                    <span className={chip}>{etiquetaDiaCorta(d.fecha)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset aria-describedby={error ? `${id}-horario-error` : undefined}>
              <legend className={`mb-2 text-xs font-black uppercase tracking-widest ${e.texto}`}>
                Hora <span className="sr-only">del {dia ? etiquetaDia(dia) : ""}</span>
              </legend>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {horasDelDia.map((iso) => (
                  <label key={iso} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name={`${id}-hora`}
                      value={iso}
                      checked={horario === iso}
                      onChange={() => onHorario(iso)}
                      className="peer sr-only"
                    />
                    <span className={chip}>{etiquetaHora(iso)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {quiere && error && (
          <div id={`${id}-horario-error`} className="space-y-2">
            <p className={`text-sm ${e.error}`}>{error}</p>
            <button
              type="button"
              onClick={cargar}
              className={`inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 ${e.boton}`}
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" /> Ver horarios actualizados
            </button>
          </div>
        )}
      </div>

      {/* Lo que lee la Server Action. */}
      <input type="hidden" name="horario" value={quiere ? horario : ""} />
    </div>
  );
};

export default SelectorCita;
