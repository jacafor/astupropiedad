"use client";

import React from 'react';
import { Briefcase, CreditCard, Camera, FileText } from 'lucide-react';

const ServiciosPage = () => {
  const servicios = [
    {
      icon: Briefcase,
      title: "Representación de Comprador (Personal Shopper)",
      desc: "Buscamos, negociamos y aseguramos la propiedad ideal para usted en el mercado. Evite lidiar con múltiples agentes; nosotros hacemos el filtrado estricto basándonos en sus requerimientos de inversión o estilo de vida."
    },
    {
      icon: Camera,
      title: "Marketing Acertado para Vendedores",
      desc: "Su propiedad merece destacar. Incluimos Home Staging, fotografía arquitectónica, tours 360° y campañas dirigidas con inteligencia artificial a nuestra exclusiva red de inversores y familias pre-calificadas."
    },
    {
      icon: CreditCard,
      title: "Estructuración Financiera Integral",
      desc: "Nuestra división de Liderazgo Bancario asegura las mejores condiciones de financiamiento para su adquisición. Conexión directa y rápida con ejecutivos de las 4 entidades bancarias más importantes del país."
    },
    {
      icon: FileText,
      title: "Auditoría Legal Inmobiliaria",
      desc: "Nos aseguramos de que su inversión sea 100% segura. Análisis meticuloso de títulos, cargas, gravámenes, y la preparación y acompañamiento desde la Promesa de Venta hasta la firma de Escrituras Públicas y Notaría."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="pt-40 pb-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <span className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block">Soluciones 360°</span>
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight">
            Servicios <span className="text-secondary italic font-normal">Exclusivos.</span>
          </h1>
          <p className="text-white/80 text-lg font-light leading-relaxed mx-auto max-w-2xl">
            Desde la búsqueda meticulosa hasta la entrega de llaves y el estructuramiento de su hipoteca. Todo en un solo *hub* experto.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {servicios.map((s, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                  <s.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-serif font-black text-dark mb-4">{s.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed mb-8">{s.desc}</p>
                <div className="w-12 h-1 bg-gray-100 group-hover:bg-secondary transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ServiciosPage;
