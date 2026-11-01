"use client";

import { RotateCcw } from "lucide-react";
import { estilos } from "@/components/admin/ui";

/** Error inesperado en /admin (p. ej. Supabase no responde). Lo escrito en un formulario sin enviar se pierde al recargar. */
const ErrorAdmin = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <div className="px-4 py-16">
    <div role="alert" className={`${estilos.tarjeta} p-8 max-w-xl mx-auto`}>
      <h1 className="text-2xl font-serif font-black text-dark mb-3">No se pudo cargar el administrador</h1>
      <p className="text-gray-700 mb-6">
        Puede ser un problema de conexión o que la base de datos no responda. Inténtalo de nuevo en unos segundos; si sigue
        fallando, avísale a quien mantiene el sitio.
      </p>
      <button type="button" onClick={reset} className={estilos.botonPrincipal}>
        <RotateCcw className="w-4 h-4" aria-hidden="true" />
        Reintentar
      </button>
    </div>
  </div>
);

export default ErrorAdmin;
