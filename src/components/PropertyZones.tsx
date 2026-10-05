"use client";

import React from 'react';
import { MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const zones = [
  {
    title: "Miraflores",
    tag: "Rentas Cortas",
    desc: "Un distrito cosmopolita y turístico, que suele interesar a quienes buscan renta de corta estancia."
  },
  {
    title: "San Isidro",
    tag: "Centro financiero / Premium",
    desc: "Zona corporativa y financiera de Lima, con propiedades de alto valor."
  },
  {
    title: "Surco",
    tag: "Expansión Residencial",
    desc: "Zona residencial para familias, con desarrollos modernos, buena conectividad y oferta educativa cercana."
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
          <h4 className="text-xl font-bold mb-3">Cobertura en Lima</h4>
          <p className="text-white/70 text-sm font-light leading-relaxed">Trabajamos en distintos distritos de Lima Metropolitana.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertyZones;
