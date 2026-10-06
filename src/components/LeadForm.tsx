"use client";

import React, { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { enviarLead } from "@/app/actions/lead";
import { waLink } from "@/lib/contact";
import {
  mensajeWhatsAppLead,
  type ContextoLead,
  type Interes,
  type ResultadoLead,
} from "@/lib/lead-tipos";

type Props = {
  interes: Interes;
  /** Identifica qué formulario fue, p. ej. "vender:valoracion" o "simulador-hipotecario:cta". */
  origen: string;
  contexto?: ContextoLead;
  /** Mensaje contextual de WhatsApp (plan B); se le añaden el nombre y el celular escritos. */
  mensajeWhatsApp: string;
  textoBoton?: string;
  /** "claro" para fondos blancos, "oscuro" para fondos dark/primary. */
  variante?: "claro" | "oscuro";
  /** Si se pasa, muestra el botón "Atrás" (asistente de /vender). */
  onAtras?: () => void;
  /** Texto del mensaje de éxito después del saludo. */
  textoExito?: string;
};

const ESTILOS = {
  claro: {
    label: "text-dark",
    ayuda: "text-gray-600",
    input:
      "bg-gray-50 border-gray-200 text-dark placeholder:text-gray-500 focus-visible:ring-primary",
    error: "text-red-700",
    alerta: "bg-red-50 border-red-200 text-red-800",
    enlace: "text-primary hover:text-dark",
    atras: "text-gray-700 hover:text-dark border-gray-200",
    exito: "text-dark",
    exitoTexto: "text-gray-700",
  },
  oscuro: {
    label: "text-white",
    ayuda: "text-gray-300",
    input:
      "bg-white/10 border-white/30 text-white placeholder:text-gray-300 focus-visible:ring-secondary",
    error: "text-red-300",
    alerta: "bg-red-500/15 border-red-300/40 text-red-100",
    enlace: "text-secondary hover:text-white",
    atras: "text-gray-200 hover:text-white border-white/30",
    exito: "text-white",
    exitoTexto: "text-gray-200",
  },
} as const;

const utmDesdeUrl = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const clave of ["source", "medium", "campaign", "term", "content"]) {
    const valor = params.get(`utm_${clave}`);
    if (valor) utm[clave] = valor.slice(0, 120);
  }
  return utm;
};

const LeadForm = ({
  interes,
  origen,
  contexto,
  mensajeWhatsApp,
  textoBoton = "Enviar mis datos",
  variante = "claro",
  onAtras,
  textoExito = "Un asesor se pondrá en contacto contigo al celular que dejaste.",
}: Props) => {
  const e = ESTILOS[variante];
  const uid = useId();
  const pathname = usePathname();
  const idEnvio = useRef<string | null>(null);
  const envioEnCurso = useRef(false);

  // Los valores viven en estado: React vacía los campos de un <form action> al terminar,
  // y si el envío falla la persona no debe volver a escribir nada.
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [acepta, setAcepta] = useState(false);

  const [resultado, accion, enviando] = useActionState<ResultadoLead | null, FormData>(enviarLead, null);

  // Cada respuesta del servidor es un objeto nuevo: libera el bloqueo del envío.
  useEffect(() => {
    envioEnCurso.current = false;
  }, [resultado]);

  // onSubmit en vez de <form action>: así React no vacía los campos ni la casilla cuando el envío falla.
  const alEnviar = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (envioEnCurso.current) return; // doble clic: el estado "enviando" tarda un render en bloquear el botón
    envioEnCurso.current = true;
    const formData = new FormData(ev.currentTarget);
    idEnvio.current ??= crypto.randomUUID();
    formData.set("id_envio", idEnvio.current);
    formData.set("pagina", pathname);
    formData.set("utm", JSON.stringify(utmDesdeUrl()));
    startTransition(() => accion(formData));
  };

  if (resultado?.ok) {
    return (
      <div role="status" className="text-center py-4">
        <CheckCircle2 className="w-14 h-14 text-secondary mx-auto mb-4" aria-hidden="true" />
        <p className={`font-serif font-black text-2xl mb-2 ${e.exito}`}>
          Gracias{nombre.trim() ? `, ${nombre.trim().split(/\s+/)[0]}` : ""}. Recibimos tu solicitud.
        </p>
        <p className={`text-base leading-relaxed ${e.exitoTexto}`}>{textoExito}</p>
      </div>
    );
  }

  const errores = resultado && !resultado.ok ? resultado.errores : {};
  const fallo = resultado && !resultado.ok && resultado.motivo !== "validacion" ? resultado : null;
  const hayAlerta = resultado && !resultado.ok;

  const campoClase = `w-full border p-4 rounded-xl text-base font-medium outline-none focus-visible:ring-2 ${e.input}`;
  const idDe = (campo: string) => `${uid}-${campo}`;
  const propsError = (campo: "nombre" | "celular" | "correo" | "consentimiento") =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": idDe(`${campo}-error`) }
      : undefined;

  return (
    <form onSubmit={alEnviar} noValidate className="space-y-5 text-left">
      <input type="hidden" name="interes" value={interes} />
      <input type="hidden" name="origen" value={origen} />
      <input type="hidden" name="contexto" value={JSON.stringify(contexto ?? {})} />

      {/* Honeypot: invisible para personas y lectores de pantalla. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={idDe("sitio_web")}>No rellenes este campo</label>
        <input id={idDe("sitio_web")} type="text" name="sitio_web" tabIndex={-1} autoComplete="off" />
      </div>

      {hayAlerta && (
        <div role="alert" className={`border rounded-xl p-4 text-sm leading-relaxed ${e.alerta}`}>
          {resultado.mensaje}
          {fallo && (
            <a
              href={waLink(mensajeWhatsAppLead(mensajeWhatsApp, { nombre, celular }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-4 bg-secondary text-dark font-black uppercase tracking-widest text-xs rounded-sm hover:bg-white transition-all"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Escribir por WhatsApp con mis datos
            </a>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor={idDe("nombre")} className={`block text-xs font-black uppercase tracking-widest ${e.label}`}>
          Nombre completo
        </label>
        <input
          id={idDe("nombre")}
          name="nombre"
          type="text"
          autoComplete="name"
          required
          aria-required="true"
          value={nombre}
          onChange={(ev) => setNombre(ev.target.value)}
          className={campoClase}
          {...propsError("nombre")}
        />
        {errores.nombre && (
          <p id={idDe("nombre-error")} className={`text-sm ${e.error}`}>{errores.nombre}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={idDe("celular")} className={`block text-xs font-black uppercase tracking-widest ${e.label}`}>
          Celular
        </label>
        <input
          id={idDe("celular")}
          name="celular"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          aria-required="true"
          placeholder="987 654 321"
          value={celular}
          onChange={(ev) => setCelular(ev.target.value)}
          className={campoClase}
          {...propsError("celular")}
        />
        {errores.celular && (
          <p id={idDe("celular-error")} className={`text-sm ${e.error}`}>{errores.celular}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={idDe("correo")} className={`block text-xs font-black uppercase tracking-widest ${e.label}`}>
          Correo <span className={`normal-case tracking-normal font-normal ${e.ayuda}`}>(opcional)</span>
        </label>
        <input
          id={idDe("correo")}
          name="correo"
          type="email"
          autoComplete="email"
          value={correo}
          onChange={(ev) => setCorreo(ev.target.value)}
          className={campoClase}
          {...propsError("correo")}
        />
        {errores.correo && (
          <p id={idDe("correo-error")} className={`text-sm ${e.error}`}>{errores.correo}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id={idDe("consentimiento")}
            name="consentimiento"
            type="checkbox"
            checked={acepta}
            onChange={(ev) => setAcepta(ev.target.checked)}
            aria-required="true"
            className="mt-1 h-5 w-5 shrink-0 accent-secondary focus-visible:ring-2 focus-visible:ring-secondary"
            {...propsError("consentimiento")}
          />
          <label htmlFor={idDe("consentimiento")} className={`text-sm leading-relaxed ${e.ayuda}`}>
            Acepto que AS Tupropiedad use mis datos para contactarme sobre mi consulta, según la{" "}
            <Link href="/privacidad" target="_blank" className={`underline underline-offset-4 font-bold ${e.enlace}`}>
              política de privacidad
            </Link>
            .
          </label>
        </div>
        {errores.consentimiento && (
          <p id={idDe("consentimiento-error")} className={`text-sm ${e.error}`}>{errores.consentimiento}</p>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        {onAtras && (
          <button
            type="button"
            onClick={onAtras}
            disabled={enviando}
            className={`inline-flex items-center justify-center gap-2 px-6 py-4 border rounded-sm text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${e.atras}`}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Atrás
          </button>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-secondary text-dark font-black uppercase tracking-widest text-xs rounded-sm hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all disabled:opacity-70 disabled:cursor-wait"
        >
          {enviando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Enviando…
            </>
          ) : (
            textoBoton
          )}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;
