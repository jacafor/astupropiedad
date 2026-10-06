"use client";

import React from 'react';
import { Award, Target, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { waLink } from '@/lib/contact';

const NosotrosPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-40 pb-20 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imagenes/PORTADA%20DPTO%20JESUS%20MARIA%20V2.jpeg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center max-w-4xl">
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block"
          >
            Quiénes somos
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight"
          >
            Una nueva era del <br />
            <span className="text-secondary italic font-normal">sector inmobiliario.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg font-light leading-relaxed mx-auto max-w-2xl"
          >
            AS Tupropiedad es una boutique inmobiliaria de Lima enfocada en la compra, venta e inversión de propiedades.
          </motion.p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-black text-dark mb-6">Nuestra Cultura Corporativa</h2>
              <p className="text-gray-500 font-light leading-relaxed mb-6">
                No somos simples intermediarios; somos asesores integrales de inversión patrimonial. Entendemos que adquirir o vender una propiedad es una de las decisiones financieras más importantes.
              </p>
              <p className="text-gray-500 font-light leading-relaxed">
                Te acompañamos a estructurar tu operación con análisis financiero y revisión legal, para que decidas con información clara.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, title: 'Transparencia' },
                { icon: Award, title: 'Compromiso con la excelencia' },
                { icon: Users, title: 'Atención cercana' },
                { icon: Target, title: 'Enfoque a Resultados' }
              ].map((value, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
                  <value.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h4 className="font-bold text-dark">{value.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipo: sin personas ni cifras hasta tener datos verificados */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-primary mb-4 block">El Equipo</span>
          <h2 className="text-4xl font-serif font-black text-dark mb-6">Pronto conocerás al equipo</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-10">
            Estamos preparando la presentación de las personas que te acompañarán en tu compra, venta o inversión. Mientras tanto, escríbenos y te atendemos directamente.
          </p>
          <a
            href={waLink("Hola, quisiera conocer más sobre el equipo de AS Tupropiedad")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-secondary text-dark px-10 py-5 font-black uppercase text-xs tracking-[0.2em] hover:bg-dark hover:text-white transition-all"
          >
            Escríbenos por WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
};

export default NosotrosPage;
