"use client";

import React, { useMemo, useState } from 'react';
import { Table } from 'lucide-react';
import { motion } from 'framer-motion';
import { waLink } from '@/lib/contact';
import LeadForm from '@/components/LeadForm';
import { AvisoSimulacion, CampoNumerico, SelectorMoneda } from '@/components/simuladores';
import { numeroValido } from '@/lib/lead-tipos';
import {
  convertirMoneda,
  cronogramaFrances,
  ingresoMinimoRequerido,
  mensajeDe,
  mesesDesdeAnios,
  relacionCuotaIngreso,
  type ErrorFinanza,
  type Moneda,
} from '@/lib/finance';
import { formatearMoneda, formatearPorcentaje, leerNumero, leerOpcional } from '@/lib/formato';

const MortgageSimulator = () => {
  const [monto, setMonto] = useState('200000');
  const [tea, setTea] = useState('8.5');
  const [anios, setAnios] = useState('20');
  const [ingreso, setIngreso] = useState('');
  const [tope, setTope] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('USD');
  const [tipoCambio, setTipoCambio] = useState('');

  const calculo = useMemo(() => {
    const capital = leerNumero(monto);
    const teaPct = leerNumero(tea);
    const aniosNum = leerNumero(anios);
    const plazo = mesesDesdeAnios(aniosNum);
    const errores: ErrorFinanza[] = plazo.ok ? [] : [...plazo.errores];
    const cron = cronogramaFrances({ capital, teaPct, plazoMeses: plazo.ok ? plazo.valor : 0 });
    if (!cron.ok) errores.push(...cron.errores.filter((e) => e.campo !== 'plazoMeses'));

    const cuota = cron.ok ? cron.valor.cuota : undefined;
    const ingresoNum = leerOpcional(ingreso);
    const topeNum = leerOpcional(tope);
    let relacion: number | undefined;
    let ingresoMinimo: number | undefined;
    if (ingresoNum !== undefined) {
      const r = relacionCuotaIngreso(cuota ?? 0, ingresoNum);
      if (!r.ok) errores.push(...r.errores.filter((e) => e.campo === 'ingreso'));
      else if (cuota !== undefined) relacion = r.valor;
    }
    if (topeNum !== undefined) {
      const r = ingresoMinimoRequerido(cuota ?? 0, topeNum);
      if (!r.ok) errores.push(...r.errores.filter((e) => e.campo === 'ratioMaximo'));
      else if (cuota !== undefined) ingresoMinimo = r.valor;
    }

    const tc = leerOpcional(tipoCambio);
    const otra: Moneda = moneda === 'USD' ? 'PEN' : 'USD';
    let equivalente: number | undefined;
    if (tc !== undefined) {
      const c = convertirMoneda(cuota ?? 0, moneda, otra, tc);
      if (!c.ok) errores.push(...c.errores.filter((e) => e.campo === 'tipoCambio'));
      else if (cuota !== undefined) equivalente = c.valor;
    }

    return {
      errores,
      cron: cron.ok ? cron.valor : undefined,
      relacion,
      ingresoMinimo,
      equivalente,
      otra,
      capital,
      aniosNum,
      teaPct,
    };
  }, [monto, tea, anios, ingreso, tope, moneda, tipoCambio]);

  const { errores, cron, relacion, ingresoMinimo, equivalente, otra } = calculo;
  const m = (v: number | undefined, d = 0) => formatearMoneda(v, moneda, d);
  const cuota = cron?.cuota;
  const resumen = cron
    ? `préstamo de ${m(calculo.capital)}, plazo ${calculo.aniosNum} años, TEA ${calculo.teaPct}%`
    : '';

  return (
    <div className="min-h-screen bg-gray-50">

      <section className="pt-40 pb-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-secondary font-black tracking-widest uppercase text-xs mb-6 block"
          >
            Asesoría de crédito
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
            <div className="lg:col-span-12 xl:col-span-8 bg-white p-6 sm:p-12 rounded-3xl shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <CampoNumerico
                  etiqueta="Monto del préstamo"
                  valor={monto} onChange={setMonto}
                  prefijo={moneda === 'USD' ? 'US$' : 'S/'}
                  error={mensajeDe(errores, 'capital')}
                />
                <CampoNumerico
                  etiqueta="Tasa anual (TEA) estimada"
                  valor={tea} onChange={setTea} step="0.1" sufijo="%"
                  error={mensajeDe(errores, 'tea')}
                  ayuda="Referencial: cada banco define su tasa."
                />
                <CampoNumerico
                  etiqueta="Plazo (años)"
                  valor={anios} onChange={setAnios} step="1" sufijo="años"
                  error={mensajeDe(errores, 'plazoAnios')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <CampoNumerico
                  etiqueta="Tu ingreso mensual (opcional)"
                  valor={ingreso} onChange={setIngreso}
                  prefijo={moneda === 'USD' ? 'US$' : 'S/'}
                  error={mensajeDe(errores, 'ingreso')}
                  ayuda="Para ver qué parte de tu ingreso ocuparía la cuota."
                />
                <CampoNumerico
                  etiqueta="Tope de cuota sobre ingreso (opcional)"
                  valor={tope} onChange={setTope} sufijo="%"
                  error={mensajeDe(errores, 'ratioMaximo')}
                  ayuda="Cada banco fija su propio límite; confírmalo con la entidad."
                />
              </div>

              <div className="mt-8">
                <SelectorMoneda
                  moneda={moneda} onMoneda={setMoneda}
                  tipoCambio={tipoCambio} onTipoCambio={setTipoCambio}
                  errorTipoCambio={mensajeDe(errores, 'tipoCambio')}
                />
              </div>

              {/* Advanced Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-12 border-t border-gray-100" aria-live="polite">
                <div className="text-center p-6 bg-primary/5 rounded-2xl">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Cuota mensual</p>
                  <p className="text-3xl font-black text-primary">{m(cuota)}</p>
                  {equivalente !== undefined && (
                    <p className="text-xs text-gray-600 mt-2">≈ {formatearMoneda(equivalente, otra)}</p>
                  )}
                </div>
                <div className="text-center p-6 bg-secondary/10 rounded-2xl">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Total intereses</p>
                  <p className="text-3xl font-black text-dark">{m(cron?.totalIntereses)}</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Pago total</p>
                  <p className="text-3xl font-black text-dark">{m(cron?.totalPagado)}</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Cuota sobre tu ingreso</p>
                  <p className="text-3xl font-black text-dark">{formatearPorcentaje(relacion, 1)}</p>
                  {relacion === undefined && (
                    <p className="text-xs text-gray-600 mt-2">Escribe tu ingreso para calcularlo.</p>
                  )}
                </div>
              </div>

              {ingresoMinimo !== undefined && (
                <p className="mt-6 text-base text-dark">
                  Para que la cuota no pase del {tope}&nbsp;% de tu ingreso, necesitarías un ingreso mensual de al menos{' '}
                  <strong>{m(ingresoMinimo)}</strong>.
                </p>
              )}
              {!cron && (
                <p className="mt-6 text-base font-bold text-red-700" role="status">
                  Corrige los campos marcados para ver el resultado.
                </p>
              )}

              <div className="mt-8">
                <AvisoSimulacion>
                  La cuota usa el sistema francés (cuota fija) y convierte la TEA a tasa mensual con (1 + TEA)^(1/12) − 1.
                  No incluye seguros, comisiones ni gastos, y no es la TCEA. Es referencial y depende de la evaluación de cada entidad financiera.
                </AvisoSimulacion>
              </div>
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-12 xl:col-span-4 space-y-8">
              <div className="bg-dark text-white p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-serif font-black mb-6">Orientación para tu crédito</h3>
                <p className="text-gray-300 text-sm mb-10 font-light leading-relaxed">
                  Un asesor puede revisar contigo esta simulación y orientarte sobre los siguientes pasos. La cuota es referencial y depende de la evaluación de cada banco.
                </p>

                <LeadForm
                  variante="oscuro"
                  interes="hipoteca"
                  origen="simulador-hipotecario:cta"
                  contexto={{
                    montoPrestamo: cron ? numeroValido(calculo.capital) : undefined,
                    plazoAnios: cron ? numeroValido(calculo.aniosNum) : undefined,
                    tea: cron ? numeroValido(calculo.teaPct) : undefined,
                    cuota: numeroValido(cuota),
                  }}
                  mensajeWhatsApp={
                    cron
                      ? `Hola, hice una simulación hipotecaria: ${resumen}. Quisiera orientación de un asesor.`
                      : 'Hola, quisiera orientación de un asesor para un crédito hipotecario.'
                  }
                  textoBoton="Quiero orientación"
                />
              </div>

              <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Table className="text-primary w-6 h-6" aria-hidden="true" />
                  </div>
                  <h4 className="font-bold">Cronograma de pagos</h4>
                </div>
                {cron ? (
                  <details className="mb-6">
                    <summary className="cursor-pointer text-sm font-bold text-primary focus-visible:ring-2 ring-primary rounded">
                      Ver los primeros 12 meses
                    </summary>
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full text-sm text-left">
                        <caption className="sr-only">Primeras 12 cuotas del cronograma</caption>
                        <thead>
                          <tr className="text-xs uppercase tracking-wider text-gray-600">
                            <th scope="col" className="py-2 pr-2">Mes</th>
                            <th scope="col" className="py-2 pr-2">Interés</th>
                            <th scope="col" className="py-2 pr-2">Capital</th>
                            <th scope="col" className="py-2">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="text-dark">
                          {cron.filas.slice(0, 12).map((f) => (
                            <tr key={f.numero} className="border-t border-gray-100">
                              <td className="py-2 pr-2">{f.numero}</td>
                              <td className="py-2 pr-2">{m(f.interes)}</td>
                              <td className="py-2 pr-2">{m(f.amortizacion)}</td>
                              <td className="py-2">{m(f.saldo)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ) : (
                  <p className="text-gray-600 text-sm mb-6">Completa los datos para ver el cronograma.</p>
                )}
                <a
                  href={waLink(
                    cron
                      ? `Hola, quisiera el cronograma de pagos completo de una simulación hipotecaria: ${resumen}.`
                      : 'Hola, quisiera el cronograma de pagos de una simulación hipotecaria.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black uppercase tracking-widest text-primary underline underline-offset-8"
                >
                  Pedir cronograma completo por WhatsApp
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
