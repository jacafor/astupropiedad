"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  GA_ID,
  HAY_ANALITICA,
  META_PIXEL_ID,
  consentimientoActual,
  guardarConsentimiento,
  suscribirAbrirPreferencias,
  suscribirConsentimiento,
  type Consentimiento,
} from "@/lib/consentimiento";

const sinServidor = () => undefined; // en el servidor no se sabe: no se pinta nada

const HERRAMIENTAS = [GA_ID && "Google Analytics", META_PIXEL_ID && "Meta"].filter(Boolean).join(" y ");
const PARA_QUE = META_PIXEL_ID
  ? "medir las visitas y saber qué anuncios funcionan"
  : "medir las visitas al sitio";

const boton =
  "min-h-12 px-6 py-3 bg-white text-dark font-black uppercase tracking-widest text-xs rounded-sm hover:bg-secondary transition-colors";

/**
 * Banner de cookies. Aparece solo si hay algún ID de analítica configurado y aún no hay decisión,
 * o cuando se reabre desde "Preferencias de cookies" (pie de página).
 * "Aceptar" y "Rechazar" tienen el mismo peso visual a propósito.
 */
const BannerCookies = () => {
  const consentimiento = useSyncExternalStore(suscribirConsentimiento, consentimientoActual, sinServidor);
  const [reabierto, setReabierto] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const volverA = useRef<HTMLElement | null>(null);

  useEffect(
    () =>
      suscribirAbrirPreferencias(() => {
        volverA.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setReabierto(true);
      }),
    []
  );

  // Al reabrirlo a propósito, el foco va al banner; en la primera visita no se roba el foco.
  useEffect(() => {
    if (reabierto) titulo.current?.focus();
  }, [reabierto]);

  if (!HAY_ANALITICA || consentimiento === undefined) return null;
  if (consentimiento !== null && !reabierto) return null;

  const decidir = (valor: Consentimiento) => {
    guardarConsentimiento(valor);
    if (reabierto) {
      setReabierto(false);
      volverA.current?.focus();
    }
  };

  return (
    <section
      aria-labelledby="cookies-titulo"
      aria-describedby="cookies-texto"
      className="fixed inset-x-0 bottom-0 z-[110] bg-dark text-white border-t-4 border-secondary shadow-2xl md:inset-x-auto md:left-10 md:bottom-10 md:max-w-xl md:rounded-2xl md:border-t-0 md:border md:border-white/15"
    >
      <div className="px-5 py-5 md:p-8">
        <h2 id="cookies-titulo" ref={titulo} tabIndex={-1} className="font-serif font-black text-lg md:text-xl mb-2">
          Tu privacidad, tu decisión
        </h2>
        <p id="cookies-texto" className="text-sm leading-relaxed text-gray-300 mb-4">
          Si aceptas, usamos cookies de {HERRAMIENTAS} para {PARA_QUE}, sin tu nombre, celular ni correo. Puedes
          cambiarlo luego en «Preferencias de cookies», al pie de la página.{" "}
          <Link href="/privacidad#cookies" className="text-white font-bold underline underline-offset-4 hover:text-secondary">
            Más información
          </Link>
          {consentimiento && (
            <span className="block mt-2 text-white">
              Ahora mismo las tienes <strong>{consentimiento === "aceptado" ? "aceptadas" : "rechazadas"}</strong>.
            </span>
          )}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => decidir("rechazado")} className={boton}>
            Rechazar
          </button>
          <button type="button" onClick={() => decidir("aceptado")} className={boton}>
            Aceptar
          </button>
        </div>
      </div>
    </section>
  );
};

export default BannerCookies;
