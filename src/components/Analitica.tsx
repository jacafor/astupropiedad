"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { revocarAnalitica, track } from "@/lib/analytics";
import {
  GA_ID,
  META_PIXEL_ID,
  consentimientoActual,
  suscribirConsentimiento,
} from "@/lib/consentimiento";

const sinServidor = () => null;

/**
 * Carga GA4 y el píxel de Meta SOLO si hay ID y el visitante aceptó.
 * Además escucha los clics en enlaces de WhatsApp de todo el sitio (evento `cta_whatsapp_click`).
 */
const Analitica = () => {
  const consentimiento = useSyncExternalStore(suscribirConsentimiento, consentimientoActual, sinServidor);
  const aceptado = consentimiento === "aceptado";
  const pathname = usePathname();
  const previo = useRef(consentimiento);
  const rutaPrevia = useRef(pathname);

  // Cambio de decisión en la misma visita (desde "Preferencias de cookies").
  useEffect(() => {
    if (previo.current === "aceptado" && consentimiento === "rechazado") revocarAnalitica();
    if (previo.current === "rechazado" && aceptado) {
      // Si los scripts ya estaban cargados de antes en esta visita, se les devuelve el permiso.
      window.gtag?.("consent", "update", { analytics_storage: "granted" });
      window.fbq?.("consent", "grant");
    }
    previo.current = consentimiento;
  }, [consentimiento, aceptado]);

  // GA4 cuenta las navegaciones internas solo (medición mejorada); el píxel de Meta no.
  // La primera página la cuenta el propio script al iniciarse.
  useEffect(() => {
    if (rutaPrevia.current === pathname) return;
    rutaPrevia.current = pathname;
    if (aceptado && META_PIXEL_ID) window.fbq?.("track", "PageView");
  }, [pathname, aceptado]);

  // Un solo oyente para todos los enlaces a wa.me: no hace falta tocar cada botón.
  useEffect(() => {
    const alClic = (ev: MouseEvent) => {
      const enlace = (ev.target as Element | null)?.closest?.('a[href^="https://wa.me/"]');
      if (!(enlace instanceof HTMLElement)) return;
      const pagina = window.location.pathname;
      track("cta_whatsapp_click", { origen: enlace.dataset.origen ?? `pagina:${pagina}`, pagina });
    };
    document.addEventListener("click", alClic, true);
    return () => document.removeEventListener("click", alClic, true);
  }, []);

  if (!aceptado) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
};

export default Analitica;
