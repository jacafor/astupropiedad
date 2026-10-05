# 07 · Propiedades y fichas (P1 · D-11)

**Tú das:** el inventario real. Tú lo actualizas (D-11), así que esta sesión deja el archivo listo para que lo edites con facilidad. Reúne, **por cada propiedad**:

| Dato | Ejemplo |
|---|---|
| id / código interno | `JM-001` |
| título | Departamento en Jesús María |
| operación | venta / alquiler |
| tipo | departamento, casa, terreno… |
| distrito | Jesús María |
| precio y moneda | 185000 USD |
| área total y construida (m²) | 90 / 85 |
| dormitorios, baños, cocheras | 3 / 2 / 1 |
| descripción (2-4 líneas, sin "garantizado") | … |
| estado | disponible / reservada / vendida |
| fotos | nombres de archivo en `public/imagenes/` (propias, no de internet) |

Si todavía no tienes los datos, pega el prompt igual: la sesión deja la estructura y un solo ejemplo marcado como "EJEMPLO – no publicar".
**Depende de:** 02 y 04.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: una sola fuente de datos de propiedades y fichas individuales. Responde en español, tono "tú". No inventes ningún dato de propiedad: precios, m², fotos y descripciones solo los que yo te dé (AGENTS.md regla 1).

Lee antes: docs/DECISIONES.md D-11; docs/auditorias/AUDITORIA-FUNCIONALIDADES.md Bloques B y C (tipo Property propuesto); y en node_modules/next/dist/docs/: dynamic routes, generateStaticParams, generateMetadata y json-ld. Recuerda que en Next 16 `params` es una Promesa (await).

Tareas:
1. src/data/properties.ts con el tipo Property (id, slug, título, operación, tipo, distrito, precio y moneda, áreas, dormitorios/baños/cocheras, descripción, estado, fotos[] con alt) y una función de ayuda para obtener por slug y listar disponibles. Importa los datos que yo te pase; si no hay, deja un único elemento claramente marcado como EJEMPLO que no aparezca en producción.
2. Elimina los arrays escritos a mano de propiedades/page.tsx (líneas ~10-17) y FeaturedProperties.tsx (líneas ~7-44): ambos leen de src/data/properties.ts. Quita lo que quede de Unsplash.
3. /propiedades/[slug] como Server Component con generateStaticParams, generateMetadata (título/description por propiedad), galería de fotos con next/image, datos clave, botón de WhatsApp con mensaje prellenado (waLink con título, id y precio), JSON-LD de la propiedad y propiedades similares. Slug inexistente → notFound().
4. El catálogo enlaza a cada ficha; filtros actuales siguen funcionando; estado vacío con acción ("No hay propiedades con esos filtros — Ver todas / Escríbenos por WhatsApp").
5. Añade las fichas a sitemap.ts.
6. docs/INTEGRACIONES.md/NEGOCIO-Y-CONTENIDO.md: sección "Cómo agregar una propiedad" en 5 pasos, para que yo lo haga sin ayuda.

Pruebas (build de producción, puerto libre, apágalo): cada ficha carga con sus datos y foto; slug falso da 404; los botones de WhatsApp abren el mensaje correcto; filtros y estado vacío; 390 px y 1280 px; npx tsc --noEmit && npm run lint && npm run build.

Dime qué verificaste de verdad, qué datos faltan por mi parte y qué no pudiste comprobar. Marca el ROADMAP.
````
