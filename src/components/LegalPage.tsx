import React from "react";
import { LEGALES_EN_BORRADOR, LEGALES_FECHA } from "@/lib/legal";

/** Dato que falta y debe entregar el cliente o la asesoría legal. Siempre visible. */
export const Pendiente = ({ children }: { children: React.ReactNode }) => (
  <mark className="bg-secondary/30 text-dark font-bold px-1.5 py-0.5 rounded">
    [PENDIENTE: {children}]
  </mark>
);

export interface SeccionLegal {
  titulo: string;
  /** Ancla para enlazar la sección (p. ej. /privacidad#cookies). */
  id?: string;
  contenido: React.ReactNode;
}

interface Props {
  titulo: string;
  introduccion: React.ReactNode;
  secciones: SeccionLegal[];
}

const LegalPage = ({ titulo, introduccion, secciones }: Props) => (
  <>
    <section className="bg-dark text-white pt-40 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-white mb-6">Información legal</p>
        <h1 className="font-serif font-black text-4xl md:text-6xl leading-tight">{titulo}</h1>
      </div>
    </section>

    <section className="bg-light py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {LEGALES_EN_BORRADOR && (
          <div role="note" className="mb-12 rounded-3xl border-2 border-dark bg-white p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-widest text-dark mb-2">
              Borrador — pendiente de revisión legal
            </p>
            <p className="text-base leading-relaxed text-gray-700">
              Este texto es un borrador y todavía no ha sido revisado por una asesoría legal. Los datos marcados como{" "}
              <Pendiente>dato</Pendiente> faltan por confirmar. No lo tomes como asesoría legal.
            </p>
          </div>
        )}

        <p className="text-sm text-gray-700 mb-10">Última actualización del borrador: {LEGALES_FECHA}.</p>
        <div className="text-lg leading-relaxed text-gray-700 mb-12">{introduccion}</div>

        <div className="space-y-12">
          {secciones.map((s) => (
            <section key={s.titulo} id={s.id} className="scroll-mt-32">
              <h2 className="font-serif font-black text-2xl md:text-3xl text-dark mb-4">{s.titulo}</h2>
              <div className="space-y-4 text-base leading-relaxed text-gray-700">{s.contenido}</div>
            </section>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default LegalPage;
