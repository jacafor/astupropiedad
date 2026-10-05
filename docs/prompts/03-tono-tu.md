# 03 · Tono "tú" y español natural (D-10, P-6)

**Tú das:** tu OK a la tabla de cambios que te propondrá la sesión (paso 2). P-6 sigue sin respuesta: la sesión trabaja con el valor por defecto (español natural, salvo marca o servicio) y te lo muestra antes de aplicarlo.
**Depende de:** 02 (mismos archivos de texto).

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: unificar todo el texto visible del sitio al tratamiento de "tú" y reducir los anglicismos innecesarios, sin cambiar el significado. Responde en español. D-10 (docs/DECISIONES.md) fija "tú". P-6 está pendiente: por defecto, español natural salvo nombres de marca o servicio.

Paso 1 — inventario (sin editar nada):
Recorre src/ y lista cada texto visible que (a) use "usted/su/le/agende/ingrese…" u otra forma de usted, o (b) use un anglicismo (p. ej. Elite Portfolio, Off-Market, Flat, Cap Rate, "Nosotros (Firm)", Personal Shopper, Smart…). Usa grep y revisa las 7 páginas y los componentes.

Paso 2 — propuesta:
Dame una tabla: archivo:línea | texto actual | texto propuesto | motivo. Para los anglicismos marca cuáles propones conservar (si son nombre de servicio de la marca) y cuáles traducir; los términos técnicos (cap rate, TEA, LTV) se explican la primera vez en lugar de ocultarse. ESPERA mi aprobación; no apliques cambios antes.

Paso 3 — aplicar lo aprobado:
Edita solo los textos aprobados. No cambies estructura, estilos ni datos. Mantén la longitud parecida para no romper el diseño a 390 px. Respeta la regla de no inventar datos ni afirmaciones absolutas.

Paso 4 — verificar:
grep que no queden formas de "usted"; recorre las 7 rutas a 390 px y 1280 px buscando textos que desborden o se corten; npx tsc --noEmit && npm run lint && npm run build.

Después: añade a docs/NEGOCIO-Y-CONTENIDO.md una "guía de voz" corta (tú, tono, lista de términos conservados y traducidos) y cierra P-6 en docs/DECISIONES.md como entrada nueva con lo que yo apruebe. Dime qué verificaste de verdad y qué no.
````
