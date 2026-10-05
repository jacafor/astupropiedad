"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden flex items-center justify-center">
      {/* Background with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.1] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="h-full w-full bg-[url('/imagenes/portada.jpg')] bg-cover bg-center grayscale-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/70 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-secondary font-black tracking-[0.3em] uppercase text-xs mb-6 block"
          >
            Lujo & Rentabilidad en Lima
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-6xl md:text-8xl font-serif font-black text-white leading-tight mb-8"
          >
            Su patrimonio <br />
            <span className="italic text-secondary font-normal">en buenas manos.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-white/70 text-lg md:text-xl font-light leading-relaxed max-w-xl mb-12"
          >
            No somos solo una inmobiliaria. Somos su equipo estratégico para la
            compra, venta e inversión de activos de élite en el mercado peruano.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              href="/propiedades"
              className="bg-secondary text-dark px-10 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all shadow-2xl"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/vender"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-white/20 transition-all"
            >
              Vender mi propiedad
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.button
        type="button"
        aria-label="Bajar a la siguiente sección"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] vertical-text">Scroll</span>
        <ArrowDown className="text-secondary w-5 h-5" />
      </motion.button>
    </section>
  );
};

export default Hero;
