"use client";

import { usePathname } from "next/navigation";

/**
 * Oculta en /admin lo que es del sitio público (barra, pie, WhatsApp, banner de cookies y
 * analítica): el administrador no se mide ni se ofrece a visitantes.
 */
const SoloSitioPublico = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
};

export default SoloSitioPublico;
