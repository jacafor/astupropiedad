"use client";

import React, { useState } from 'react';
import { Search, MapPin, Grid, List as ListIcon, ArrowUpRight, BedDouble, Bath, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { waLink } from '@/lib/contact';

// Mock Data
const PROPERTIES = [
  { id: 1, title: 'Departamento moderno en Jesús María', type: 'Venta', price: 165000, district: 'Jesús María', beds: 3, baths: 2, m2: 95, image: '/imagenes/PORTADA%20DPTO%20JESUS%20MARIA%20V2.jpeg' },
  { id: 2, title: 'Hermoso departamento en La Molina', type: 'Venta', price: 250000, district: 'La Molina', beds: 4, baths: 4, m2: 320, image: '/imagenes/depa%20santa%20patricia%20portada.png' },
  { id: 3, title: 'Casa en Urb. Alpamayo', type: 'Venta', price: 420000, district: 'Ate', beds: 3, baths: 3, m2: 180, image: '/imagenes/Calle%20El%20Banco%20-%20Urb.%20Alpamayo.png' },
  { id: 4, title: 'Departamento Amplio Callao', type: 'Venta', price: 85000, district: 'Callao', beds: 0, baths: 2, m2: 85, image: '/imagenes/Ciudad%20del%20Pescador,%20Bellavista%20-%20%20Callao%20.png' },
  { id: 5, title: 'Proyecto Inversión', type: 'Inversión', price: 110000, district: 'Lima', beds: 1, baths: 1, m2: 45, image: '/imagenes/6137335_93239265200915943082895002234931542254594532977163730722883182338725221671018.jpg' },
  { id: 6, title: 'Casa Exclusiva', type: 'Venta', price: 550000, district: 'La Molina', beds: 5, baths: 4, m2: 400, image: '/imagenes/6449363_92596621144496807426546038337595359775808725040179190988447444804557756253478.jpg' },
];

const CatalogPage = () => {
  const [activeType, setActiveType] = useState('Todos');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const filteredProperties = PROPERTIES.filter(prop => {
    const matchType = activeType === 'Todos' || prop.type === activeType;
    const matchDistrict = prop.district.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchType && matchDistrict;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-dark mb-4">Catálogo de Inmuebles</h1>
              <p className="text-gray-500 font-light">Explora nuestra colección selecta de propiedades.</p>
            </div>

            {/* Global Search Bar */}
            <div className="flex-1 w-full max-w-xl">
              <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all shadow-sm">
                <div className="flex-1 flex items-center px-4">
                  <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                  <input 
                    type="text" 
                    placeholder="Buscar por distrito, zona..."
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-dark font-bold placeholder:font-normal"
                  />
                </div>
                <span className="bg-primary text-white p-4 rounded-xl" aria-hidden="true">
                  <Search className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
              {['Todos', 'Venta', 'Alquiler', 'Inversión'].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeType === type ? 'bg-dark text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto justify-between">
              <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 text-dark' : 'text-gray-400'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 text-dark' : 'text-gray-400'}`}><ListIcon className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map(property => (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-white/90 backdrop-blur-md text-dark text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                        {property.type}
                      </span>
                    </div>
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <a
                      href={waLink(`Hola, quisiera más información sobre la propiedad "${property.title}" (${property.district}) del catálogo`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Consultar por WhatsApp: ${property.title}`}
                      className="absolute bottom-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-secondary hover:text-dark transition-colors drop-shadow-md"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </a>
                    <div className="absolute bottom-4 left-4">
                      <p className="text-white text-2xl font-black">{formatter.format(property.price)}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center text-gray-400 mb-3">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-xs font-bold tracking-wider uppercase">{property.district}</span>
                    </div>
                    <h3 className="text-xl font-serif font-black text-dark mb-6 group-hover:text-primary transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center text-gray-500">
                        <BedDouble className="w-4 h-4 mr-2" />
                        <span className="text-sm font-bold">{property.beds}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Bath className="w-4 h-4 mr-2" />
                        <span className="text-sm font-bold">{property.baths}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Square className="w-4 h-4 mr-2" />
                        <span className="text-sm font-bold">{property.m2}m²</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredProperties.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-serif text-xl">No encontramos propiedades con esos filtros.</p>
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};

export default CatalogPage;
