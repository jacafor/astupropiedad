# 02 · Enlaces muertos y contenido falso (P0 · C1, C3)

**Tú das:** nada. Donde falte un dato, la sesión pone un marcador honesto.
**Depende de:** 01.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: que ningún botón quede sin destino y que no quede contenido falso o engañoso. Responde en español, tratando al visitante de "tú" (D-10). Contacto solo desde src/lib/contact.ts (waLink). No inventes ningún dato.

Lee antes: AGENTS.md reglas 1, 3 y 4; docs/NEGOCIO-Y-CONTENIDO.md; docs/auditorias/AUDITORIA-WEB.md (C1 y C3) y docs/auditorias/AUDITORIA-FUNCIONALIDADES.md (tabla de promesas sin funcionalidad).

A) Enlaces y botones (C1)
- El ancla #vender del Hero no existe: apúntala a /vender. El "Catálogo" debe ir a /propiedades.
- Cada href="#" (5): redes sociales del footer → ocúltalas hasta tener las URLs (no inventes perfiles); Privacidad/Términos → déjalos ocultos si /privacidad y /terminos aún no existen (la sesión 09 los crea).
- Quita todo texto interno visible: "(GHL)" en botones, "ABRIR CALENDARIO GHL", "Replace with real number".
- Botones sin acción (calendario del footer, "Contactar a un Broker", "Solicitar asesor privado", "Postular", CTAs de simuladores): hasta que exista el embudo (sesión 05), enlázalos a WhatsApp con mensaje prellenado según el contexto (waLink("…")). El formulario de /vender NO lo toques aquí.
- Comprueba con grep que no queda href="#" ni botones sin onClick/href.

B) Contenido falso (C3)
- FeaturedProperties.tsx: la propiedad con foto de Unsplash que no es de AS Tupropiedad → quítala o marca la tarjeta como "Próximamente" sin precio inventado.
- Sección de equipo: las "fotos" son edificios → reemplázalas por iniciales o un avatar neutro y quita cargos o nombres que no sean verificables; si dudas, pregúntame antes.
- Quita "garantizado" y afirmaciones absolutas; cifras de mercado o estadísticas sin respaldo (P-10): quítalas o cámbialas por texto cualitativo. No pongas números nuevos.
- Datos del catálogo que contradicen los flyers (precios, m², distritos): NO los corrijas inventando; lista cada contradicción en un informe al final para que yo te dé el dato real.

Fuera de alcance: reescribir el tono (sesión 03), SEO, simuladores.

Pruebas: recorre las 7 rutas a 390 px y 1280 px y pulsa cada botón/enlace; confirma destino o WhatsApp con el número 51977588905; grep sin residuos; npx tsc --noEmit && npm run lint && npm run build. Apaga el servidor.

Entrega: tabla "elemento → antes → después", la lista de contradicciones de datos que necesitas que yo resuelva y qué verificaste de verdad. Marca las casillas del ROADMAP.
````
