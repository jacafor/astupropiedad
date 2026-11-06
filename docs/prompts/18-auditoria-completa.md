# 18 · Auditoría completa: diseño, UI/UX, accesibilidad, rendimiento, SEO y seguridad

**Cuándo:** cuando quieras una foto actualizada del sitio, antes de invertir en campañas o tras varias sesiones de cambios. Creado el 2026-11-05 a pedido de jforero.
**Objetivo:** un informe único, con evidencia y priorizado, del estado real del sitio público y de `/admin`. **Es una sesión de diagnóstico: no arregla nada sin tu OK.**
**Depende de:** nada. Conviene que el PR de skills (#30) esté fusionado, para que la tabla "Qué skills usar aquí" de `AGENTS.md` esté en `main`.

## Qué necesitas tener antes

1. **Credenciales de prueba para `/admin`** (un usuario de Supabase Auth creado para pruebas, nunca tu cuenta real). Sin ellas, la sesión audita `/admin` solo desde el código y desde la pantalla de inicio de sesión.
2. Decidir si la sesión puede **leer** (sin cambiar nada) la configuración de Supabase (políticas RLS, avisos de seguridad) y de Vercel (variables de entorno por nombre, sin valores). Por defecto: solo lectura.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión", "Diseño — resumen", "Seguridad de la configuración" y "Qué skills usar aquí"), docs/DECISIONES.md, docs/ROADMAP.md, docs/ARQUITECTURA.md, docs/DISENO.md, docs/SEO.md, docs/INTEGRACIONES.md, docs/PRUEBAS.md y las auditorías anteriores docs/auditorias/AUDITORIA-WEB.md y docs/auditorias/AUDITORIA-FUNCIONALIDADES.md. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión". Responde en español.

Objetivo: auditoría completa del sitio (público y /admin) en seis áreas: diseño visual, UX de producto, accesibilidad, rendimiento, SEO técnico y seguridad. Entregable: docs/auditorias/AUDITORIA-COMPLETA-2026-11.md. ES UNA SESIÓN DE DIAGNÓSTICO: no corrijas nada hasta que yo apruebe el plan de arreglos.

Reglas que no se negocian:
- Evidencia o no cuenta: cada hallazgo lleva archivo:línea, ruta + captura, medición o salida de comando. Nada de "probablemente". Si no pudiste verificar algo, dilo como "no verificado" y explica por qué.
- No inventes datos de negocio (regla 1). Los marcadores "Próximamente" ya decididos (DECISIONES → Pendientes) no son hallazgos, salvo que mientan o rompan la UX.
- Datos de prueba siempre. No envíes leads reales a GHL: usa el GHL falso de e2e/ghl-falso.mjs o un webhook de prueba. En /admin, solo las credenciales de prueba que te dé; nunca me pidas mi contraseña real ni escribas secretos en el chat, el informe o los logs.
- No leas .env* ni .vercel/** (están bloqueados). En Supabase y Vercel, solo lectura salvo que yo diga otra cosa.
- No instales dependencias, no despliegues, no fusiones y no cambies configuración. Lighthouse u otra herramienta nueva solo con mi OK; si no, mide con el navegador integrado (Performance API, Network, tamaños de JS/imágenes).
- Respeta el límite diario de despliegues de Vercel (plan gratuito, 100 al día): no hagas pushes de prueba para disparar previews.

Entorno de medición:
- Rendimiento y funcionalidad: build de producción local (npm run build y npx next start -p 3055). Apágalo al terminar.
- Producción real (https://web-as-tupropiedad.vercel.app): solo lectura con curl y el navegador (cabeceras, robots, sitemap, tiempos de respuesta).
- Anchos: 390 px y 1280 px en todas las rutas. Prueba también modo oscuro del sistema y prefers-reduced-motion.

Áreas, skill de cada una y qué revisar (carga cada skill con la herramienta Skill antes de usarla):
1. UX de producto — auditor-ux-app-f100k: recorrido como usuario por la home, /propiedades, /propiedades/[slug] (y su ficha PDF), /vender, los dos simuladores, /nosotros, /servicios, /privacidad y /admin. Las 10 dimensiones de la skill y su termómetro 0-100. Prioriza los formularios de leads de punta a punta (con GHL falso), los CTA de WhatsApp (destino y mensaje prellenado), estados vacío, cargando y error, y que el botón flotante de WhatsApp no tape ningún CTA.
2. Diseño visual / UI — design:design-critique y ux-elevacion-formula100k (modo auditoría, sin aplicar cambios): coherencia con docs/DISENO.md (tokens sin hex sueltos, patrones §3, contenedor de sección, jerarquía serif/eyebrow), consistencia entre páginas, espaciado, tipografía, imágenes (next/image con sizes, fotos limpias) y si algo se ve "genérico de IA". Además, design:ux-copy sobre los textos: tono "tú" (D-10), español de Perú, sin afirmaciones absolutas (regla 4).
3. Accesibilidad — design:accessibility-review: WCAG 2.1 AA. Contraste medido (no estimado) de los pares de color prohibidos en AGENTS.md, labels, foco visible, orden de tabulación, menú móvil con teclado, aria-label en botones de icono, texto ≥ 12 px, objetivos táctiles ≥ 44 px, movimiento reducido, un <main> por página.
4. Rendimiento — searchfit-seo:technical-seo + mediciones propias: LCP, CLS e INP aproximados por ruta (Performance API en el navegador), peso de JS por ruta (salida de npm run build), imágenes más pesadas, fuentes, componentes "use client" que podrían ser de servidor, framer-motion en la carga inicial, caché y revalidación de las páginas que leen de Supabase.
5. SEO técnico — searchfit-seo:seo-audit, searchfit-seo:schema-markup y searchfit-seo:broken-links: metadata por ruta (title ≤ 60, description 150-160), canonical, OG, JSON-LD válido y escapado, sitemap frente a RUTAS de src/lib/rutas.ts, robots, enlaces rotos internos y externos, /admin fuera del índice.
6. Seguridad del repositorio completo (no solo un diff) — security-review y engineering:code-review sobre estas zonas, más revisión manual:
   - /admin y src/app/admin/acciones.ts: autenticación en CADA Server Action (no solo en la página), autorización, validación con zod, subida de fotos (tipo, tamaño, nombre), orden de fotos.
   - Supabase: migraciones de supabase/migrations/ y políticas RLS (¿un anónimo puede leer borradores o escribir?), bucket de Storage, uso de claves de servicio solo en el servidor. Si me autorizas, contrasta con los avisos de seguridad de Supabase (get_advisors).
   - src/app/actions/lead.ts y src/lib/ghl.ts: validación, honeypot, límite de envíos (¿hay rate limit?), qué pasa si GHL falla, que no se filtren datos personales en logs ni en errores al cliente.
   - src/app/api/mantener-activo/: que exija el secreto del cron.
   - /propiedades/[slug]/ficha.pdf: entradas no válidas y coste de generación (posible abuso).
   - next.config.ts: cabeceras actuales; propuesta de Content-Security-Policy en modo Report-Only (D-23), sin activarla.
   - Variables NEXT_PUBLIC_*: que ninguna sea secreta. Secretos en el historial git (busca patrones de claves).
   - npm audit --omit=dev (debe seguir en 0) y npm audit completo (resumen).
   - Analítica y consentimiento: que GA4/Meta no carguen sin consentimiento.

Comparación con auditorías anteriores: para cada hallazgo de AUDITORIA-WEB.md y AUDITORIA-FUNCIONALIDADES.md, marca si sigue abierto, está resuelto (con evidencia) o empeoró.

Puedes repartir las áreas entre subagentes en paralelo (son de solo lectura), pero el informe final lo consolidas tú y verificas cada hallazgo crítico o alto antes de incluirlo.

Formato del informe (docs/auditorias/AUDITORIA-COMPLETA-2026-11.md):
- Resumen ejecutivo: una nota de 0 a 100 por área y global, los 5 problemas más graves y lo que está bien (breve).
- Tabla de hallazgos: ID, área, severidad (crítica / alta / media / baja), ruta o archivo:línea, qué pasa, evidencia, impacto en el negocio (leads, confianza, posicionamiento, riesgo legal o de datos), arreglo propuesto y esfuerzo (S/M/L).
- Estado de las auditorías anteriores.
- Qué no se pudo verificar y por qué.
- Plan de arreglos propuesto, agrupado en sesiones (un objetivo verificable cada una), en el orden de prioridad de CLAUDE.md: que no se pierda trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → resto. La seguridad crítica va primero.

Al terminar:
1. Escribe el informe, añade los hallazgos accionables a docs/ROADMAP.md (sin duplicar lo que ya está) y enlaza el informe desde AGENTS.md y CLAUDE.md, donde se listan las auditorías.
2. Corre npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build y reporta el resultado real (sirve también como evidencia del informe).
3. Apaga los servidores y borra temporales propios (capturas fuera de docs/, tsconfig.tsbuildinfo).
4. Un commit en una rama nueva, push, PR hacia main con el resumen ejecutivo en la descripción. Como solo cambia documentación, puedes fusionarlo según el Protocolo de sesión si el CI pasa; si el preview de Vercel falla solo por el límite diario de despliegues, avísame y no lo fusiones.
5. Cierra con: qué verificaste de verdad, qué no pudiste verificar, qué decidiste sin consultarme y cuál es la primera sesión de arreglos que recomiendas.
````
