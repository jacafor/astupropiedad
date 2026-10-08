"use client";

import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadForm from '@/components/LeadForm';
import { AvisoSimulacion, CampoNumerico } from '@/components/simuladores';
import { numeroValido } from '@/lib/lead-tipos';
import { cuotaFrancesa, mensajeDe, mesesDesdeAnios, montoFinanciado, type ErrorFinanza } from '@/lib/finance';
import { formatearMoneda, leerNumero } from '@/lib/formato';

const MortgageBasic = () => {
  const [price, setPrice] = useState(250000);
  const [downPayment, setDownPayment] = useState('20'); // %
  const [years, setYears] = useState('20');
  const [rate, setRate] = useState('8.5'); // % anual (TEA), referencial

  const calculo = useMemo(() => {
    const errores: ErrorFinanza[] = [];
    const monto = montoFinanciado(price, leerNumero(downPayment));
    if (!monto.ok) errores.push(...monto.errores);
    const plazo = mesesDesdeAnios(leerNumero(years));
    if (!plazo.ok) errores.push(...plazo.errores);
    const cuota = cuotaFrancesa({
      capital: monto.ok ? monto.valor : NaN,
      teaPct: leerNumero(rate),
      plazoMeses: plazo.ok ? plazo.valor : 0,
    });
    if (!cuota.ok) errores.push(...cuota.errores.filter((e) => e.campo === 'tea'));
    return {
      errores,
      capital: monto.ok ? monto.valor : undefined,
      cuota: monto.ok && plazo.ok && cuota.ok ? cuota.valor : undefined,
    };
  }, [price, downPayment, years, rate]);

  const { errores, capital, cuota: monthlyPayment } = calculo;
  const usd = (v: number | undefined) => formatearMoneda(v, 'USD');

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
                  <label htmlFor="precio-inmueble" className="text-xs font-black uppercase tracking-widest text-gray-300">Precio del inmueble</label>
                  <span className="text-2xl font-black text-white">{usd(price)}</span>
                </div>
                <input 
                  id="precio-inmueble" type="range" min="50000" max="1000000" step="10000" 
                  value={price} onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
              </div>

              {/* Grid for other inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <CampoNumerico
                  variante="oscuro" etiqueta="Cuota inicial" sufijo="%"
                  valor={downPayment} onChange={setDownPayment}
                  error={mensajeDe(errores, 'cuotaInicial')}
                />
                <CampoNumerico
                  variante="oscuro" etiqueta="Plazo (años)" sufijo="años" step="1"
                  valor={years} onChange={setYears}
                  error={mensajeDe(errores, 'plazoAnios')}
                />
                <CampoNumerico
                  variante="oscuro" etiqueta="TEA estimada" sufijo="%" step="0.1"
                  valor={rate} onChange={setRate}
                  error={mensajeDe(errores, 'tea')}
                />
              </div>

              {/* Results Area */}
              <div className="pt-10 border-t border-white/10">
                <div className="bg-secondary p-8 sm:p-10 rounded-2xl text-dark text-center" aria-live="polite">
                  <p className="text-xs font-black uppercase tracking-widest mb-2">Cuota mensual estimada</p>
                  <p className="text-5xl font-black">{usd(monthlyPayment)}</p>
                  <p className="mt-4 text-xs font-bold leading-relaxed">
                    {monthlyPayment === undefined ? 'Corrige los campos marcados para ver la cuota.' : `Financias ${usd(capital)}.`}
                  </p>
                </div>
                <div className="mt-6">
                  <AvisoSimulacion variante="oscuro">
                    La cuota es referencial (cuota fija en dólares, TEA {rate || '—'} %, sin seguros ni comisiones) y está sujeta a la evaluación de la entidad financiera.
                  </AvisoSimulacion>
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
                    montoPrestamo: numeroValido(capital),
                    plazoAnios: monthlyPayment === undefined ? undefined : numeroValido(leerNumero(years)),
                    tea: monthlyPayment === undefined ? undefined : numeroValido(leerNumero(rate)),
                    cuota: numeroValido(monthlyPayment),
                  }}
                  mensajeWhatsApp={`Hola, hice una simulación hipotecaria: inmueble de ${usd(price)}, cuota inicial ${downPayment}%, plazo ${years} años. Quisiera orientación de un asesor.`}
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
