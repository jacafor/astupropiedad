"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Registra `propiedad_vista` una vez por ficha abierta (la ficha es un Server Component). */
const VistaPropiedad = ({ id }: { id: string }) => {
  const registrada = useRef<string | null>(null);
  useEffect(() => {
    if (registrada.current === id) return;
    registrada.current = id;
    track("propiedad_vista", { id });
  }, [id]);
  return null;
};

export default VistaPropiedad;
