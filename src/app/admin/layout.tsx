import type { Metadata } from "next";

// El administrador nunca se indexa (además: X-Robots-Tag en next.config.ts y fuera del sitemap).
export const metadata: Metadata = {
  title: { default: "Administrador", template: "%s | Administrador" },
  robots: { index: false, follow: false },
};

// Todo /admin depende de la sesión: nunca se prerenderiza ni se guarda en caché.
export const dynamic = "force-dynamic";

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-light">{children}</div>
);

export default AdminLayout;
