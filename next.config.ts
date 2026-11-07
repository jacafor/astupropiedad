import type { NextConfig } from "next";

// Cabeceras de seguridad básicas. No incluyen Content-Security-Policy: ver docs/ARQUITECTURA.md (seguridad).
const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

// Fotos del catálogo: se sirven desde el bucket público "propiedades" del proyecto de Supabase.
const hostSupabase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: hostSupabase
      ? [{ protocol: "https", hostname: hostSupabase, pathname: "/storage/v1/object/public/propiedades/**" }]
      : [],
  },
  experimental: {
    serverActions: {
      // Una foto de hasta 4 MB por envío desde /admin (Vercel corta el cuerpo en 4,5 MB).
      bodySizeLimit: "4.5mb",
    },
  },
  // D-34: la URL de producción de Vercel manda al dominio propio (308), para que Google y quien
  // comparta un enlace vean una sola dirección. Los previews tienen otro host y no se tocan.
  // /api queda fuera: el cron diario (/api/mantener-activo) no sigue redirecciones.
  async redirects() {
    const has = [{ type: "host" as const, value: "web-as-tupropiedad.vercel.app" }];
    return [
      { source: "/", has, destination: "https://web.astupropiedad.com/", permanent: true },
      { source: "/:path((?!api/).*)", has, destination: "https://web.astupropiedad.com/:path", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: cabecerasSeguridad },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
