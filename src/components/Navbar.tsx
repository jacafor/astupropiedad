"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { waLink } from "@/lib/contact";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md py-4 shadow-xl"
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="flex flex-col group">
          <span
            className={`text-2xl font-serif font-black tracking-tighter transition-colors duration-500 ${
              isScrolled ? "text-primary" : "text-white"
            }`}
          >
            AS <span className="text-secondary group-hover:text-primary transition-colors">TUPROPIEDAD</span>
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors duration-500 ${
              isScrolled ? "text-gray-400" : "text-white/60"
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
              className={`text-[11px] font-black uppercase tracking-widest hover:text-secondary transition-all ${
                isScrolled ? "text-dark" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={waLink()}
            target="_blank"
            className={`flex items-center space-x-3 px-6 py-3 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${
              isScrolled
                ? "bg-primary text-white hover:bg-dark shadow-lg shadow-primary/20"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/30"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-secondary" />
            <span>Contacto Directo</span>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={isScrolled ? "text-dark" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-dark" : "text-white"} />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
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
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-serif italic hover:text-secondary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
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
