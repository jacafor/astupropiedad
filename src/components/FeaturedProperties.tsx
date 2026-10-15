"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { waLink } from '@/lib/contact';
import PropertyCard from '@/components/PropertyCard';
import type { Property } from '@/data/properties';

const MotionLink = motion.create(Link);

const FeaturedProperties = ({ properties }: { properties: Property[] }) => {
  return (
    <section id="comprar" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-secondary font-black tracking-widest uppercase text-xs mb-4 block">Selección destacada</span>
            <h2 className="text-5xl md:text-6xl font-serif font-black text-dark">Colección Exclusiva</h2>
          </motion.div>
          <MotionLink
            href="/propiedades"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex items-center text-primary font-black text-xs uppercase tracking-widest hover:text-secondary transition-all mt-6 md:mt-0 group"
          >
            Ver catálogo privado
            <ArrowRight className="w-4 h-4 ml-4 transform group-hover:translate-x-2 transition-transform" />
          </MotionLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((prop, index) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <PropertyCard property={prop} />
            </motion.div>
          ))}

          {/* Próximamente: sin foto ni datos hasta tener una ficha real */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: properties.length * 0.1 }}
            className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col"
          >
            <div className="flex-1 min-h-[360px] bg-dark text-white flex flex-col items-center justify-center text-center px-8">
              <span className="bg-white/10 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-sm mb-6">
                Próximamente
              </span>
              <h3 className="text-2xl font-serif font-bold mb-4 leading-tight">Nuevas propiedades en preparación</h3>
              <p className="text-gray-300 font-light leading-relaxed">
                Escríbenos y te avisamos cuando publiquemos nuevas oportunidades.
              </p>
            </div>
            <div className="p-8 border-t border-gray-100 text-center">
              <a
                href={waLink("Hola, quisiera que me avisen cuando publiquen nuevas propiedades")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
              >
                Quiero que me avisen
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/propiedades"
            className="inline-flex items-center px-8 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded hover:bg-secondary transition-all shadow-lg"
          >
            Catálogo Completo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
