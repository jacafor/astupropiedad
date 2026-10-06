"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import LeadForm from '@/components/LeadForm';

const PersonalShopper = () => {
  return (
    <section id="servicios" className="py-24 bg-dark text-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 transform translate-x-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-4 border border-secondary/30 rounded-lg transform -rotate-3 z-0"></div>
            <img 
              src="/imagenes/Imagen%20de%20WhatsApp%202025-05-06%20a%20las%2011.16.34_42668c22.jpg"
              alt="Asesoría Inmobiliaria AS"
              className="relative z-10 w-full rounded-lg shadow-2xl filter contrast-110 brightness-90 group-hover:brightness-100 transition-all duration-700"
            />

          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-black tracking-widest uppercase text-xs mb-4 block">Servicio Boutique</span>
            <h2 className="text-5xl md:text-6xl font-serif font-black mb-8 leading-tight">
              Tu Personal Shopper <br/><span className="italic font-normal text-secondary">Inmobiliario.</span>
            </h2>

            <div className="space-y-8 text-gray-300 font-light text-lg leading-relaxed">
              <p>
                Entendemos que tu tiempo es el activo más valioso. Por eso, no enviamos listas interminables de propiedades genéricas.
              </p>
              <p>
                Asignamos un <span className="text-white font-bold italic">asesor exclusivo</span> que entrevista tus necesidades, mapea la oferta disponible en Lima y te presenta solo lo que encaja con tu estilo de vida o tu objetivo de inversión. Es decir, un asesor que busca por ti.
              </p>
              
              <div className="flex items-center space-x-4 pt-4">
                <div className="p-3 bg-white/5 rounded-full border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-white">Ética, Excelencia y Resultados.</p>
              </div>
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl font-serif font-black mb-2">Solicita tu asesor privado</h3>
              <p className="text-gray-300 text-sm mb-6">Déjanos tus datos y un asesor te contactará para entender qué buscas.</p>
              <LeadForm
                variante="oscuro"
                interes="asesor"
                origen="home:asesor-privado"
                mensajeWhatsApp="Hola, quisiera solicitar un asesor privado para buscar una propiedad"
                textoBoton="Solicitar asesor privado"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PersonalShopper;
