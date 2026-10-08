"use client";

import React, { useMemo, useState } from 'react';
import { TrendingUp, PieChart, ShieldCheck, Download, Info, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import LeadForm from '@/components/LeadForm';
import { AvisoSimulacion, CampoNumerico, SelectorMoneda } from '@/components/simuladores';
import { numeroValido } from '@/lib/lead-tipos';
import {
  convertirMoneda,
  inversionTotal,
  mensajeDe,
  proyeccionPlusvalia,
  rentabilidadNeta,
  type ErrorFinanza,
  type Moneda,
} from '@/lib/finance';
import { formatearMoneda, formatearPorcentaje, leerNumero, leerOpcional } from '@/lib/formato';

const ANIOS_PROYECCION = 5;
const NOTA_CONFIRMAR = 'Valor referencial: confírmalo con tu notario o contador.';

const InvestmentSimulator = () => {
  const [precio, setPrecio] = useState('350000');
  const [alquiler, setAlquiler] = useState('1800');
  const [mantenimiento, setMantenimiento] = useState('');
  const [arbitrios, setArbitrios] = useState('');
  const [impuestoRenta, setImpuestoRenta] = useState('');
  const [alcabala, setAlcabala] = useState('');
  const [notariales, setNotariales] = useState('');
  const [plusvalia, setPlusvalia] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [tipoCambio, setTipoCambio] = useState('');

  const calculo = useMemo(() => {
    const precioNum = leerNumero(precio);
    const errores: ErrorFinanza[] = [];
    const renta = rentabilidadNeta({
      precio: precioNum,
      alquilerMensual: leerNumero(alquiler),
      mantenimientoMensual: leerOpcional(mantenimiento),
      arbitriosAnuales: leerOpcional(arbitrios),
      impuestoRentaPct: leerOpcional(impuestoRenta),
    });
    if (!renta.ok) errores.push(...renta.errores);
    const compra = inversionTotal(precioNum, leerOpcional(alcabala), leerOpcional(notariales));
    if (!compra.ok) errores.push(...compra.errores.filter((e) => e.campo !== 'precio'));

    const plusvaliaNum = leerOpcional(plusvalia);
    const proy = plusvaliaNum === undefined ? undefined : proyeccionPlusvalia(precioNum, plusvaliaNum, ANIOS_PROYECCION);
    if (proy && !proy.ok) errores.push(...proy.errores.filter((e) => e.campo !== 'precio'));

    const tc = leerOpcional(tipoCambio);
    const otra: Moneda = moneda === 'USD' ? 'PEN' : 'USD';
    let flujoOtra: number | undefined;
    if (tc !== undefined) {
      const c = convertirMoneda(renta.ok ? renta.valor.flujoMensualNeto : 0, moneda, otra, tc);
      if (!c.ok) errores.push(...c.errores.filter((e) => e.campo === 'tipoCambio'));
      else if (renta.ok) flujoOtra = c.valor;
    }

    return {
      errores,
      precioNum,
      renta: renta.ok ? renta.valor : undefined,
      compra: compra.ok ? compra.valor : undefined,
      proyeccion: proy && proy.ok ? proy.valor : undefined,
      plusvaliaNum,
      flujoOtra,
      otra,
    };
  }, [precio, alquiler, mantenimiento, arbitrios, impuestoRenta, alcabala, notariales, plusvalia, moneda, tipoCambio]);

  const { errores, renta, compra, proyeccion, plusvaliaNum, flujoOtra, otra } = calculo;
  const m = (v: number | undefined) => formatearMoneda(v, moneda);
  const simbolo = moneda === 'USD' ? 'US$' : 'S/';

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
            className="text-gray-300 text-xl font-light max-w-3xl mx-auto leading-relaxed"
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
              <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
                <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-8 flex items-center">
                  <Wallet className="w-4 h-4 mr-3" aria-hidden="true" /> Parámetros de compra
                </h2>

                <div className="space-y-6">
                  <SelectorMoneda
                    moneda={moneda} onMoneda={setMoneda}
                    tipoCambio={tipoCambio} onTipoCambio={setTipoCambio}
                    errorTipoCambio={mensajeDe(errores, 'tipoCambio')}
                  />
                  <CampoNumerico etiqueta="Precio de compra" valor={precio} onChange={setPrecio} prefijo={simbolo} error={mensajeDe(errores, 'precio')} />
                  <CampoNumerico etiqueta="Alquiler mensual estimado" valor={alquiler} onChange={setAlquiler} prefijo={simbolo} error={mensajeDe(errores, 'alquiler')} />
                  <CampoNumerico
                    etiqueta="Mantenimiento mensual"
                    valor={mantenimiento} onChange={setMantenimiento} prefijo={simbolo}
                    error={mensajeDe(errores, 'mantenimiento')}
                    ayuda="Opcional. Vacío = no se descuenta."
                  />
                  <CampoNumerico
                    etiqueta="Arbitrios e impuesto predial (anual)"
                    valor={arbitrios} onChange={setArbitrios} prefijo={simbolo}
                    error={mensajeDe(errores, 'arbitrios')}
                    ayuda="Opcional. Vacío = no se descuenta."
                  />
                  <CampoNumerico
                    etiqueta="Impuesto a la renta del alquiler"
                    valor={impuestoRenta} onChange={setImpuestoRenta} sufijo="%"
                    error={mensajeDe(errores, 'impuestoRenta')}
                    ayuda={`Porcentaje sobre el alquiler bruto. Vacío = no se descuenta. ${NOTA_CONFIRMAR}`}
                  />
                  <CampoNumerico
                    etiqueta="Alcabala"
                    valor={alcabala} onChange={setAlcabala} sufijo="%"
                    error={mensajeDe(errores, 'alcabala')}
                    ayuda={`Porcentaje del precio. Vacío = no se incluye. ${NOTA_CONFIRMAR}`}
                  />
                  <CampoNumerico
                    etiqueta="Gastos notariales y registrales"
                    valor={notariales} onChange={setNotariales} prefijo={simbolo}
                    error={mensajeDe(errores, 'gastosNotariales')}
                    ayuda={`Vacío = no se incluyen. ${NOTA_CONFIRMAR}`}
                  />
                  <CampoNumerico
                    etiqueta="Plusvalía anual estimada"
                    valor={plusvalia} onChange={setPlusvalia} sufijo="%"
                    error={mensajeDe(errores, 'plusvalia')}
                    ayuda={`Vacío = sin proyección. ${NOTA_CONFIRMAR}`}
                  />
                </div>
              </div>

              <div className="bg-primary p-8 sm:p-10 rounded-3xl text-white shadow-2xl overflow-hidden relative group">
                <Download className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" aria-hidden="true" />
                <h3 className="text-xl font-serif font-bold mb-4">¿Quieres revisar estos números?</h3>
                <p className="text-white/90 text-sm mb-8 font-light leading-relaxed">Un asesor puede analizar contigo esta simulación. Los resultados son estimados y dependen de los supuestos que ingresaste.</p>
                <LeadForm
                  variante="oscuro"
                  interes="invertir"
                  origen="simulador-inversion:cta"
                  contexto={{
                    precio: renta ? numeroValido(calculo.precioNum) : undefined,
                    alquilerMensual: renta ? numeroValido(renta.ingresoBrutoAnual / 12) : undefined,
                    capRateNeto: numeroValido(renta?.capRatePct),
                  }}
                  mensajeWhatsApp={
                    renta
                      ? `Hola, hice una simulación de inversión: precio ${m(calculo.precioNum)}, alquiler mensual ${m(renta.ingresoBrutoAnual / 12)}. Quisiera que un asesor la revise conmigo.`
                      : 'Hola, quisiera que un asesor me oriente con una inversión inmobiliaria.'
                  }
                  textoBoton="Hablar con un asesor"
                />
              </div>
            </div>

            {/* Dashboard Results */}
            <div className="xl:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-live="polite">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="text-dark w-6 h-6" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-black uppercase text-gray-600 tracking-widest mb-2">Rentabilidad neta (cap rate)</p>
                  <p className="text-3xl font-black text-dark">{formatearPorcentaje(renta?.capRatePct)}</p>
                  <p className="text-xs text-gray-600 mt-2">Bruta: {formatearPorcentaje(renta?.rentabilidadBrutaPct)}</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PieChart className="text-primary w-6 h-6" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-black uppercase text-gray-600 tracking-widest mb-2">Renta neta mensual</p>
                  <p className="text-3xl font-black text-dark">{m(renta?.flujoMensualNeto)}</p>
                  {flujoOtra !== undefined && <p className="text-xs text-gray-600 mt-2">≈ {formatearMoneda(flujoOtra, otra)}</p>}
                  <p className="text-xs text-gray-600 mt-2">Antes de cuotas de préstamo.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                  <div className="w-12 h-12 bg-dark/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="text-dark w-6 h-6" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-black uppercase text-gray-600 tracking-widest mb-2">Inversión total</p>
                  <p className="text-3xl font-black text-dark">{m(compra?.total)}</p>
                  <p className="text-xs text-gray-600 mt-2">Precio + alcabala + gastos que ingresaste.</p>
                </div>
              </div>

              {renta?.gastosSuperanIngresos && (
                <p className="rounded-2xl border border-gray-200 bg-white p-5 text-base text-dark" role="status">
                  Con estos datos los gastos e impuestos superan el alquiler: no hay renta neta (faltarían {m(renta.faltanteAnual)} al año).
                </p>
              )}
              {errores.length > 0 && (
                <p className="text-base font-bold text-red-700" role="status">
                  Corrige los campos marcados para ver el resultado.
                </p>
              )}

              {/* Proyección */}
              <div className="bg-white p-6 sm:p-12 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
                  <h2 className="text-2xl font-serif font-black text-dark">Proyección patrimonial a {ANIOS_PROYECCION} años</h2>
                  <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 self-start">
                    <Info className="w-4 h-4 text-primary" aria-hidden="true" />
                    <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                      Plusvalía anual: {plusvaliaNum !== undefined && proyeccion ? `${plusvaliaNum} %` : 'sin definir'}
                    </span>
                  </div>
                </div>

                {proyeccion ? (
                  <div className="space-y-12">
                    <div className="relative">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
                        <span>Valor hoy</span>
                        <span>Valor proyectado (año {ANIOS_PROYECCION})</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary relative w-full">
                          <div className="absolute top-0 right-0 h-full w-2 bg-secondary"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-6 text-xl font-black text-dark">
                        <span>{m(calculo.precioNum)}</span>
                        <span className="text-primary">{m(proyeccion.valorFuturo)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-100 pt-10">
                      <div>
                        <p className="text-xs font-black uppercase text-gray-600 mb-4">Ganancia por plusvalía</p>
                        <p className="text-3xl font-black text-dark">{m(proyeccion.ganancia)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-gray-600 mb-4">Renta neta acumulada a {ANIOS_PROYECCION} años</p>
                        <p className="text-3xl font-black text-dark">{m(renta ? renta.ingresoNetoAnual * ANIOS_PROYECCION : undefined)}</p>
                        <p className="text-xs text-gray-600 mt-2">Supone que el alquiler y los gastos no cambian.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-gray-700">
                    Escribe una plusvalía anual estimada para ver la proyección. {NOTA_CONFIRMAR}
                  </p>
                )}
              </div>

              <AvisoSimulacion>
                Estos resultados son estimados con los supuestos que ingresaste (rentabilidad neta = alquiler anual − gastos − impuesto a la renta, entre el precio). No incluyen cuotas de préstamo, vacíos de alquiler ni otros costos, y no constituyen una promesa de rendimiento.
              </AvisoSimulacion>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InvestmentSimulator;
