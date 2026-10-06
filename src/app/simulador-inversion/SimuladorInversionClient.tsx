"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart, Wallet, ShieldCheck, Download, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadForm from '@/components/LeadForm';
import { numeroValido } from '@/lib/lead-tipos';

const InvestmentSimulator = () => {
  // Inputs
  const [price, setPrice] = useState(350000);
  const [monthlyRent, setMonthlyRent] = useState(1800);
  const [maintenance, setMaintenance] = useState(450);
  const [propertyTax, setPropertyTax] = useState(1200); // Yearly
  const [alcabala, setAlcabala] = useState(3); // %
  const [appreciation, setAppreciation] = useState(4); // % Annual

  // Calculations
  const [netIncome, setNetIncome] = useState(0);
  const [capRate, setCapRate] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [projection5Y, setProjection5Y] = useState(0);

  useEffect(() => {
    const taxAlcabala = price * (alcabala / 100);
    const initialCosts = price + taxAlcabala + 1500; // +1500 for legal/notary
    setTotalInvestment(initialCosts);

    const annualGross = monthlyRent * 12;
    const annualExpenses = (maintenance * 12) + propertyTax + (annualGross * 0.05); // +5% IR
    const annualNet = annualGross - annualExpenses;
    
    setNetIncome(annualNet / 12);
    setCapRate((annualNet / price) * 100);

    // Appreciation projection (Compound Interest)
    const futureValue = price * Math.pow(1 + (appreciation / 100), 5);
    setProjection5Y(futureValue);
  }, [price, monthlyRent, maintenance, propertyTax, alcabala, appreciation]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      <section className="pt-40 pb-24 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block"
          >
            Herramientas de gestión patrimonial
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight"
          >
            Simulador de Inversión <br/><span className="text-secondary italic font-normal">Inmobiliaria Avanzado.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-xl font-light max-w-3xl mx-auto leading-relaxed"
          >
            Estima la rentabilidad de tu próxima propiedad, considerando impuestos, gastos operativos y una proyección de plusvalía a largo plazo.
          </motion.p>
        </div>
      </section>

      <section className="py-24 -mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Control Panel */}
            <div className="xl:col-span-4 space-y-8">
              <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-10 flex items-center">
                  <Wallet className="w-4 h-4 mr-3" /> Parámetros de Compra
                </h3>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Precio de Compra</label>
                      <span className="font-bold text-dark">{formatter.format(price)}</span>
                    </div>
                    <input type="range" min="100000" max="1500000" step="10000" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full accent-primary" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      <label>Alquiler Estimado</label>
                      <span className="text-dark font-bold">{formatter.format(monthlyRent)}</span>
                    </div>
                    <input type="range" min="500" max="10000" step="100" value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} className="w-full accent-primary" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-400">Mantenimiento</label>
                      <input type="number" value={maintenance} onChange={(e) => setMaintenance(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-gray-400">Arbitrios (Anual)</label>
                      <input type="number" value={propertyTax} onChange={(e) => setPropertyTax(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary p-10 rounded-3xl text-white shadow-2xl overflow-hidden relative group">
                <Download className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
                <h4 className="text-xl font-serif font-bold mb-4">¿Quieres revisar estos números?</h4>
                <p className="text-white/70 text-sm mb-8 font-light leading-relaxed">Un asesor puede analizar contigo esta simulación. Los resultados son estimados y dependen de los supuestos que ingresaste.</p>
                <LeadForm
                  variante="oscuro"
                  interes="invertir"
                  origen="simulador-inversion:cta"
                  contexto={{
                    precio: numeroValido(price),
                    alquilerMensual: numeroValido(monthlyRent),
                    capRateNeto: numeroValido(capRate),
                  }}
                  mensajeWhatsApp={`Hola, hice una simulación de inversión: precio ${formatter.format(price)}, alquiler mensual ${formatter.format(monthlyRent)}. Quisiera que un asesor la revise conmigo.`}
                  textoBoton="Hablar con un asesor"
                />
              </div>
            </div>

            {/* Dashboard Results */}
            <div className="xl:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="text-secondary w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Rentabilidad neta (cap rate)</p>
                  <h4 className="text-3xl font-black text-dark">{capRate.toFixed(2)}%</h4>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PieChart className="text-primary w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Flujo de caja mensual</p>
                  <h4 className="text-3xl font-black text-dark">{formatter.format(netIncome)}</h4>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="text-dark w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Inversión Total</p>
                  <h4 className="text-3xl font-black text-dark">{formatter.format(totalInvestment)}</h4>
                </div>
              </div>

              {/* Chart/Table Projection */}
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-serif font-black text-dark">Proyección Patrimonial a 5 Años</h3>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Plusvalía estimada: {appreciation}%</span>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="relative pt-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">
                      <span>Inversión Hoy</span>
                      <span>Valor Proyectado (Año 5)</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        className="h-full bg-primary relative"
                      >
                        <div className="absolute top-0 right-0 h-full w-2 bg-secondary"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between mt-6 text-xl font-black text-dark">
                      <span>{formatter.format(price)}</span>
                      <span className="text-primary">{formatter.format(projection5Y)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-100 pt-10">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-4">Ganancia por Plusvalía</p>
                      <h4 className="text-3xl font-black text-secondary">{formatter.format(projection5Y - price)}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-4">Ingreso por Renta (acumulado a 5 años)</p>
                      <h4 className="text-3xl font-black text-dark">{formatter.format(netIncome * 12 * 5)}</h4>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InvestmentSimulator;
