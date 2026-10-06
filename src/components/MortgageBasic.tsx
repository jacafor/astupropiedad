"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadForm from '@/components/LeadForm';
import { numeroValido } from '@/lib/lead-tipos';

const MortgageBasic = () => {
  const [price, setPrice] = useState(250000);
  const [downPayment, setDownPayment] = useState(20); // %
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5); // % Annual
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    const principal = price * (1 - downPayment / 100);
    const monthlyRate = (rate / 100) / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
    } else {
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      setMonthlyPayment(payment);
    }
  }, [price, downPayment, years, rate]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <section id="hipoteca" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">Financiamiento Inteligente</span>
            <h2 className="text-5xl md:text-6xl font-serif font-black text-dark mb-8 leading-tight">
              Sincera tu <br/><span className="text-primary italic font-normal">Cuota Mensual.</span>
            </h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed mb-10 max-w-lg">
              No dejes tu sueño inmobiliario al azar. Utiliza nuestro simulador rápido para entender el impacto real de tu crédito en tu flujo de caja mensual.
            </p>
            
            <motion.a 
              href="/simulador-hipotecario"
              className="inline-flex items-center mt-12 text-primary font-black text-[10px] uppercase tracking-[0.3em] hover:text-secondary transition-all group"
            >
              Simulador Avanzado
              <div className="ml-4 p-2 border border-primary group-hover:border-secondary rounded-full transition-all">
                <Calculator className="w-4 h-4" />
              </div>
            </motion.a>
          </motion.div>

          {/* Calculator Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-dark p-12 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>

            <div className="relative z-10 space-y-10">
              {/* Slider 1: Price */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Precio del Inmueble</label>
                  <span className="text-2xl font-black text-white">{formatter.format(price)}</span>
                </div>
                <input 
                  type="range" min="50000" max="1000000" step="10000" 
                  value={price} onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              {/* Grid for other inputs */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cuota Inicial (%)</label>
                  <div className="relative">
                    <input 
                      type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold text-xl focus:outline-none focus:border-secondary transition-all"
                    />
                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plazo (Años)</label>
                  <div className="relative">
                    <input 
                      type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white font-bold text-xl focus:outline-none focus:border-secondary transition-all"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="pt-10 border-t border-white/10">
                <div className="bg-secondary p-10 rounded-2xl text-dark text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Cuota Mensual Estimada</p>
                  <h3 className="text-5xl font-black">{formatter.format(monthlyPayment)}</h3>
                  <p className="mt-4 text-[9px] font-bold uppercase tracking-widest opacity-40 leading-relaxed italic">
                    *Tasa referencial de {rate}% (sujeta a evaluación crediticia).
                  </p>
                </div>
              </div>

              <div className="pt-10 border-t border-white/10">
                <h3 className="text-xl font-serif font-black text-white mb-2">Habla con un asesor</h3>
                <p className="text-gray-300 text-sm mb-6">Déjanos tus datos y revisamos contigo esta simulación.</p>
                <LeadForm
                  variante="oscuro"
                  interes="hipoteca"
                  origen="home-hipoteca:cta"
                  contexto={{
                    precio: numeroValido(price),
                    montoPrestamo: numeroValido(price * (1 - downPayment / 100)),
                    plazoAnios: numeroValido(years),
                    tea: numeroValido(rate),
                    cuota: numeroValido(monthlyPayment),
                  }}
                  mensajeWhatsApp={`Hola, hice una simulación hipotecaria: inmueble de ${formatter.format(price)}, cuota inicial ${downPayment}%, plazo ${years} años. Quisiera orientación de un asesor.`}
                  textoBoton="Hablar con un asesor"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default MortgageBasic;
