"use client";

import { MotionConfig } from "framer-motion";

// Las animaciones de transformación (desplazamientos, escalas) se desactivan
// cuando el sistema pide "reducir movimiento"; la opacidad se conserva.
const Providers = ({ children }: { children: React.ReactNode }) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);

export default Providers;
