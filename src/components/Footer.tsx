import React from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin, CalendarDays, ArrowUpRight } from 'lucide-react';
import { EMAIL, PHONE_DISPLAY, mailLink, telLink } from '@/lib/contact';

const Footer = () => {
  return (
    <footer id="contacto" className="bg-dark text-white pt-24 pb-12 border-t-8 border-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">

          {/* Branding & Social */}
          <div className="lg:col-span-4">
            <img 
              src="/imagenes/logo AS Tupropiedad.png" 
              alt="AS Logo" 
              className="h-14 w-auto mb-10 bg-white p-3 rounded-sm shadow-xl"
            />
            <p className="text-gray-400 mb-10 leading-relaxed font-light text-lg">
              Boutique inmobiliaria líder en Lima. Especializada en maximizar el valor patrimonial mediante asesoría de alto nivel y análisis de rentabilidad.
            </p>
            <div className="flex space-x-5">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-dark transition-all duration-500 hover:-translate-y-1"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-secondary">Explorar</h4>
            <ul className="space-y-5">
              <li>
                <Link href="/nosotros" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Nosotros (Firm)
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Servicios Exclusivos
                </Link>
              </li>
              <li>
                <Link href="/propiedades" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/vender" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Vender Propiedad
                </Link>
              </li>
              <li>
                <Link href="/simulador-inversion" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Simulador de Inversión
                </Link>
              </li>
              <li>
                <Link href="/simulador-hipotecario" className="text-gray-400 hover:text-white transition-colors flex items-center group">
                  <ArrowUpRight className="w-3 h-3 mr-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  Simulador Hipotecario
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-secondary">Contacto Directo</h4>
            <ul className="space-y-6">
              <li>
                <a href={mailLink} className="flex items-start text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 mr-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">{EMAIL}</span>
                </a>
              </li>
              <li>
                <a href={telLink} className="flex items-start text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 mr-4 text-secondary flex-shrink-0" />
                  <span className="text-sm">{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li className="flex items-start text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <MapPin className="w-5 h-5 mr-4 text-secondary flex-shrink-0" />
                <span className="text-sm">San Isidro, Lima - Perú</span>
              </li>
            </ul>
          </div>

          {/* GHL CTA */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 p-10 rounded-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-serif font-bold mb-4">¿Hablamos de negocios?</h4>
              <p className="text-gray-400 text-sm mb-8 font-light">Agende una videollamada estratégica de 15 min.</p>
              
              <div className="border border-dashed border-white/20 bg-dark/50 p-6 text-center rounded-lg group-hover:border-secondary/50 transition-colors">
                <CalendarDays className="w-10 h-10 text-secondary mb-4 mx-auto" />
                <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-secondary transition-colors underline decoration-secondary underline-offset-8 decoration-2">
                  ABRIR CALENDARIO GHL
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
          <p>© 2026 AS Tupropiedad. Todos los derechos reservados.</p>
          <div className="space-x-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
