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
  async headers() {
    return [
      { source: "/:path*", headers: cabecerasSeguridad },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
