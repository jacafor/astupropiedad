import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Piezas visuales del administrador (sesión 16). Siguen los tokens y patrones de docs/DISENO.md:
 * etiquetas en mayúsculas con tracking, CTA verde con texto `dark`, tarjetas blancas `rounded-3xl`.
 * Campos de 16 px (evita el zoom automático de iOS) y foco visible con anillo `primary`.
 */
export const estilos = {
  etiqueta: "block text-xs font-black uppercase tracking-widest text-gray-600 mb-2",
  campo:
    "w-full rounded-xl border bg-white px-4 py-3 text-base text-dark placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
  campoNormal: "border-gray-300",
  campoError: "border-red-600",
  ayuda: "mt-2 text-sm text-gray-600",
  error: "mt-2 text-sm font-bold text-red-700",
  botonPrincipal:
    "inline-flex items-center justify-center gap-2 min-h-11 bg-secondary text-dark px-6 py-3 font-black uppercase text-xs tracking-[0.2em] rounded-sm hover:bg-primary hover:text-white transition-all disabled:opacity-70 disabled:cursor-wait",
  botonSecundario:
    "inline-flex items-center justify-center gap-2 min-h-11 bg-white text-dark border border-gray-300 px-5 py-3 font-black uppercase text-xs tracking-widest rounded-sm hover:border-primary hover:text-primary transition-all disabled:opacity-70 disabled:cursor-wait",
  botonPeligro:
    "inline-flex items-center justify-center gap-2 min-h-11 bg-white text-red-700 border border-red-600 px-5 py-3 font-black uppercase text-xs tracking-widest rounded-sm hover:bg-red-700 hover:text-white transition-all disabled:opacity-70 disabled:cursor-wait",
  enlaceCabecera:
    "inline-flex items-center gap-2 min-h-11 px-3 text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white",
  tarjeta: "bg-white rounded-3xl border border-gray-100 shadow-sm",
  eyebrow: "text-secondary-dark font-black tracking-widest uppercase text-xs mb-2 block",
  titulo: "text-3xl md:text-4xl font-serif font-black text-dark",
  insignia: "inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
};

/** Mensaje de resultado (éxito o error) anunciado a lectores de pantalla. */
export const Aviso = ({ ok, mensaje, id }: { ok: boolean; mensaje: string; id?: string }) => (
  <div
    id={id}
    role={ok ? "status" : "alert"}
    className={`flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed ${
      ok ? "border-secondary-dark bg-white text-dark" : "border-red-600 bg-white text-red-700"
    }`}
  >
    {ok ? (
      <CheckCircle2 className="w-5 h-5 shrink-0 text-secondary-dark" aria-hidden="true" />
    ) : (
      <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
    )}
    <p>{mensaje}</p>
  </div>
);

/** Aviso cuando faltan las variables de Supabase (sitio sin base de datos conectada). */
export const SinConfiguracion = () => (
  <div className={`${estilos.tarjeta} p-8 max-w-xl mx-auto`}>
    <h1 className="text-2xl font-serif font-black text-dark mb-3">El administrador aún no está conectado</h1>
    <p className="text-gray-700 leading-relaxed">
      Faltan las variables <code className="font-mono text-sm break-all">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
      <code className="font-mono text-sm break-all">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>. Mientras tanto, el catálogo
      público muestra su estado vacío. Ver <code className="font-mono text-sm break-all">docs/INTEGRACIONES.md</code>.
    </p>
  </div>
);
