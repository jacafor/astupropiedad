# Decisiones

Registro corto de decisiones técnicas y de producto. Formato: contexto → decisión → consecuencias. Añade una entrada nueva (no reescribas las antiguas) cuando cambie algo importante; si una decisión se revierte, márcala como *reemplazada por D-N*.

**Estados:**
- **Heredada** — ya estaba en el código al configurar el proyecto; nadie la "decidió" en esta fase, pero el código depende de ella.
- **Propuesta** — la sugirió Claude y **nadie la ha aceptado todavía**. No la trates como acuerdo.
- **Aceptada** — la persona responsable la confirmó (con fecha).

Cada entrada lleva `estado`, `fecha` y `responsable` (quien debe validarla). Para aceptar una propuesta, cambia el estado y escribe la fecha.

## Tomadas

### D-1 · Next.js 16 con App Router
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Contexto:** sitio de marketing con simuladores; despliegue en Vercel.
- **Decisión:** Next.js 16.2.0 (Turbopack por defecto), React 19.2, App Router.
- **Consecuencias:** APIs de petición asíncronas, `proxy` en lugar de `middleware`, `metadata` solo en Server Components. Antes de escribir código leer `node_modules/next/dist/docs/` (regla de `AGENTS.md`). Pendiente subir a `16.3.8` por avisos de seguridad (instalar dependencias requiere confirmación, ver `AGENTS.md`).

### D-2 · Tailwind CSS 4 con tokens en CSS
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Decisión:** tokens de marca en `@theme inline` de `globals.css`; sin `tailwind.config`.
- **Consecuencias:** colores nuevos = token nuevo, no hex suelto. Ver [DISENO.md](DISENO.md).

### D-3 · Animación con framer-motion
- **Estado:** Heredada · **Fecha:** 2026-10-04 (registrada) · **Responsable:** equipo técnico
- **Decisión:** `motion` + `whileInView` para entradas; `lucide-react` para iconos.
- **Consecuencias:** obliga a componentes cliente. Limitar su uso a donde aporte y respetar `prefers-reduced-motion`.

### D-4 · GoHighLevel como CRM
- **Estado:** **Propuesta** (inferida: solo existe un componente `GHLForm` sin uso y textos "(GHL)" en botones; no hay credenciales ni confirmación) · **Fecha:** 2026-10-04 · **Responsable:** cliente / quien administra GHL
- **Decisión propuesta:** los leads se envían a GHL (formularios, calendario, flujos).
- **Consecuencias:** requiere credenciales y definición del flujo de atención. Ver [INTEGRACIONES.md](INTEGRACIONES.md). *(Método de integración: pendiente, ver P-5.)*

### D-5 · Sitio estático primero
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** equipo técnico
- **Decisión propuesta:** mantener las páginas estáticas mientras sea posible; lo dinámico (leads, inventario) entra por Server Actions y datos en build/ISR.
- **Consecuencias:** las fichas de propiedad usarán `generateStaticParams`; el catálogo leerá de `src/data` o Supabase (ver P-3).

### D-6 · Documentación como parte del código
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** equipo técnico
- **Decisión propuesta:** `AGENTS.md`/`CLAUDE.md` + `docs/` se mantienen en el mismo cambio que el código; el roadmap se marca al cerrar tareas.

### D-7 · Informes de auditoría en `docs/auditorias/`
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero (aprobó el movimiento en chat)
- **Contexto:** los informes se generaron en la raíz del repo y la saturaban.
- **Decisión:** `AUDITORIA-WEB.md` y `AUDITORIA-FUNCIONALIDADES.md` viven en `docs/auditorias/`. Son una **foto de oct 2026**: no se editan al avanzar; el seguimiento vive en [ROADMAP.md](ROADMAP.md). Una auditoría nueva = archivo nuevo con fecha.
- **Consecuencias:** enlaces reescritos en AGENTS.md, CLAUDE.md, README.md, docs/ y `.claude/commands/`.

### D-8 · Metas de calidad del sitio
- **Estado:** **Propuesta** · **Fecha:** 2026-10-04 · **Responsable:** jforero / cliente
- **Decisión propuesta:** al terminar las fases 0-2 del roadmap, repetir la auditoría con meta **SEO ≥ 75, UX ≥ 70, accesibilidad ≥ 80** y lint 0 errores / 0 advertencias. Línea base: SEO 32, UX 36, accesibilidad ≈ 35 (estimada).
- **Consecuencias:** son números elegidos por Claude para tener un criterio de "terminado"; ajústalos si el negocio pide otro nivel.

### D-9 · Datos de contacto oficiales (cierra P-1)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero (los entregó en chat; conviene que el cliente los ratifique por escrito)
- **Decisión:** WhatsApp/teléfono **+51 977 588 905** (`51977588905`), correo **ventas@astupropiedad.com**, dominio **astupropiedad.com** (se deduce del correo: el usuario no escribió el dominio aparte).
- **Consecuencias:** viven solo en `src/lib/contact.ts` (creado el mismo día y usado en navbar, footer y botón flotante; verificado en el HTML de `/`, `/propiedades` y `/vender`). Quedan **residuos viejos** (ver P-11).
- **Sin decidir:** si el sitio responde en `astupropiedad.com` o `www.astupropiedad.com` (hoy se asume sin `www`), y qué pasa con el dominio `.pe` que aparece en `GHLForm` y en el HTML anterior (archivado, ver D-12).

### D-10 · Tratamiento "tú" (cierra P-2)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero
- **Decisión:** todo el sitio trata al visitante de **"tú"**, sin mezclar con "usted". Aplica a CTAs, simuladores, formularios y mensajes de error.
- **Consecuencias:** hay que reescribir los textos que hoy usan "usted" (ejemplo: "Agende una videollamada…" en el footer). Aplicado en la sesión 03 (2026-10-05, ver D-16).

### D-11 · El inventario lo actualiza jforero, en código (cierra P-3)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-04 · **Responsable:** jforero
- **Decisión:** las propiedades viven en `src/data/properties.ts` (un solo archivo, un tipo `Property`). Quien actualiza el inventario es jforero, con Claude o a mano; no hay panel ni base de datos por ahora.
- **Consecuencias:** no se necesita Supabase en esta etapa. Si más personas van a editar inventario sin tocar código, esta decisión se revisa (entrada nueva).

### D-12 · Repositorio git y limpieza de duplicados (cierra P-7 y P-8)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 · **Responsable:** jforero
- **Decisión:** el proyecto es un repositorio git (rama `main`, identidad local Jaime Forero, sin `--global`). `Imagenes/` se eliminó tras comprobar de nuevo que sus 14 archivos eran idénticos byte a byte a los de `public/imagenes/` y que nada en `src/` ni en la configuración la usaba. `legacy/` (2 HTML) se archivó en `../Web-AS-Tupropiedad-respaldo/legacy.zip`, fuera del proyecto, y se quitó del árbol.
- **Consecuencias:** ambas carpetas siguen recuperables en el primer commit ("Estado inicial del proyecto"). El remoto es `origin` = https://github.com/jacafor/astupropiedad (primer `git push -u origin main` el 2026-10-05). La visibilidad **privada** no se pudo comprobar desde aquí: confírmala en GitHub → Settings. Con remoto ya se puede habilitar CI (ver `docs/prompts/12-pruebas-ci-docs.md`).

### D-13 · Estilo de la barra de navegación según la ruta
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la decidió Claude en la sesión 01 sin consultar)
- **Decisión propuesta:** la barra es transparente con texto blanco solo en las rutas listadas en `RUTAS_CON_HERO_OSCURO` (`Navbar.tsx`); en cualquier otra ruta es sólida desde el inicio. Así una página nueva con fondo claro nunca deja la barra invisible.
- **Consecuencias:** al crear una ruta con hero oscuro, hay que añadirla a esa lista (anotado en `ARQUITECTURA.md`).

### D-14 · Push, pull request y merge al cerrar cada sesión (durante el desarrollo)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 (ampliada el mismo día para incluir el merge) · **Responsable:** jforero
- **Decisión:** cada sesión termina con `push` de su rama, pull request hacia `main` y **merge automático por Claude**, sin que haya que pedirlo. Condiciones: `tsc`, lint y build locales pasan (lint sin empeorar) y el preview de Vercel está en *Ready*; si algo falla, no se fusiona y se avisa. Cada merge **despliega a producción** (solo en `*.vercel.app`; sin dominio). Vigente hasta que jforero declare terminado el desarrollo; entonces se revisa (y se puede reabrir la protección de `main`, ver P-12).
- **Consecuencias:** reemplaza la regla anterior "sin `push` salvo que se pida" de `AGENTS.md` y `docs/prompts/README.md`.

### D-15 · Contenido sin respaldo se quita, no se sustituye (sesión 02)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la tomó Claude en la sesión 02 sin consultar; reversible)
- **Decisión propuesta:** aplicando el valor por defecto de P-10, se quitaron cifras, nombres de bancos, "garantizado"/"100 %" y el equipo ficticio (en `/nosotros` queda una sección "Pronto conocerás al equipo" con WhatsApp, sin personas inventadas). La propiedad de Unsplash de la home pasó a una tarjeta "Próximamente". Los CTA sin embudo enlazan a WhatsApp con mensaje contextual (los simuladores incluyen los valores que escribió la persona). Redes sociales y Privacidad/Términos se ocultan hasta tener URL y páginas.
- **Consecuencias:** al reponer una cifra o un nombre, debe traer fuente y fecha. Al llegar el embudo (sesión 05), los CTA de WhatsApp se cambian por el formulario.

### D-16 · Español natural salvo marca o servicio (cierra P-6)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 · **Responsable:** jforero (aprobó la tabla de cambios en la sesión 03; el cliente aún no ha revisado la lista)
- **Decisión:** se aplicó el valor por defecto de P-6. Se conservan **Personal Shopper** (servicio de la marca; jforero lo confirmó), *Premium*, *marketing*, *Boutique Inmobiliaria*; *cap rate*, TEA y *home staging* se conservan **explicados** la primera vez; el resto de anglicismos se tradujo. Se eliminaron todas las formas de "usted" (cumple D-10). Detalle y lista en [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md) §3.
- **Consecuencias:** si el cliente pide recuperar un término en inglés como marca, se revierte ese texto (entrada nueva). Impacto SEO: los titulares ya no usan "Real Estate"/"Flat"; las búsquedas peruanas dicen "departamento" e "inmobiliaria".

### D-17 · Metadata centralizada y JSON-LD mínimo (sesión 04)
- **Estado:** **Propuesta** · **Fecha:** 2026-10-05 · **Responsable:** jforero (la tomó Claude sin consultar; reversible)
- **Decisión propuesta:** títulos y descripciones viven en `src/lib/rutas.ts` y se aplican con `rutaMetadata()`; el sitemap sale de la misma lista. Del borrador de la auditoría se descartaron las frases sin respaldo ("valoración gratuita", "experiencia bancaria", "red de compradores calificados"). El JSON-LD `RealEstateAgent` solo lleva nombre, URL, teléfono, correo y logo. Canonical y sitemap asumen `astupropiedad.com` sin `www` (P-12).
- **Consecuencias:** hasta asignar el dominio, canonical/OG/sitemap apuntan a un dominio que aún sirve otra web. Detalle en [SEO.md](SEO.md).

## Pendientes (necesitan respuesta del cliente o del equipo)

P-1, P-2 y P-3 se cerraron el 2026-10-04 (ver D-9, D-10, D-11); P-7 y P-8 el 2026-10-05 (ver D-12); P-6 el 2026-10-05 (ver D-16). Cada pendiente indica **quién decide**, **qué hay que entregar para cerrarlo** y **qué se hará por defecto** si no hay respuesta (el valor por defecto es provisional y nunca toca datos del cliente).

| ID | Pregunta | Quién decide | Qué se necesita para cerrarlo | Por defecto (provisional) | Bloquea |
|---|---|---|---|---|---|
| **P-4** | ¿Moneda principal: USD, PEN o ambas? | jforero / cliente | Moneda en que se publican precios y fuente del tipo de cambio | Ambas con tipo de cambio editable (los precios hoy están en USD) | Simuladores, fichas |
| **P-5** | GHL: ¿webhook o API? ¿pipeline/etiquetas/campos? | Cliente / quien administra GHL | Acceso a la cuenta (o URL de un **webhook de prueba**), nombre del pipeline, campos y etiquetas, calendario a embeber | Webhook para empezar | Embudo de leads |
| ~~P-6~~ | *(cerrada el 2026-10-05, ver D-16)* ¿Se mantienen los anglicismos (Elite Portfolio, Off-Market, Flat, Cap Rate…)? | Cliente | Lista de términos que son marca/servicio y deben conservarse | Español natural, salvo marca/servicio | Textos y SEO |
| **P-9** | ¿Qué se promete con la valoración ("en 10 minutos")? ¿Quién atiende y en qué horario? | Cliente | SLA real: plazo de respuesta, canal, horario, responsable | Texto sin plazo concreto | `/vender` |
| **P-10** | ¿Qué cifras de "Nosotros" son verificables y qué convenios bancarios se pueden nombrar? | Cliente | Cada cifra con su respaldo (fecha y fuente) y autorización escrita para nombrar bancos | Quitar lo no respaldado | Credibilidad y riesgo legal |
| **P-11** | Residuos del teléfono/dominio viejos: flyers de `public/imagenes/` que muestran **940 215 027** y `GHLForm.tsx` con `link.as-tupropiedad.pe` | jforero | Decidir si se rehacen los flyers con el número nuevo o se dejan de usar; confirmar el dominio de GHL | Los flyers siguen en el repo | Coherencia de contacto |
| **P-12** | Vercel: ¿se protege `main` (pull request obligatorio)? ¿Quién y cuándo asigna `astupropiedad.com` a producción, con o sin `www`? | jforero | **Hecho 2026-10-05:** repo conectado (producción = `main`, previews activos, Node 24.x, 0 variables de entorno), flujo en [DESPLIEGUE.md](DESPLIEGUE.md). **Decidido por jforero 2026-10-05:** `main` **sin** protección mientras dure el desarrollo (revisar antes de publicar el dominio); el dominio se asigna **más adelante**, porque hoy sirve otra web en producción. **Sigue abierto:** quién y cuándo asigna el dominio (y quién administra el DNS; revisar que `ventas@astupropiedad.com` no dependa de registros que se pisen) y con o sin `www` (el código asume sin `www`) | Producción solo en la URL `*.vercel.app`; **sin** asignar dominio | Dominio de producción |

### P-13 · Datos de las fichas que contradicen los flyers
Detalle en el informe de la sesión 02 (home `FeaturedProperties` y `/propiedades`): el catálogo muestra precio, m², dormitorios, baños y distritos que no coinciden con los flyers de `public/imagenes/`, y varias fotos corresponden a otro inmueble. **Quién decide:** jforero / cliente. **Se necesita:** ficha real por propiedad (precio, m², dormitorios, baños, cocheras, distrito, estado) y fotos limpias. **Por defecto:** se dejan como están (marcadas como contradictorias) hasta la sesión 07. **Bloquea:** sesión 07 y la credibilidad del catálogo.

## Supuestos escritos en los documentos que **aún no se han validado**

No los trates como hechos. Antes de publicar algo basado en ellos, confírmalos con quien corresponda:

| Supuesto | Dónde aparece | Quién lo valida |
|---|---|---|
| Normativa peruana aplicable: Ley 29733 (datos personales), Libro de Reclamaciones, publicidad ante INDECOPI, registro de agentes inmobiliarios | [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md), auditorías | Asesoría legal |
| Tratamiento de la alcabala (tramo inafecto) y de la plusvalía en los simuladores | Auditoría de funcionalidades (Bloque D) | Contador / notario |
| Fórmula de tasa mensual `(1+TEA)^(1/12)−1` y TCEA | Auditoría web C7 | Revisar con un simulador bancario real |
| Ratios de contraste de color | Auditoría web, accesibilidad | Medir con herramienta (son aproximados) |
| Puntaje de accesibilidad ≈ 35 | Auditoría web | Es estimación, no medición con herramienta automática |
