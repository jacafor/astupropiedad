"use client";

import { HAY_ANALITICA, abrirPreferenciasCookies } from "@/lib/consentimiento";

/** Elemento de la lista legal del pie. Sin IDs de analítica no hay nada que elegir y no se muestra. */
const PreferenciasCookies = () => {
  if (!HAY_ANALITICA) return null;
  return (
    <li>
      <button
        type="button"
        onClick={abrirPreferenciasCookies}
        className="uppercase tracking-widest font-black hover:text-white transition-colors"
      >
        Preferencias de cookies
      </button>
    </li>
  );
};

export default PreferenciasCookies;
