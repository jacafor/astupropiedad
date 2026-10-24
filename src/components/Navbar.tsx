"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { waLink } from "@/lib/contact";

// Rutas cuyo primer bloque es oscuro: ahí la barra puede ser transparente con texto blanco.
// Cualquier otra ruta (fondo claro) usa la barra sólida desde el inicio.
const RUTAS_CON_HERO_OSCURO = [
  "/",
  "/nosotros",
  "/servicios",
  "/vender",
  "/simulador-inversion",
  "/simulador-hipotecario",
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // El menú móvil guarda la ruta en la que se abrió: al cambiar de ruta se cierra solo.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const isMobileMenuOpen = menuOpenAt === pathname;
  const isScrolled = scrolled || !RUTAS_CON_HERO_OSCURO.includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Esc cierra el menú móvil y devuelve el foco al botón que lo abrió.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpenAt(null);
      document.getElementById("boton-menu-movil")?.focus();
    };
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Nosotros", href: "/nosotros" },
    { name: "Servicios", href: "/servicios" },
    { name: "Propiedades", href: "/propiedades" },
    { name: "Vender", href: "/vender" },
    { name: "Inversión", href: "/simulador-inversion" },
    { name: "Hipotecas", href: "/simulador-hipotecario" },
  ];

  return (
    <nav
      aria-label="Principal"
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md py-4 shadow-xl"
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" aria-label="AS Tupropiedad, inicio" className="flex flex-col group focus-visible:ring-2 focus-visible:ring-secondary">
          <span
            className={`text-2xl font-serif font-black tracking-tighter transition-colors duration-500 ${
              isScrolled ? "text-primary" : "text-white"
            }`}
          >
            AS <span className={`${isScrolled ? "text-secondary-dark" : "text-secondary"} group-hover:text-primary transition-colors`}>TUPROPIEDAD</span>
          </span>
          <span
            className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
              isScrolled ? "text-muted" : "text-white/80"
            }`}
          >
            Boutique Inmobiliaria
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-black uppercase tracking-widest hover:text-secondary-dark focus-visible:ring-2 focus-visible:ring-primary transition-all ${
                isScrolled ? "text-dark" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            data-origen="navbar"
            href={waLink()}
            target="_blank"
            className={`flex items-center space-x-3 px-6 py-3 rounded-sm text-xs font-black focus-visible:ring-2 focus-visible:ring-secondary uppercase tracking-widest transition-all ${
              isScrolled
                ? "bg-primary text-white hover:bg-dark shadow-lg shadow-primary/20"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/30"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
            <span>Contacto Directo</span>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          type="button"
          id="boton-menu-movil"
          className="lg:hidden p-2 -mr-2 focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="menu-movil"
          onClick={() => setMenuOpenAt(isMobileMenuOpen ? null : pathname)}
        >
          {isMobileMenuOpen ? (
            <X aria-hidden="true" className={isScrolled ? "text-dark" : "text-white"} />
          ) : (
            <Menu aria-hidden="true" className={isScrolled ? "text-dark" : "text-white"} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-dark text-white p-8 lg:hidden border-t border-white/10"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpenAt(null)}
                  className="text-lg font-serif italic hover:text-secondary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                data-origen="navbar-movil"
                href={waLink()}
                className="bg-secondary text-dark p-4 text-center font-black uppercase text-xs tracking-widest"
              >
                Hablar con un experto
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
