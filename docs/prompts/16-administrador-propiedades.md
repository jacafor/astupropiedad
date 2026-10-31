# 16 · Administrador de propiedades y publicación en portales (reemplazo de Tokko)

**Cuándo:** cuando quieras dejar Tokko. Es la sesión más grande del proyecto: conviene dividirla en 2 o 3 sesiones (el prompt ya trae las fases). Se apoya en la sesión 15 (GHL por API): sin ella el administrador funciona, pero no se sincroniza con GHL.
**Objetivo de negocio (D-29, 2026-10-29):** dejar de usar Tokko; administrar las propiedades desde el propio sitio y publicarlas en **Proppit y otros portales**, con GoHighLevel como CRM central.
**Depende de:** 07 (fichas, hecha), 15 (GHL por API; recomendada antes). Cambia la decisión D-11 ("el inventario vive en `src/data/properties.ts`"): la sesión debe registrar una decisión nueva que la reemplace.

## Qué necesitas tener antes (tú; sin esto la sesión se detiene en la fase 0)

1. **Cómo recibe Proppit las propiedades.** No encontré documentación pública de Proppit para Perú (solo que en otros países los portales se conectan por **API** o por un **archivo de datos con autenticación que se actualiza cada noche**). Pídele a Proppit, o a su ejecutivo de cuenta, la **especificación técnica**: ¿API o feed (XML/JSON)?, formato, campos obligatorios, requisitos de fotos, frecuencia, y cómo se identifica la cuenta. Pega esa especificación (sin claves) en una carpeta `docs/portales/` o en el chat.
2. **Lista de portales** donde quieres publicar, con su contacto técnico. Según lo poco que pude comprobar, Proppit reparte a portales como LaMudi, iCasas, Nurba, Nestoria, Properati, Trovit y Mitula, **no** a Urbania ni Adondevivir (de Navent, que tendrían su propia vía). No lo des por cierto: confírmalo con ellos.
3. **Tus datos de Tokko:** cómo exportarlos (exportación o API). **La clave de Tokko no se pega en el chat**; va en una variable de entorno local. No se apaga Tokko hasta validar la nueva publicación en paralelo.
4. **Decisiones tuyas:** cuántas propiedades y cuántas personas las editarán; qué roles (administrador, asesor); método de inicio de sesión que prefieras; y si autorizas **instalar dependencias y contratar una base de datos** (por ejemplo, desde el Marketplace de Vercel). Sin tu OK la sesión no instala nada.

## Enfoque recomendado (la sesión lo discute contigo y lo ajusta)

- **Fuente de verdad:** una base de datos propia (Postgres) para las propiedades y **Vercel Blob** (u otro almacenamiento) para las fotos. El administrador es una ruta protegida `/admin` del mismo sitio. El sitio público lee de la base de datos y se actualiza al guardar (`revalidateTag`).
- **Portales:** una capa `src/lib/portales/` con **un adaptador por portal** que convierte una propiedad al formato que ese portal pide, más un estado de publicación **por propiedad y por portal** (publicada, pausada, con error). Según lo que diga la especificación, será un **feed público con clave** (que el portal consulta) o un **envío por API** (disparado al guardar y reintentado).
- **GHL:** el CRM sigue centralizando contactos, oportunidades y citas (D-27). Para las propiedades se evalúa, con tu OK, una de dos: un **objeto personalizado** de GHL sincronizado desde el administrador, o solo vincular cada oportunidad con el código de la propiedad. Usar GHL como única base de datos de propiedades **no** es lo recomendado: el sitio y los portales dependerían de su disponibilidad y de sus límites de la API y de fotos. Si prefieres esa vía, la sesión la compara contigo antes.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md (en especial D-11, D-20, D-27, D-28, D-29 y P-15), docs/ARQUITECTURA.md, docs/NEGOCIO-Y-CONTENIDO.md ("Cómo agregar una propiedad"), docs/INTEGRACIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar cada fase, cierra según el "Protocolo de sesión" de AGENTS.md. Responde en español.

Objetivo: reemplazar Tokko con un administrador de propiedades dentro del sitio que publique en Proppit y otros portales, con GoHighLevel como CRM central (D-29). Hoy el inventario vive en src/data/properties.ts (D-11), está vacío, y el tipo `Property` ya tiene moneda por operación (venta USD, alquiler PEN; D-28).

Reglas que no se negocian: no inventes datos de negocio ni de propiedades (regla 1); no inventes especificaciones de portales: si no tengo la especificación de un portal, dímelo y espera; no instales dependencias, no contrates servicios ni toques Vercel sin mi OK explícito (lista "Pregunta primero"); las claves (Tokko, portales, base de datos, GHL) solo en variables de entorno y nunca en el chat, el código, los logs ni el navegador; datos de prueba siempre, nunca propiedades ni clientes reales hasta que yo lo autorice; nada se publica en un portal real sin mi confirmación.

Fase 0 — diagnóstico y preguntas (sin tocar código):
1. Resume cómo se usa hoy `Property`, `src/data/properties.ts`, las fichas, el catálogo, la home y el sitemap, y qué rompería migrar a base de datos.
2. Lee lo que haya en docs/portales/ (especificaciones que yo haya dejado). Lista, por portal, qué sabes y qué te falta (formato, campos obligatorios, fotos, frecuencia, autenticación). Si no hay especificación de Proppit, detente y dímelo: sin ella no se puede construir el adaptador.
3. Pregúntame lo que falte: volumen de propiedades, roles, método de inicio de sesión, base de datos preferida, y cómo exporto mis datos de Tokko.

Fase 1 — plan para mi aprobación (no programes antes de mi OK):
- Alternativas de almacenamiento (base de datos propia con Postgres y fotos en Blob; objeto personalizado de GHL; otra) con costo aproximado, límites, riesgos y tu recomendación.
- Inicio de sesión del administrador y roles, con la opción más simple y segura.
- Modelo de datos: extiende `Property` con lo que piden los portales (código de referencia, dirección exacta y aproximada que se publica, ubicación o coordenadas, ubigeo si aplica, superficies, antigüedad, amenidades, estado, visibilidad por portal, fechas). Marca cada campo como obligatorio u opcional según la especificación, no según tu memoria.
- Cómo se migra src/data/properties.ts sin romper el sitio (misma interfaz de lectura para fichas, catálogo, home y sitemap) y cómo vuelve el modo vacío honesto.
- Adaptador por portal, estado de publicación por propiedad y por portal, reintentos que no dupliquen avisos, registro de sincronización sin datos personales y qué ve el administrador cuando un portal rechaza una ficha.
- Cómo se sincroniza con GHL (D-27) y qué pasa si GHL falla.
- Cómo se hace la **salida de Tokko**: importación de mis datos, publicación en paralelo, criterio para apagar Tokko y plan de vuelta atrás. Tokko no se apaga en esta sesión.
- Cómo se divide el trabajo en sesiones y qué entrega cada una.

Fase 2 — datos y administrador: base de datos y almacenamiento (con mi OK para instalar y contratar), migración, ruta protegida /admin con inicio de sesión, listado con filtros, crear/editar/archivar propiedades, validación con zod (mensajes claros en español), carga y orden de fotos (se convierten a WebP, con texto alternativo obligatorio, sin teléfonos ni precios incrustados), vista previa de la ficha, y cambio de estado (disponible, reservado, vendido). Estados vacío, carga, error y éxito en cada pantalla; accesible (etiquetas, teclado, foco, contraste); móvil primero, probado a 390 y 1280 px; al guardar se actualiza el sitio público. La ruta /admin lleva `noindex`, no entra al sitemap y no se enlaza desde el sitio público.

Fase 3 — portales: capa `src/lib/portales/` con un adaptador por portal (empezando por Proppit con la especificación que yo entregue), pruebas Vitest con propiedades de ejemplo y con casos inválidos, y pantalla "Publicación" por propiedad (activar o pausar cada portal, ver estado y último error). Pruebas contra un receptor falso local; la prueba real contra el portal solo con mi confirmación y con una propiedad de prueba que yo autorice publicar y despublicar.

Fase 4 — GHL y salida de Tokko: sincronización con GHL según lo que acordemos; script de importación desde Tokko con datos de prueba primero; informe de diferencias entre lo publicado desde Tokko y lo publicado desde el sitio, para validar la publicación en paralelo.

Pruebas por fase: `npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build`; e2e con una base de datos de prueba aislada y sin tocar datos reales; interfaz a 390 y 1280 px. Seguridad: revisa con la skill `security-review` el acceso al /admin, la carga de archivos y las claves antes de cerrar la fase 2.

Documentación al cerrar cada fase: docs/DECISIONES.md (una decisión nueva que reemplace D-11, con estado, fecha y responsable; P-15 con lo que siga abierto), docs/ARQUITECTURA.md, docs/INTEGRACIONES.md (variables por nombre, contrato de cada portal), docs/NEGOCIO-Y-CONTENIDO.md ("Cómo agregar una propiedad" ahora por el administrador), docs/PRUEBAS.md, docs/ROADMAP.md y .env.example (solo nombres).

Hecho cuando (por fase): la fase 2 permite crear, editar, archivar y ordenar fotos de una propiedad desde /admin y el sitio público la muestra; la fase 3 genera la ficha correcta para Proppit y muestra el estado por propiedad y por portal; la fase 4 permite comparar con Tokko y decidir cuándo apagarlo. Dime qué verificaste de verdad, qué no pudiste verificar (por ejemplo, lo que dependa de portales reales) y qué decidiste sin consultarme.
````
