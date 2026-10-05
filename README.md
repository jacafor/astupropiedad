# AS Tupropiedad — sitio web

Sitio de **AS Tupropiedad**, boutique inmobiliaria en Lima (Perú): compra, venta e inversión de inmuebles, con simulador hipotecario y calculadora de rentabilidad.

> **Estado (oct 2026):** diseño y navegación listos; **captura de leads, catálogo con datos reales y SEO base pendientes.** Ver [docs/ROADMAP.md](docs/ROADMAP.md).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · framer-motion · lucide-react · Vercel.

## Empezar

Requisitos: Node ≥ 20.9 y npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Chequeo de tipos |

Variables de entorno: copia `.env.example` a `.env.local` y completa lo que necesites (todas son opcionales hoy; las integraciones aún no están conectadas). Detalle en [docs/INTEGRACIONES.md](docs/INTEGRACIONES.md).

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Inicio: hero, calculadora de retorno, destacadas, personal shopper, zonas, hipoteca, equipo |
| `/propiedades` | Catálogo con filtro por tipo y distrito |
| `/vender` | Asistente de valoración en 3 pasos |
| `/simulador-hipotecario` | Cuota, intereses y pago total |
| `/simulador-inversion` | Cap rate, flujo mensual y proyección a 5 años |
| `/servicios` · `/nosotros` | Información corporativa |

## Documentación

| Documento | Contenido |
|---|---|
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Guía para agentes de IA (reglas, comandos, convenciones) |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Estructura, rutas, componentes, deuda técnica |
| [docs/DISENO.md](docs/DISENO.md) | Sistema de diseño y reglas de accesibilidad |
| [docs/NEGOCIO-Y-CONTENIDO.md](docs/NEGOCIO-Y-CONTENIDO.md) | Marca, tono, política de afirmaciones, datos de contacto, legal |
| [docs/INTEGRACIONES.md](docs/INTEGRACIONES.md) | GoHighLevel, WhatsApp, analítica, variables de entorno |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Plan priorizado con casillas de avance |
| [docs/DECISIONES.md](docs/DECISIONES.md) | Decisiones tomadas y pendientes |
| [docs/prompts/](docs/prompts/README.md) | Un prompt por sesión de trabajo (orden y datos que necesita cada uno) |
| [AUDITORIA-WEB.md](docs/auditorias/AUDITORIA-WEB.md) | Auditoría de SEO, UX y accesibilidad |
| [AUDITORIA-FUNCIONALIDADES.md](docs/auditorias/AUDITORIA-FUNCIONALIDADES.md) | Inventario de funcionalidades y cómo completarlas |

## Despliegue

Vercel (proyecto `web-as-tupropiedad`, configuración en `vercel.json`). Antes de desplegar: `/revisar-deploy` o la lista de [AGENTS.md](AGENTS.md#antes-de-dar-algo-por-terminado).

## Carpetas ajenas al sitio actual

`legacy/` (HTML anterior, solo referencia) e `Imagenes/` (copia duplicada de `public/imagenes/`).
