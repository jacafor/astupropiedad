"use client";

import React, { useState, useEffect } from 'react';
import { Calculator, Landmark, Calendar, Percent, ShieldCheck, ArrowRight, Table } from 'lucide-react';
import { motion } from 'framer-motion';
import { waLink } from '@/lib/contact';

const MortgageSimulator = () => {
  const [loanAmount, setLoanAmount] = useState(200000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8.5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    const r = (rate / 100) / 12;
    const n = years * 12;
    
    if (r === 0) {
      setMonthlyPayment(loanAmount / n);
      setTotalInterest(0);
    } else {
      const payment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setMonthlyPayment(payment);
      setTotalInterest((payment * n) - loanAmount);
    }
  }, [loanAmount, years, rate]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      <section className="pt-40 pb-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.span 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block"
          >
            Credit Advisory
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-10 leading-tight">
            Simulador Hipotecario <br/><span className="text-secondary italic font-normal text-6xl">Calcula tu cuota.</span>
          </h1>
        </div>
      </section>

      <section className="py-24 -mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Calculator Panel */}
            <div className="lg:col-span-12 xl:col-span-8 bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-end">
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Monto del Préstamo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark font-bold text-xl">$</span>
                    <input 
                      type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 p-4 pl-8 rounded-xl text-dark font-black text-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">TEA Estimada (%)</label>
                  <div className="relative">
                    <input 
                      type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-dark font-black text-xl outline-none"
                    />
                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Plazo del Crédito</label>
                  <select 
                    value={years} onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-dark font-black text-xl outline-none"
                  >
                    {[5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} Años</option>)}
                  </select>
                </div>

              </div>

              {/* Advanced Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-100">
                <div className="text-center p-6 bg-primary/5 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cuota Mensual</p>
                  <h4 className="text-3xl font-black text-primary">{formatter.format(monthlyPayment)}</h4>
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Intereses</p>
                  <h4 className="text-3xl font-black text-dark">{formatter.format(totalInterest)}</h4>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pago Total</p>
                  <h4 className="text-3xl font-black text-dark">{formatter.format(loanAmount + totalInterest)}</h4>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Relación Cuota/Ingreso</p>
                  <h4 className="text-3xl font-black text-dark">3.5x</h4>
                </div>
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-8">
              <div className="bg-dark text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-serif font-black mb-6">Orientación para tu crédito</h3>
                <p className="text-gray-400 text-sm mb-10 font-light leading-relaxed">
                  Un asesor puede revisar contigo esta simulación y orientarte sobre los siguientes pasos. La cuota es referencial y depende de la evaluación de cada banco.
                </p>

                <a
                  href={waLink(`Hola, hice una simulación hipotecaria: préstamo de ${formatter.format(loanAmount)}, plazo ${years} años, TEA ${rate}%. Quisiera orientación de un asesor.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-12 py-5 bg-secondary text-dark font-black uppercase tracking-widest text-[10px] rounded-sm flex items-center justify-center group"
                >
                  Consultar por WhatsApp
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                </a>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Table className="text-primary w-6 h-6" />
                  </div>
                  <h4 className="font-bold">Cronograma de Pagos</h4>
                </div>
                <p className="text-gray-600 text-sm font-light mb-6">Pide a un asesor el detalle de pagos mes a mes de tu simulación.</p>
                <a
                  href={waLink(`Hola, quisiera el cronograma de pagos de una simulación hipotecaria: préstamo de ${formatter.format(loanAmount)}, plazo ${years} años, TEA ${rate}%.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-8"
                >
                  Pedir cronograma por WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default MortgageSimulator;
