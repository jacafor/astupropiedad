@AGENTS.md

# Notas específicas para Claude Code

`AGENTS.md` (importado arriba) es la guía principal y se comparte con otras herramientas. Aquí solo va lo propio de Claude Code.

## Cómo trabajar en este repo

- **Empieza y cierra cada sesión con el "Protocolo de sesión" de `AGENTS.md`** (qué leer, qué actualizar, qué reportar). El resumen de diseño de `AGENTS.md` y `docs/DISENO.md` mandan en cualquier cambio visual.

- **Responde en español.** Código, commits y documentación también en español (los identificadores existentes mezclan inglés; no los renombres sin motivo).
- **Lee antes de escribir:** para cualquier API de Next consulta `node_modules/next/dist/docs/` (regla de `AGENTS.md`). Para decisiones de negocio o contenido, `docs/NEGOCIO-Y-CONTENIDO.md`.
- **Documentación bajo demanda** (no se carga sola; ábrela cuando la tarea lo pida): `docs/ARQUITECTURA.md`, `docs/DISENO.md`, `docs/NEGOCIO-Y-CONTENIDO.md`, `docs/INTEGRACIONES.md`, `docs/ROADMAP.md`, `docs/DECISIONES.md`, `docs/prompts/` (un prompt por sesión), y los informes `docs/auditorias/AUDITORIA-WEB.md` / `docs/auditorias/AUDITORIA-FUNCIONALIDADES.md`.
- **Mantén la documentación al día:** si cambias rutas, componentes, variables de entorno o decisiones, actualiza el `.md` correspondiente en el mismo cambio. Al terminar una tarea del roadmap, marca su casilla en `docs/ROADMAP.md`.
- **Un cambio por tarea, verificable por separado.** Prueba cada arreglo antes del siguiente (en este orden de prioridad: que no se pierda trabajo → que la pantalla no mienta → estado vacío → acción principal → feedback → móvil → resto).
- **No amplíes el alcance.** Si ves otro problema, anótalo (en `docs/ROADMAP.md` o dilo) y sigue con lo pedido.

## Comandos de barra del proyecto (`.claude/commands/`)

| Comando | Para qué |
|---|---|
| `/nueva-pagina <ruta> <objetivo>` | Crea una página como Server Component con metadata, sitemap y checklist |
| `/auditar [ruta o área]` | Auditoría rápida (SEO + accesibilidad + funcionalidad) con las skills del proyecto |
| `/probar-movil [ruta]` | Recorrido real a 390 px en el navegador integrado |
| `/revisar-deploy` | Lista de verificación previa a desplegar (tipos, lint, build, contacto, enlaces) |

## Navegador y servidor de desarrollo

`.claude/launch.json` define el servidor `web` (`npm run dev`, puerto 3000) para abrirlo en el navegador integrado. Para probar el build de producción: `npm run build` y `npx next start -p 3055`; **apaga el servidor al terminar**.
Si pruebas formularios, usa datos de prueba (nunca datos reales de clientes) y un webhook de prueba.

## Contexto que no se deduce del código

- Contacto, dominio y tono ("tú") ya están decididos (ver `docs/DECISIONES.md` D-9, D-10). El cliente (AS Tupropiedad) aún no ha confirmado: dirección, horario, fichas reales de propiedades, fotos del equipo ni las cifras de la sección "Nosotros". Ver `docs/DECISIONES.md` → *Pendientes*.
- GoHighLevel (GHL) es el CRM previsto; no hay credenciales en el repo. Ver `docs/INTEGRACIONES.md`.
- El HTML anterior (`legacy/`) está archivado fuera del proyecto en `../Web-AS-Tupropiedad-respaldo/legacy.zip`; `Imagenes/` se eliminó por ser un duplicado de `public/imagenes/`. Ambas siguen en el primer commit del historial git (D-12).
