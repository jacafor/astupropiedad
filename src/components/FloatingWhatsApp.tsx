"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { waLink } from '@/lib/contact';

const FloatingWhatsApp = () => {
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-10 md:right-10 z-[100] bg-[#25D366] text-white p-4 md:p-5 rounded-full shadow-2xl flex items-center justify-center group"
    >
      <div className="absolute -top-12 right-0 bg-white text-dark text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        ¿Cómo te ayudamos hoy?
      </div>
      <MessageCircle className="w-8 h-8 fill-current" />
    </motion.a>
  );
};

export default FloatingWhatsApp;
