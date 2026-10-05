# 11 · Imágenes y rendimiento (P2)

**Tú das:** tu OK a renombrar y a borrar los archivos sin uso (están autorizados abajo; quita la línea que no quieras). Para los flyers con el teléfono viejo (P-11) decides tú: **la sesión no los borra ni los edita**.
**Depende de:** 00 y 07 (las fichas usan las fotos).
**Autorizo en este prompt:** renombrar archivos de `public/imagenes/` (sin espacios ni acentos) y borrar los que nadie usa.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: imágenes ligeras y bien usadas. Responde en español. Lee docs/auditorias/AUDITORIA-WEB.md (rendimiento) y, en node_modules/next/dist/docs/, la guía de next/image (qualities, remotePatterns, sizes, priority).

Autorizo: renombrar archivos de public/imagenes/ a nombres sin espacios ni acentos (minúsculas con guiones) y borrar los que confirmes que ningún archivo referencia (la auditoría señaló 6601394_….jpg y 5 SVG de plantilla en public/). No autorizo borrar flyers ni fotos de propiedades, ni editar imágenes con teléfono o datos (P-11).

Tareas:
1. Inventario: tabla archivo | tamaño | dónde se usa (grep) | acción. Muéstrala antes de renombrar o borrar.
2. Convierte a WebP los PNG pesados (~1 MB) que se usan en el sitio (conserva el original solo si lo piden; el historial de git ya lo guarda). Verifica visualmente que no se degradan.
3. Reemplaza los 5 <img> crudos por next/image con width/height o fill, `sizes` correctos y `priority` solo en la imagen principal de cada página. Mantén el aspecto.
4. alt descriptivo en cada imagen (la accesibilidad completa es la sesión 08).
5. Renombra con actualización de TODAS las referencias (src/, metadata, OG). Comprueba con grep que no queda una ruta rota ni nombres con espacios.
6. Lista qué flyers/imágenes contienen el teléfono viejo 940 215 027 (míralos uno por uno) para que yo decida: solo reporta, no los toques.

Pruebas: build de producción; recorre las 7 rutas a 390 y 1280 px sin imágenes rotas (revisa la consola y la red por 404); compara peso total antes/después; npx tsc --noEmit && npm run lint && npm run build.

Entrega: tabla antes/después (MB por imagen y total), lista de archivos renombrados/borrados, flyers con teléfono viejo y qué no verificaste. Marca el ROADMAP y actualiza P-11 en DECISIONES.md.
````
