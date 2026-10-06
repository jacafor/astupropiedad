"use client";

import React, { useState } from 'react';
import { Camera, Bot, Users, ArrowRight, Home, MapPin, Ruler, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VenderPage = () => {
  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState('');
  const [district, setDistrict] = useState('');

  const nextStep = () => setStep(prev => prev + 1);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/imagenes/PORTADA%20CORDILLERA%20CONDOR%202DO%20PISO.png')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block">Vende tu propiedad</span>
              <h1 className="text-5xl md:text-7xl font-serif font-black mb-8 leading-tight">
                Vendemos más rápido. <br/><span className="text-secondary italic font-normal">A mejor precio.</span>
              </h1>
              <p className="text-gray-400 text-lg font-light leading-relaxed mb-10 max-w-lg">
                Utilizamos inteligencia artificial, marketing de ultra-lujo y nuestra base de datos privada de inversores para posicionar tu propiedad frente a compradores calificados.
              </p>
                          </motion.div>

            {/* Valuation Funnel UI */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-2xl text-dark relative"
            >
              {/* Step Progress */}
              <div className="flex space-x-2 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-100'}`}></div>
                ))}
              </div>

              <h3 className="text-2xl font-serif font-black mb-2">Valoración Gratuita</h3>
              <p className="text-gray-500 text-sm mb-8 font-light">Descubre el valor de tu inmueble hoy.</p>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">¿Qué quieres vender?</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Departamento', 'Casa', 'Oficina', 'Terreno'].map(type => (
                        <button 
                          key={type}
                          onClick={() => setPropertyType(type)}
                          className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${propertyType === type ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                        >
                          <Home className="w-5 h-5 mb-2" />
                          {type}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={nextStep}
                      disabled={!propertyType}
                      className="w-full mt-4 py-4 bg-dark text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group"
                    >
                      Continuar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">¿Dónde está ubicado?</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Ej: Miraflores, San Isidro..."
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-dark font-bold focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="number" placeholder="Área m²" className="w-full bg-gray-50 border border-gray-100 p-4 pl-10 rounded-xl text-dark font-bold focus:ring-2 focus:ring-primary outline-none" />
                      </div>
                      <input type="number" placeholder="Habitaciones" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-dark font-bold focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <button 
                      onClick={nextStep}
                      disabled={!district}
                      className="w-full mt-4 py-4 bg-dark text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-primary transition-all disabled:opacity-50 flex justify-center items-center group"
                    >
                      Último Paso <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center py-4">
                    <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h4 className="font-serif font-black text-2xl">Casi Listo</h4>
                    <p className="text-gray-500 font-light text-sm">Ingresa tus datos para recibir el análisis detallado vía WhatsApp o correo en los próximos 10 minutos.</p>
                    
                    <input type="text" placeholder="Nombre completo" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-dark mb-4 outline-none" />
                    <input type="tel" placeholder="Número de celular" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-dark mb-6 outline-none" />

                    <button className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-dark transition-all shadow-lg hover:shadow-primary/30">
                      ENVIAR DATOS PARA ANÁLISIS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </div>
      </section>

      {/* The AS Difference */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-black text-dark mb-4">¿Por qué elegir AS Tupropiedad?</h2>
            <p className="text-gray-500">Nuestro marketing busca dar a tu propiedad la mayor exposición posible frente a compradores interesados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Camera, 
                title: 'Producción y home staging', 
                desc: 'Recorrido virtual 360°, fotografías arquitectónicas y home staging para destacar lo mejor de tu inmueble.' 
              },
              { 
                icon: Users, 
                title: 'Red Personal Shopper', 
                desc: 'Nuestros agentes tienen clientes esperando. Enlazamos tu propiedad directamente con inversores pre-aprobados.' 
              },
              { 
                icon: Bot, 
                title: 'Marketing Algorítmico', 
                desc: 'Campañas pautadas con IA para segmentar y encontrar al comprador ideal en tiempo récord.' 
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-primary w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-dark mb-3">{feature.title}</h4>
                <p className="text-gray-500 font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default VenderPage;
