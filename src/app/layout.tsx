import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import JsonLd from "@/components/JsonLd";
import { BRAND_NAME, SITE_URL } from "@/lib/contact";
import { RUTAS } from "@/lib/rutas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inicio = RUTAS[0];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: inicio.title, template: `%s | ${BRAND_NAME}` },
  description: inicio.description,
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: BRAND_NAME,
    title: inicio.title,
    description: inicio.description,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-PE"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-light text-dark">
        <JsonLd />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-secondary focus:text-dark focus:px-6 focus:py-3 focus:text-xs focus:font-black focus:uppercase focus:tracking-widest focus-visible:ring-2 focus-visible:ring-primary"
        >
          Saltar al contenido
        </a>
        <Navbar />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
