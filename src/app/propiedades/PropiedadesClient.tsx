"use client";

import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import { waLink } from "@/lib/contact";
import { ETIQUETA_OPERACION, type Operacion, type Property } from "@/data/properties";

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const CatalogPage = ({ propiedades }: { propiedades: Property[] }) => {
  const [operacion, setOperacion] = useState<Operacion | "todos">("todos");
  const [distrito, setDistrito] = useState("");

  // Solo se ofrecen las operaciones que tienen propiedades (no hay chips que filtren a la nada).
  const operaciones = (Object.keys(ETIQUETA_OPERACION) as Operacion[]).filter((o) =>
    propiedades.some((p) => p.operacion === o)
  );

  const filtradas = propiedades.filter((p) => {
    const coincideOperacion = operacion === "todos" || p.operacion === operacion;
    const coincideDistrito = normalizar(p.distrito).includes(normalizar(distrito.trim()));
    return coincideOperacion && coincideDistrito;
  });

  const limpiarFiltros = () => {
    setOperacion("todos");
    setDistrito("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-32 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-dark mb-4">Catálogo de Inmuebles</h1>
              <p className="text-gray-600 font-light">Explora nuestra colección selecta de propiedades.</p>
            </div>

            {propiedades.length > 0 && (
              <div className="flex-1 w-full max-w-xl">
                <label htmlFor="buscar-distrito" className="sr-only">
                  Buscar por distrito
                </label>
                <div className="flex bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all shadow-sm">
                  <div className="flex-1 flex items-center px-4">
                    <MapPin className="text-gray-500 w-5 h-5 mr-3" aria-hidden="true" />
                    <input
                      id="buscar-distrito"
                      type="text"
                      placeholder="Buscar por distrito, zona..."
                      value={distrito}
                      onChange={(e) => setDistrito(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-dark font-bold placeholder:font-normal placeholder:text-gray-600"
                    />
                  </div>
                  <span className="bg-primary text-white p-4 rounded-xl" aria-hidden="true">
                    <Search className="w-5 h-5" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {propiedades.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto w-full pb-2 mb-10 hide-scrollbar" role="group" aria-label="Filtrar por operación">
              {(["todos", ...operaciones] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOperacion(o)}
                  aria-pressed={operacion === o}
                  className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    operacion === o ? "bg-dark text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {o === "todos" ? "Todos" : ETIQUETA_OPERACION[o]}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtradas.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <PropertyCard property={p} priority={i < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {propiedades.length === 0 && (
            <div className="py-20 text-center max-w-xl mx-auto">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-500" aria-hidden="true" />
              <h2 className="font-serif font-black text-2xl text-dark mb-3">Estamos preparando nuevas propiedades</h2>
              <p className="text-gray-600 mb-8">Escríbenos y te avisamos apenas publiquemos nuevas oportunidades.</p>
              <a
                href={waLink("Hola, quisiera que me avisen cuando publiquen nuevas propiedades")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-secondary text-dark px-8 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
              >
                Escríbenos por WhatsApp
              </a>
            </div>
          )}

          {propiedades.length > 0 && filtradas.length === 0 && (
            <div className="py-20 text-center max-w-xl mx-auto" role="status">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-500" aria-hidden="true" />
              <h2 className="font-serif font-black text-2xl text-dark mb-3">No hay propiedades con esos filtros</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="bg-dark text-white px-8 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary transition-all"
                >
                  Ver todas
                </button>
                <a
                  href={waLink("Hola, no encontré lo que busco en el catálogo. ¿Pueden ayudarme?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-dark px-8 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
                >
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;
