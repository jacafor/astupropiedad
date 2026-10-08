"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { CampoNumerico } from "@/components/simuladores";
import { mensajeDe, rentabilidadBruta } from "@/lib/finance";
import { formatearMoneda, formatearPorcentaje, leerNumero } from "@/lib/formato";

const InvestmentSmarter = () => {
  const [propertyValue, setPropertyValue] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");

  // Con ambos campos vacíos no se muestra error: la persona aún no empieza.
  const vacio = propertyValue.trim() === "" && monthlyRent.trim() === "";
  const resultado = useMemo(
    () => rentabilidadBruta(leerNumero(propertyValue), leerNumero(monthlyRent)),
    [propertyValue, monthlyRent]
  );
  const errores = !vacio && !resultado.ok ? resultado.errores : [];
  const rentabilidad = resultado.ok ? resultado.valor : undefined;
  const ingresoAnual = resultado.ok ? leerNumero(monthlyRent) * 12 : undefined;

  return (
    <section id="inversores" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <span className="text-primary font-black tracking-widest uppercase text-xs mb-4 block">Inteligencia de inversión</span>
                    <h2 className="text-5xl md:text-6xl font-serif font-black text-dark mb-8 leading-tight">Tu dinero merece <br/><span className="italic text-secondary font-normal">volver a casa.</span></h2>
                    <p className="text-gray-600 text-lg mb-8 font-light leading-relaxed">
                        Evaluamos propiedades en Lima con indicadores de rentabilidad como el cap rate (lo que rinde la propiedad al año respecto de su precio). No compres solo metros cuadrados: mira también el flujo de caja y el potencial de plusvalía.
                    </p>
                    
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
                        <CampoNumerico
                            etiqueta="Inversión estimada (US$)" prefijo="US$"
                            valor={propertyValue} onChange={setPropertyValue}
                            placeholder="250000" error={mensajeDe(errores, "precio")}
                        />
                        <CampoNumerico
                            etiqueta="Alquiler mensual proyectado (US$)" prefijo="US$"
                            valor={monthlyRent} onChange={setMonthlyRent}
                            placeholder="1500" error={mensajeDe(errores, "alquiler")}
                        />

                        <div className="bg-dark p-8 rounded-xl flex justify-between items-center gap-4 mt-10 shadow-xl" aria-live="polite">
                            <div>
                                <p className="text-white font-black text-xs uppercase tracking-widest">Rentabilidad bruta anual</p>
                                <p className="text-gray-300 text-xs mt-1">
                                    {ingresoAnual !== undefined
                                        ? `Alquiler anual de ${formatearMoneda(ingresoAnual, "USD")}, sin descontar gastos ni impuestos.`
                                        : "Escribe el precio y el alquiler para calcularla."}
                                </p>
                            </div>
                            <p className="text-4xl font-black text-secondary">{formatearPorcentaje(rentabilidad)}</p>
                        </div>
                        <p className="text-xs text-gray-600">
                            Cálculo referencial. Para la rentabilidad neta (cap rate) con gastos e impuestos usa el simulador de inversión.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
  );
};

export default InvestmentSmarter;
