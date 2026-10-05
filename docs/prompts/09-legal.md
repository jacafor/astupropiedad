# 09 · Privacidad, términos y consentimiento (P0 · Ley 29733)

**Tú das (lo que tengas):**
- Razón social y RUC (si no los tienes, la sesión los deja como `[PENDIENTE]`; no los inventa).
- Domicilio legal, si se va a publicar.
- Texto de privacidad/términos **revisado por una asesoría legal**. Sin eso, la sesión crea un borrador marcado así y con `noindex`.

**Importante:** los textos legales de este proyecto **no son asesoría legal**. Los supuestos sobre Ley 29733, Libro de Reclamaciones y registro del agente inmobiliario están sin validar (`docs/DECISIONES.md`, tabla de supuestos).
**Depende de:** 04 (para metadata y sitemap).

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: crear /privacidad y /terminos y el componente de consentimiento para los formularios. Responde en español, tono "tú". Estas páginas son documentos legales: NO inventes razón social, RUC, dirección, plazos de conservación ni derechos que yo no te haya dado; usa [PENDIENTE: dato] visible.

Lee antes: AGENTS.md regla 8; docs/NEGOCIO-Y-CONTENIDO.md (sección legal); y en node_modules/next/dist/docs/ lo necesario para metadata (como en la sesión de SEO).

Tareas:
1. /privacidad y /terminos como Server Components con metadata propia. Si no te di texto revisado por un abogado: usa un borrador claro y sencillo (qué datos se recogen —nombre, celular, correo y lo que escribe el usuario—, para qué, con quién se comparten —la herramienta de CRM que se use—, derechos ARCO y cómo ejercerlos escribiendo a ventas@astupropiedad.com), con un aviso visible "BORRADOR — pendiente de revisión legal" y metadata robots noindex hasta que yo lo quite.
2. Componente ConsentCheckbox reutilizable (label asociada, texto "Acepto la política de privacidad" con enlace a /privacidad, obligatorio, mensaje de error) listo para la sesión de embudo de leads. Si ya existe un formulario conectado, úsalo ahí.
3. Footer: muestra los enlaces Privacidad y Términos ahora que las páginas existen (reemplaza los ocultos de la sesión 02).
4. Añade las dos rutas a sitemap.ts (ellas, con noindex, no deben aparecer en el sitemap mientras sean borrador: pon la condición en un solo lugar y documéntala).
5. Libro de Reclamaciones: NO implementes nada; deja anotado en docs/ROADMAP.md qué hay que preguntar a la asesoría y la fecha de hoy.

Pruebas: ambas rutas cargan, el enlace del footer funciona, el borrador muestra el aviso y noindex (revisa el <meta name="robots"> del HTML), el checkbox es operable con teclado; npx tsc --noEmit && npm run lint && npm run build.

Entrega: lista de cada [PENDIENTE] que dejaste y a quién se lo debo pedir; qué verificaste de verdad y qué no. Marca el ROADMAP.
````
