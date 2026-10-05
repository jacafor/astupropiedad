"use client";

import React from 'react';
import { Briefcase, CreditCard, Camera, FileText } from 'lucide-react';

const ServiciosPage = () => {
  const servicios = [
    {
      icon: Briefcase,
      title: "Representación de Comprador (Personal Shopper)",
      desc: "Buscamos y negociamos contigo la propiedad que mejor se ajusta a lo que necesitas. Evita lidiar con múltiples agentes: nosotros filtramos la oferta según tu objetivo de inversión o tu estilo de vida."
    },
    {
      icon: Camera,
      title: "Marketing Acertado para Vendedores",
      desc: "Su propiedad merece destacar. Incluimos Home Staging, fotografía arquitectónica, tours 360° y campañas dirigidas."
    },
    {
      icon: CreditCard,
      title: "Estructuración Financiera Integral",
      desc: "Te orientamos en el proceso de financiamiento hipotecario para tu adquisición, comparando opciones según tu perfil."
    },
    {
      icon: FileText,
      title: "Auditoría Legal Inmobiliaria",
      desc: "Revisamos con detalle títulos, cargas y gravámenes, y te acompañamos desde la Promesa de Venta hasta la firma de Escritura Pública en notaría."
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
