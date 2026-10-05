"use client";

import React from 'react';
import { Award, Target, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
            Liderazgo Bancario y Excelencia
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight"
          >
            Una Nueva Era del <br />
            <span className="text-secondary italic font-normal">Real Estate.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg font-light leading-relaxed mx-auto max-w-2xl"
          >
            AS Tupropiedad surge de la convergencia entre la banca de inversión y el mercado inmobiliario premium. Redefinimos el estándar de servicio.
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
                Nuestra profunda conexión con la matriz bancaria del Perú nos permite estructurar operaciones que otros no pueden, ofreciendo a nuestros clientes pre-calificaciones ágiles, tasas preferenciales y seguridad jurídica blindada.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, title: 'Transparencia Absoluta' },
                { icon: Award, title: 'Garantía de Excelencia' },
                { icon: Users, title: 'Red Exclusiva' },
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

      {/* Leadership Stats */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="pt-8 md:pt-0">
              <h3 className="text-6xl font-black text-secondary mb-2">+15</h3>
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Años de Experiencia Bancaria</p>
            </div>
            <div className="pt-8 md:pt-0">
              <h3 className="text-6xl font-black text-secondary mb-2">$40M</h3>
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Volumen Intermediado</p>
            </div>
            <div className="pt-8 md:pt-0">
              <h3 className="text-6xl font-black text-secondary mb-2">120+</h3>
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Familias Asesoradas</p>
            </div>
            <div className="pt-8 md:pt-0">
              <h3 className="text-6xl font-black text-secondary mb-2">4</h3>
              <p className="text-sm font-black uppercase tracking-widest text-white/50">Alianzas Bancarias Top</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Intro */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">El Equipo</span>
          <h2 className="text-4xl font-serif font-black text-dark mb-16">Especialistas de Alto Nivel</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 group">
                <div className="h-80 bg-gray-200 overflow-hidden">
                  <img src={i === 1 ? '/imagenes/IMG-20250117-WA0101.jpg' : i === 2 ? '/imagenes/IMG-20250117-WA01012.jpg' : '/imagenes/Imagen de WhatsApp 2025-05-06 a las 16.44.00_c526d028.jpg'} alt="Team Member" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="p-8">
                  <h4 className="text-xl font-bold text-dark mb-1">Especialista {i}</h4>
                  <p className="text-primary text-xs font-black uppercase tracking-widest mb-4">Arquitecto & Broker</p>
                  <p className="text-gray-500 font-light text-sm">Más de 10 años conectando exclusividad e inteligencia financiera.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default NosotrosPage;
