"use client";

import React from 'react';
import { Maximize, BedDouble, Bath, Car, ArrowRight, Key, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { waLink } from '@/lib/contact';

const properties = [
  {
    id: 1,
    title: "Flat Moderno con Vista Panorámica",
    location: "Jesús María",
    price: "$155,000",
    sqm: "85 m²",
    dorms: "2 Dorm",
    baths: "2 Baños",
    image: "/imagenes/IMG-20250117-WA0101.jpg",
    tag: "Destacado",
    tagColor: "bg-secondary text-dark"
  },
  {
    id: 2,
    title: "Residencia Familiar Arquitectónica",
    location: "La Molina",
    price: "$275,000",
    sqm: "220 m²",
    dorms: "4 Dorm",
    baths: "3 Baños",
    image: "/imagenes/IMG-20250117-WA01012.jpg",
    tag: "Premium",
    tagColor: "bg-primary text-white"
  }
];

const MotionLink = motion.create(Link);

const FeaturedProperties = () => {
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
            <span className="text-secondary font-black tracking-widest uppercase text-xs mb-4 block">Elite Portfolio</span>
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
              className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700"
            >
              <div className="relative h-[450px] overflow-hidden">
                <img 
                  src={prop.image} 
                  alt={prop.title}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent"></div>
                
                <div className="absolute top-6 left-6">
                  <span className={`${prop.tagColor} text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm`}>
                    {prop.tag}
                  </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-2">{prop.location}</p>
                  <h3 className="text-2xl font-serif font-bold mb-4 leading-tight">{prop.title}</h3>
                  <p className="text-2xl font-black text-white">{prop.price}</p>
                </div>
              </div>
              
              <div className="p-8 border-t border-gray-100 flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span className="flex items-center"><Maximize className="w-3 h-3 mr-2 text-primary" /> {prop.sqm}</span>
                <span className="flex items-center"><BedDouble className="w-3 h-3 mr-2 text-primary" /> {prop.dorms}</span>
                <span className="flex items-center"><Bath className="w-3 h-3 mr-2 text-primary" /> {prop.baths}</span>
              </div>
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
            <div className="h-[450px] bg-dark text-white flex flex-col items-center justify-center text-center px-8">
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
