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
- **Consecuencias:** hay que reescribir los textos que hoy usan "usted" (ejemplo: "Agende una videollamada…" en el footer). Pendiente de hacer: ver `docs/prompts/`.

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

### D-14 · Push y pull request al cerrar cada sesión (durante el desarrollo)
- **Estado:** **Aceptada** · **Fecha:** 2026-10-05 · **Responsable:** jforero
- **Decisión:** cada sesión termina con `push` de su rama y un pull request hacia `main`, sin que haya que pedirlo. Claude **no fusiona**: el merge despliega a producción y lo pulsa jforero. Vigente hasta que jforero declare terminado el desarrollo; entonces se revisa (y se puede reabrir la protección de `main`, ver P-12).
- **Consecuencias:** reemplaza la regla anterior "sin `push` salvo que se pida" de `AGENTS.md` y `docs/prompts/README.md`.

## Pendientes (necesitan respuesta del cliente o del equipo)

P-1, P-2 y P-3 se cerraron el 2026-10-04 (ver D-9, D-10, D-11); P-7 y P-8 el 2026-10-05 (ver D-12). Cada pendiente indica **quién decide**, **qué hay que entregar para cerrarlo** y **qué se hará por defecto** si no hay respuesta (el valor por defecto es provisional y nunca toca datos del cliente).

| ID | Pregunta | Quién decide | Qué se necesita para cerrarlo | Por defecto (provisional) | Bloquea |
|---|---|---|---|---|---|
| **P-4** | ¿Moneda principal: USD, PEN o ambas? | jforero / cliente | Moneda en que se publican precios y fuente del tipo de cambio | Ambas con tipo de cambio editable (los precios hoy están en USD) | Simuladores, fichas |
| **P-5** | GHL: ¿webhook o API? ¿pipeline/etiquetas/campos? | Cliente / quien administra GHL | Acceso a la cuenta (o URL de un **webhook de prueba**), nombre del pipeline, campos y etiquetas, calendario a embeber | Webhook para empezar | Embudo de leads |
| **P-6** | ¿Se mantienen los anglicismos (Elite Portfolio, Off-Market, Flat, Cap Rate…)? | Cliente | Lista de términos que son marca/servicio y deben conservarse | Español natural, salvo marca/servicio | Textos y SEO |
| **P-9** | ¿Qué se promete con la valoración ("en 10 minutos")? ¿Quién atiende y en qué horario? | Cliente | SLA real: plazo de respuesta, canal, horario, responsable | Texto sin plazo concreto | `/vender` |
| **P-10** | ¿Qué cifras de "Nosotros" son verificables y qué convenios bancarios se pueden nombrar? | Cliente | Cada cifra con su respaldo (fecha y fuente) y autorización escrita para nombrar bancos | Quitar lo no respaldado | Credibilidad y riesgo legal |
| **P-11** | Residuos del teléfono/dominio viejos: flyers de `public/imagenes/` que muestran **940 215 027** y `GHLForm.tsx` con `link.as-tupropiedad.pe` | jforero | Decidir si se rehacen los flyers con el número nuevo o se dejan de usar; confirmar el dominio de GHL | Los flyers siguen en el repo | Coherencia de contacto |
| **P-12** | Vercel: ¿se protege `main` (pull request obligatorio)? ¿Quién y cuándo asigna `astupropiedad.com` a producción, con o sin `www`? | jforero | **Hecho 2026-10-05:** repo conectado (producción = `main`, previews activos, Node 24.x, 0 variables de entorno), flujo en [DESPLIEGUE.md](DESPLIEGUE.md). **Decidido por jforero 2026-10-05:** `main` **sin** protección mientras dure el desarrollo (revisar antes de publicar el dominio); el dominio se asigna **más adelante**, porque hoy sirve otra web en producción. **Sigue abierto:** quién y cuándo asigna el dominio (y quién administra el DNS; revisar que `ventas@astupropiedad.com` no dependa de registros que se pisen) y con o sin `www` (el código asume sin `www`) | Producción solo en la URL `*.vercel.app`; **sin** asignar dominio | Dominio de producción |

## Supuestos escritos en los documentos que **aún no se han validado**

No los trates como hechos. Antes de publicar algo basado en ellos, confírmalos con quien corresponda:

| Supuesto | Dónde aparece | Quién lo valida |
|---|---|---|
| Normativa peruana aplicable: Ley 29733 (datos personales), Libro de Reclamaciones, publicidad ante INDECOPI, registro de agentes inmobiliarios | [NEGOCIO-Y-CONTENIDO.md](NEGOCIO-Y-CONTENIDO.md), auditorías | Asesoría legal |
| Tratamiento de la alcabala (tramo inafecto) y de la plusvalía en los simuladores | Auditoría de funcionalidades (Bloque D) | Contador / notario |
| Fórmula de tasa mensual `(1+TEA)^(1/12)−1` y TCEA | Auditoría web C7 | Revisar con un simulador bancario real |
| Ratios de contraste de color | Auditoría web, accesibilidad | Medir con herramienta (son aproximados) |
| Puntaje de accesibilidad ≈ 35 | Auditoría web | Es estimación, no medición con herramienta automática |
