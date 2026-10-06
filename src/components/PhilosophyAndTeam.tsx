"use client";

import React from 'react';
import { ShieldCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadForm from '@/components/LeadForm';

const PhilosophyAndTeam = () => {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ADN AS */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white p-12 md:p-16 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <div>
              <span className="text-primary font-black tracking-widest uppercase text-[10px] mb-4 block">Nuestra Filosofía</span>
              <h3 className="text-4xl font-serif font-black text-dark mb-8 leading-tight">El ADN <br/><span className="text-primary italic font-normal">AS Tupropiedad.</span></h3>
              <p className="text-gray-600 mb-8 leading-relaxed font-light text-lg">
                No somos una agencia tradicional de clasificados. Somos una firma boutique de asesoría patrimonial. Creemos que la transacción inmobiliaria es una de las decisiones financieras más importantes y debe ser tratada con rigor analítico, transparencia y buena ejecución.
              </p>
            </div>
            
            <div className="flex items-center text-dark font-black tracking-widest text-[10px] uppercase">
              <div className="p-2 bg-secondary/10 rounded-full mr-4">
                <ShieldCheck className="w-5 h-5 text-secondary" />
              </div>
              Ética, Excelencia y Resultados.
            </div>
          </motion.div>

          {/* Reclutamiento */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-dark text-white p-12 md:p-16 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <span className="text-secondary font-black tracking-widest uppercase text-[10px] mb-4 block">Crece con Nosotros</span>
              <h3 className="text-4xl font-serif font-black mb-8 leading-tight">Únete a la nueva era <br/><span className="italic font-normal text-secondary">del sector inmobiliario.</span></h3>
              <p className="text-gray-300 mb-10 leading-relaxed font-light text-lg">
                ¿Buscas una plataforma que potencie tu talento? Cuéntanos tu perfil y conversemos sobre cómo sumarte al equipo.
              </p>

              <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-xl">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-secondary" aria-hidden="true" />
                  <p className="text-xs text-gray-300 font-black uppercase tracking-widest">Postula como consultor</p>
                </div>
                <LeadForm
                  variante="oscuro"
                  interes="reclutamiento"
                  origen="home:reclutamiento"
                  mensajeWhatsApp="Hola, me interesa postular como consultor al equipo de AS Tupropiedad"
                  textoBoton="Postular al equipo"
                  textoExito="Revisaremos tu perfil y te escribiremos al celular que dejaste."
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PhilosophyAndTeam;
