"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

const InvestmentSmarter = () => {
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [capRate, setCapRate] = useState<number>(0);

  useEffect(() => {
    if (propertyValue > 0 && monthlyRent > 0) {
      const annualIncome = monthlyRent * 12;
      const rate = (annualIncome / propertyValue) * 100;
      setCapRate(Number(rate.toFixed(2)));
    } else {
      setCapRate(0);
    }
  }, [propertyValue, monthlyRent]);

  return (
    <section id="inversores" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">Investment Intelligence</span>
                    <h2 className="text-5xl md:text-6xl font-serif font-black text-dark mb-8 leading-tight">Su dinero merece <br/><span className="italic text-secondary font-normal">volver a casa.</span></h2>
                    <p className="text-gray-600 text-lg mb-8 font-light leading-relaxed">
                        Evaluamos propiedades en Lima basándonos en algoritmos de rentabilidad neta (Cap Rate). No compre metros cuadrados, compre flujos de caja y plusvalía garantizada.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="group">
                            <p className="text-3xl font-black text-primary group-hover:text-secondary transition-colors">8.5%</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ROI Promedio Anual</p>
                        </div>
                        <div className="group">
                            <p className="text-3xl font-black text-primary group-hover:text-secondary transition-colors">12%</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Plusvalía estimada</p>
                        </div>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-light p-10 rounded-2xl border-b-8 border-primary shadow-2xl"
                >
                    <h4 className="text-sm font-black text-dark uppercase tracking-[0.3em] mb-8 text-center flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-secondary" />
                        Calculadora de Retorno
                    </h4>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inversión Estimada (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input 
                                    type="number" 
                                    value={propertyValue || ""}
                                    onChange={(e) => setPropertyValue(Number(e.target.value))}
                                    placeholder="250,000" 
                                    className="w-full bg-transparent border-b-2 border-primary/10 pl-8 p-4 text-2xl font-black text-primary focus:border-secondary outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Alquiler Mensual Proyectado (USD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <input 
                                    type="number" 
                                    value={monthlyRent || ""}
                                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                                    placeholder="1,500" 
                                    className="w-full bg-transparent border-b-2 border-primary/10 pl-8 p-4 text-2xl font-black text-primary focus:border-secondary outline-none transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="bg-dark p-8 rounded-xl flex justify-between items-center mt-10 shadow-xl">
                            <div>
                                <p className="text-white font-black text-[10px] uppercase tracking-widest">Cap Rate Estimado</p>
                                <p className="text-gray-400 text-[10px] mt-1 italic">Basado en ingreso anual de ${(monthlyRent * 12).toLocaleString()}</p>
                            </div>
                            <p className="text-4xl font-black text-secondary">{capRate}%</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
  );
};

export default InvestmentSmarter;
