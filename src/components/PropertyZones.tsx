"use client";

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const zones = [
  {
    title: "Miraflores",
    tag: "Alta Demanda Rentas Cortas",
    desc: "El distrito más cosmopolita. Ideal para inversores apuntando a Airbnb y turismo, con tasas de ocupación superiores al 75%."
  },
  {
    title: "San Isidro",
    tag: "Core Financiero / Premium",
    desc: "Seguridad, exclusividad y el centro corporativo del país. Resguardo de capital garantizado y tickets de alto valor."
  },
  {
    title: "Surco",
    tag: "Expansión Residencial",
    desc: "Demanda constante para familias locales. Desarrollos modernos, conectividad y oferta de colegios/universidades top."
  }
];

const PropertyZones = () => {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {zones.map((zone, index) => (
          <motion.div 
            key={zone.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="p-12 hover:bg-gray-50 transition-all group flex flex-col justify-between"
          >
            <div>
              <h4 className="text-3xl font-serif font-black text-dark mb-2 group-hover:text-primary transition-colors">{zone.title}</h4>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-6">{zone.tag}</p>
              <p className="text-gray-500 text-sm font-light leading-relaxed">{zone.desc}</p>
            </div>
          </motion.div>
        ))}
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="p-12 bg-primary text-white flex flex-col justify-center items-center text-center group"
        >
          <div className="p-4 bg-white/10 rounded-full mb-6 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8 text-secondary" />
          </div>
          <h4 className="text-xl font-bold mb-3">Cobertura Global</h4>
          <p className="text-white/70 text-sm font-light leading-relaxed">Operamos en los enclaves más estratégicos de Lima Metropolitana, pre-calificando cada activo.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertyZones;
