# 17 · Publicación en Proppit y otros portales, sincronización con GHL y salida de Tokko

**Cuándo:** después de la sesión 16 (catálogo y administrador con Supabase), y solo cuando tengas la especificación técnica de Proppit. Se separó de la 16 el 2026-10-31 (pedido de jforero: "lo de Proppit déjalo como otro prompt nuevo, lo implementamos luego").
**Objetivo de negocio (D-29):** publicar desde el administrador propio (`/admin`) en Proppit y otros portales, con GoHighLevel como CRM central, y apagar Tokko cuando la publicación nueva esté validada en paralelo.
**Depende de:** 16 (propiedades en Supabase, `/admin` con inicio de sesión, fotos en Supabase Storage) y 15 (GHL por API, hecha). Si la 16 no figura como hecha en `docs/ROADMAP.md`, la sesión se detiene.

## Qué necesitas tener antes (tú; sin esto la sesión se detiene en la fase 0)

1. **Especificación técnica de Proppit para Perú**, pedida a Proppit o a tu ejecutivo de cuenta. Debe responder:
   - ¿**API** (Proppit recibe lo que le enviamos) o **feed** (archivo XML/JSON en una URL nuestra que Proppit lee)? Si es feed: ¿cada cuánto lo lee y cómo se protege la URL (clave en la URL, usuario y contraseña, lista de IP)?
   - **Formato y campos**: cuáles son obligatorios, catálogos de valores (tipos de inmueble, operación, moneda, ubicación: distrito, provincia, departamento, ubigeo o coordenadas), límites de longitud de título y descripción, si admite HTML.
   - **Fotos**: cantidad mínima y máxima, tamaño y formato, si las descarga de nuestra URL o hay que subirlas, si rechaza marcas de agua o texto incrustado.
   - **Identidad del aviso**: qué campo usa como identificador estable (nuestro código de referencia), cómo se **actualiza** sin duplicar y cómo se **da de baja** (quitarlo del feed o enviar estado "inactivo").
   - **Respuesta y errores**: cómo sabremos que un aviso fue rechazado y por qué (respuesta de la API, informe por correo, panel).
   - **Entorno de pruebas** o cuenta de prueba, y contacto técnico.
   - **Autenticación**: cómo se identifica la cuenta (las claves irán solo en variables de entorno).
   Deja la especificación (sin claves) en `docs/portales/proppit/`.
2. **Lista de portales** donde quieres publicar y, para cada uno, si recibe **a través de Proppit** o por **vía propia** (Urbania y Adondevivir, de Navent, probablemente por vía propia: **sin verificar**). Para los de vía propia, la misma especificación que el punto 1, en `docs/portales/<portal>/`.
3. **Exportación de Tokko**: si tienes acceso a su API (la clave va en `.env.local`, nunca en el chat) o puedes exportar un archivo (CSV/XML/JSON). Para empezar basta un ejemplo con datos de prueba o anonimizados.
4. **Qué dirección se publica en los portales**: exacta o aproximada (zona/distrito), y si se envían coordenadas.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md (en especial D-20, D-27, D-28, D-29, la decisión de la sesión 16 que reemplazó a D-11, y P-15), docs/ARQUITECTURA.md, docs/INTEGRACIONES.md, docs/NEGOCIO-Y-CONTENIDO.md ("Cómo agregar una propiedad") y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md. Comprueba que la sesión 16 (catálogo y administrador con Supabase) figure como hecha en el ROADMAP; si no, detente y avísame. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar cada fase, cierra según el "Protocolo de sesión" de AGENTS.md. Responde en español.

Objetivo: publicar las propiedades del administrador propio (/admin, Supabase) en Proppit y otros portales, sincronizar con GoHighLevel como CRM central (D-27, D-29) y preparar la salida de Tokko. Tokko NO se apaga en esta sesión.

Reglas que no se negocian: no inventes datos de negocio ni de propiedades (regla 1); no inventes especificaciones de portales: si no hay especificación de un portal en docs/portales/, dímelo y espera; no instales dependencias, no contrates servicios ni toques Vercel sin mi OK explícito; las claves (Tokko, portales, Supabase, GHL) solo en variables de entorno y nunca en el chat, el código, los logs ni el navegador; datos de prueba siempre, nunca propiedades ni clientes reales hasta que yo lo autorice; nada se publica en un portal real sin mi confirmación.

Fase 0 — diagnóstico (sin tocar código):
1. Lee docs/portales/. Por portal, lista qué dice la especificación y qué falta (API o feed, formato, campos obligatorios, catálogos de valores, fotos, identificador estable, actualización y baja, errores, frecuencia, autenticación, entorno de pruebas). Si falta la de Proppit, detente.
2. Compara el modelo actual de propiedades en Supabase (tabla y tipo `Property`) con los campos obligatorios de cada portal: qué falta, qué hay que transformar (unidades, catálogos, ubigeo, moneda D-28) y qué dato tendría que darme yo.
3. Pregúntame lo que falte (dirección publicada exacta o aproximada, coordenadas, portales por vía propia, exportación de Tokko).

Fase 1 — plan para mi aprobación (no programes antes de mi OK):
- Cambios al modelo (migración de Supabase): campos nuevos que pidan los portales, marcados obligatorio/opcional según la especificación, no según tu memoria.
- Tablas de publicación: estado por propiedad y por portal (borrador, pendiente, publicada, pausada, con error, dada de baja), último intento, último error legible, identificador externo si el portal lo devuelve; y un registro de sincronización sin datos personales.
- Adaptador por portal en src/lib/portales/ (función pura propiedad → formato del portal + validación previa que dice qué falta), feed o envío por API según la especificación, reintentos idempotentes que no dupliquen avisos (identificador estable = código de referencia), y qué pasa al archivar, reservar o vender una propiedad.
- Si es feed: ruta protegida (clave en variable de entorno, comparación en tiempo constante), caché y qué propiedades entran. Si es API: cuándo se dispara (al guardar con after(), cola o cron de Vercel) y límites de la API.
- Sincronización con GHL: opciones (objeto personalizado de propiedades en GHL o solo el código de referencia en la oportunidad) con pros, contras y tu recomendación; qué pasa si GHL falla (el guardado en Supabase nunca se pierde).
- Salida de Tokko: importación (script con datos de prueba primero), publicación en paralelo, informe de diferencias, criterio para apagar Tokko y plan de vuelta atrás.
- División en sesiones y entregable de cada una.

Fase 2 — portales: migración de Supabase con las tablas de publicación (RLS activada), adaptador de Proppit con pruebas Vitest (propiedades de ejemplo válidas y casos inválidos: sin fotos, sin distrito, precio 0, moneda que no cumple D-28), feed o cliente de API, y pantalla "Publicación" dentro de la ficha del administrador: activar o pausar cada portal, ver estado, fecha del último envío y último error en español, y botón "Reintentar". Estados vacío, carga, error y éxito; accesible; probada a 390 y 1280 px. Pruebas e2e contra un receptor falso local (como e2e/ghl-falso.mjs); la prueba real contra Proppit solo con mi confirmación y con una propiedad de prueba que yo autorice publicar y despublicar.

Fase 3 — GHL y salida de Tokko: sincronización con GHL según lo acordado (con API falsa en pruebas); script de importación desde Tokko (primero con un archivo de prueba; con datos reales solo con mi OK); informe de diferencias entre lo publicado desde Tokko y desde el sitio para validar la publicación en paralelo; criterio y lista de pasos para apagar Tokko (lo apago yo).

Pruebas por fase: npm run typecheck && npm run lint && npm test && npm run test:e2e && npm run build; e2e sin tocar datos reales; interfaz a 390 y 1280 px. Seguridad: revisa con la skill security-review el feed o las llamadas a la API, las claves y los permisos (RLS) antes de cerrar la fase 2.

Documentación al cerrar cada fase: docs/DECISIONES.md (decisión nueva con estado, fecha y responsable; P-15 actualizado), docs/ARQUITECTURA.md, docs/INTEGRACIONES.md (contrato de cada portal y variables por nombre), docs/NEGOCIO-Y-CONTENIDO.md (cómo publicar en portales), docs/PRUEBAS.md, docs/ROADMAP.md y .env.example (solo nombres).

Hecho cuando: la fase 2 genera la ficha correcta para Proppit, la valida antes de enviarla y muestra el estado por propiedad y por portal; la fase 3 sincroniza con GHL y permite comparar con Tokko y decidir cuándo apagarlo. Dime qué verificaste de verdad, qué no pudiste verificar (lo que dependa de portales reales) y qué decidiste sin consultarme.
````
