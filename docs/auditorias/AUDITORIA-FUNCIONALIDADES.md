# Auditoría de funcionalidades — AS Tupropiedad

**Fecha:** 3 oct 2026 · **Complementa:** [AUDITORIA-WEB.md](AUDITORIA-WEB.md) (SEO / UX / accesibilidad)
**Método:** inventario de cada función visible del sitio, probada en la build de producción local (`next start`, navegador real a 390 px y ~800 px) y confirmada contra el código. Para cada una: ¿funciona?, ¿qué le falta?, ¿cómo se completa?
**Documentación consultada:** guías de Forms (Server Actions), `after`, variables de entorno y MDX de `node_modules/next/dist/docs`.

**Leyenda:** ✅ funciona · ⚠️ funciona a medias · ❌ existe pero no hace nada · 🚫 no existe

---

## 1. Veredicto en una mirada

El sitio tiene **la fachada de una plataforma inmobiliaria completa** (catálogo, valoración, simuladores, calendario, portal de consultores) pero **hoy solo funciona la parte de "mirar y calcular"**. Todo lo que convierte una visita en un cliente es decorativo.

| Capa | Estado |
|---|---|
| Navegación entre las 7 páginas | ✅ |
| Calculadoras (mientras la entrada sea razonable) | ⚠️ |
| Catálogo (filtro por tipo y distrito) | ⚠️ |
| **Captura de leads** (formularios, calendario, reporte, WhatsApp) | ❌ |
| **Datos de propiedades** (fuente única, fichas, galerías) | 🚫 |
| **Backend / CRM / notificaciones** | 🚫 |
| **Analítica y medición** | 🚫 |
| **Páginas legales y de confianza** | 🚫 |

**Cuenta rápida:** de las **41 funciones inventariadas** (tabla 2), **2** funcionan sin reservas (navbar de escritorio y "Contacto Directo"), **18** funcionan a medias, **17** existen pero no hacen nada y **4** no existen. Aparte, la sección "No existen" lista otras funciones que un usuario o la ley esperarían y que ni siquiera están en pantalla.

---

## 2. Inventario de funcionalidades

### 2.1 Navegación y estructura

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 1 | Navbar de escritorio (6 enlaces + "Contacto Directo") | ✅ | Los 7 destinos responden 200. Cambia a fondo blanco al hacer scroll > 50 px. |
| 2 | Menú móvil (hamburguesa) | ⚠️ | Abre, lista los enlaces y cierra al tocar uno (probado a 390 px). Sin `aria-label`/`aria-expanded`, no cierra con Esc ni al tocar fuera, no bloquea el scroll del fondo. |
| 3 | Navbar visible en todas las páginas | ❌ | En `/propiedades` es blanco sobre blanco: sin menú visible hasta hacer scroll. |
| 4 | Enlaces del footer | ⚠️ | Funcionan pero con `<a href>` (recarga completa, sin prefetch). 5 enlaces de la home son `href="#"` (redes sociales, privacidad, términos). |
| 5 | Anclas internas de la home | ⚠️ | Existen `#comprar`, `#inversores`, `#servicios`, `#hipoteca`, `#contacto`. **`#vender` no existe** (lo usa el botón del hero). `#inversores`, `#servicios` e `#hipoteca` no se enlazan desde ningún sitio. |
| 6 | Página 404 | ⚠️ | Responde 404 correctamente pero con el diseño por defecto de Next, en inglés ("This page could not be found"). |
| 7 | Buscador global del sitio | 🚫 | — |
| 8 | Página de contacto (`/contacto`) | 🚫 | Da 404. El "contacto" es solo el footer. |
| 9 | Páginas legales (`/privacidad`, `/terminos`) | 🚫 | Dan 404; los enlaces del footer son `#`. |

### 2.2 Home

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 10 | Hero: "Explorar Catálogo" | ⚠️ | Baja a `#comprar` (las 3 destacadas), no al catálogo `/propiedades`. |
| 11 | Hero: "Vender mi propiedad" | ❌ | Apunta a `#vender`, ancla inexistente: el clic no hace nada. |
| 12 | Indicador "Scroll" | ⚠️ | Funciona con mouse; es un `<div onClick>` inalcanzable con teclado. |
| 13 | Calculadora de retorno (`InvestmentSmarter`) | ⚠️ | Calcula. Pero llama "Cap Rate" a la rentabilidad **bruta** y al terminar no ofrece ninguna acción (sin CTA, sin guardar, sin enviar). |
| 14 | Calculadora hipotecaria rápida (`MortgageBasic`) | ⚠️ | Sliders OK. Plazo `0` → `$∞`; plazo `-5` o cuota inicial `150 %` → cuotas negativas. "Contactar a un Broker" no hace nada. |
| 15 | Propiedades destacadas | ⚠️ | 3 tarjetas fijas en el código; ninguna es enlace; una es ficticia (Unsplash); dos usan la misma foto. |
| 16 | "Ver catálogo privado" / "Catálogo Completo" | ❌ | Llevan a `#contacto` (pie de página), no a `/propiedades`. |
| 17 | "Solicitar Asesor Privado" (Personal Shopper) | ❌ | Lleva a `#contacto`; no hay formulario de intake para el servicio que la sección vende. |
| 18 | "Postular al equipo" (reclutamiento) | ❌ | `<div>` con `cursor-pointer`, sin enlace ni formulario. |
| 19 | Zonas (Miraflores, San Isidro, Surco) | ⚠️ | Solo texto; no enlazan a propiedades filtradas por zona. |

### 2.3 Catálogo `/propiedades`

Probado en ejecución con 6 propiedades de muestra.

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 20 | Filtro por tipo (Todos/Venta/Alquiler/Inversión) | ⚠️ | Venta → 5, Inversión → 1, Todos → 6. **"Alquiler" siempre da 0** (no hay datos de alquiler). |
| 21 | Búsqueda por distrito | ⚠️ | Funciona y no distingue mayúsculas ("molina"/"MOLINA" → 2). **No recorta espacios**: `"Molina "` → 0 resultados. Solo busca por distrito (no por título, tipo ni precio). |
| 22 | Estado vacío | ⚠️ | Existe ("No encontramos propiedades…") pero es genérico, sin acción ("limpiar filtros", "avísame cuando haya"). |
| 23 | Alternar vista cuadrícula/lista | ❌ | Cambia `viewMode` pero **ningún código lo usa al renderizar** ([propiedades:22](../../src/app/propiedades/page.tsx:22)). |
| 24 | Botón "Filtros" | ❌ | Sin handler. |
| 25 | Botón de búsqueda (lupa) | ❌ | Sin handler (el filtro ya es en vivo, así que es redundante). |
| 26 | Clic en una propiedad / flecha ↗ | ❌ | Sin ficha de detalle (`/propiedades/1` → 404). |
| 27 | Filtros por precio, dormitorios, baños, m² · orden · paginación · mapa · favoritos · compartir · comparar | 🚫 | Ninguno existe. |

### 2.4 Vender `/vender`

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 28 | Asistente de valoración, pasos 1 y 2 | ⚠️ | Avanza y valida lo mínimo (tipo, distrito). **No hay botón "Atrás"**; "Área m²" y "Habitaciones" no se guardan en estado; al recargar se pierde todo. |
| 29 | Paso 3: "ENVIAR DATOS PARA ANÁLISIS" | ❌ | **Probado:** con nombre y celular escritos, el clic no cambia la pantalla ni genera ninguna petición. Sin `<form>`, sin validación del teléfono (acepta "abc"), sin confirmación, sin consentimiento de datos. |
| 30 | Promesa "análisis en 10 minutos por WhatsApp o correo" | ❌ | No hay backend ni proceso que la cumpla; es un compromiso operativo sin respaldo. |

### 2.5 Simuladores

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 31 | Simulador hipotecario: cuota, intereses, pago total | ⚠️ | Calcula bien con entradas normales (200 000 · 8.5 % · 20 años → $1,736). TEA tratada como nominal; sin seguros ni TCEA; entradas vacías/negativas dan resultados absurdos. |
| 32 | "Relación Cuota/Ingreso" | ❌ | Valor fijo `3.5x`; no hay campo de ingreso. |
| 33 | "Cronograma de pagos / Ver Tabla Completa" | ❌ | Botón sin acción; la tabla no existe. |
| 34 | "PRE-CALIFICAR AHORA (GHL)" | ❌ | Sin acción. |
| 35 | Simulador de inversión: cap rate, cash flow, proyección 5 años | ⚠️ | Los dos sliders y los dos campos funcionan. Alcabala (3 %) y plusvalía (4 %) **no tienen control**: son fijos pero se muestran como parámetros. Costos de notaría ($1,500) e IR (5 %) fijos en el código. |
| 36 | "SOLICITAR REPORTE COMPLETO (GHL)" / PDF | ❌ | Sin acción; el PDF no existe. |

### 2.6 Contacto, confianza y plataforma

| # | Función | Estado | Evidencia / observación |
|---|---|---|---|
| 37 | Botón flotante de WhatsApp | ⚠️ | Se muestra y abre `wa.me`, pero al número de relleno `51900000000`, sin mensaje prellenado. En móvil tapa un CTA del hero. |
| 38 | "Contacto Directo" de la navbar | ✅ | Abre WhatsApp `51940428352` (confirmar que es el número oficial). Sin mensaje prellenado ni contexto de la página. |
| 39 | Calendario de videollamada (footer) | ❌ | "ABRIR CALENDARIO GHL" sin acción; `GHLForm.tsx` existe pero no se usa. |
| 40 | Enlaces de correo y teléfono del footer | ⚠️ | Texto plano, sin `mailto:`/`tel:`; el teléfono es de relleno. |
| 41 | Redes sociales | ❌ | `href="#"` ×3. |

**No existen** (y un usuario o la ley las esperarían): analítica y medición de conversiones, banner de consentimiento de cookies, CRM/backend propio, notificaciones al asesor, panel para editar propiedades, blog, testimonios, FAQ, Libro de Reclamaciones, páginas de privacidad y términos, envío de resultados por correo, versión imprimible/PDF de los simuladores.

---

## 3. Lo que el sitio promete y no entrega

| Promesa en el sitio | Dónde | Realidad hoy |
|---|---|---|
| "Análisis detallado vía WhatsApp o correo en los próximos 10 minutos" | [vender:130](../../src/app/vender/page.tsx:130) | Nada se envía |
| "Reporte PDF con desglose de impuestos y flujo de caja para su banco" | [inversion:120-121](../../src/app/simulador-inversion/page.tsx:120) | No existe el PDF |
| "Visualice su amortización mes a mes" | [hipotecario:142](../../src/app/simulador-hipotecario/page.tsx:142) | No existe la tabla |
| "Pre-calificaciones ágiles / trámite directo con bancos / ejecutivos asignados" | [nosotros:52](../../src/app/nosotros/page.tsx:52), [hipotecario:120](../../src/app/simulador-hipotecario/page.tsx:120) | No hay flujo de pre-calificación |
| "Agende una videollamada estratégica de 15 min" | [Footer:99](../../src/components/Footer.tsx:99) | No hay calendario |
| "Catálogo privado / Off-Market" | [FeaturedProperties:61](../../src/components/FeaturedProperties.tsx:61) | Lleva al footer; no hay área privada |
| "Tour virtual 360°", "Home Staging", "campañas con IA" | [servicios:18](../../src/app/servicios/page.tsx:18), [vender:160,170](../../src/app/vender/page.tsx:160) | Sin muestra ni galería que lo respalde |
| "Asesor exclusivo que entrevista sus necesidades" (Personal Shopper) | [PersonalShopper:61](../../src/components/PersonalShopper.tsx:61) | Sin cuestionario ni alta del servicio |
| "Portal de Consultores" | [PhilosophyAndTeam:55](../../src/components/PhilosophyAndTeam.tsx:55) | No existe el portal ni el formulario de postulación |

---

## 4. Cómo completarlo — arquitectura recomendada

Principio: **primero que funcione el embudo (visitante → lead en GHL → asesor avisado), después que sea bonito y completo.** Cada bloque indica qué desbloquea.

### Bloque A · Embudo de leads *(desbloquea todo lo demás)*

Una sola ruta de captura para los 7 puntos de entrada (valoración, pre-calificación, reporte, calendario, asesor privado, broker, postulación, contacto):

```
Formulario (cliente) ──▶ Server Action ──▶ valida (zod) + anti-spam ──▶ GHL (API/webhook)
                                   │                                   ├─ crea/actualiza contacto
                                   │                                   ├─ etiqueta: origen, página, UTM
                                   │                                   └─ dispara workflow (autorespuesta + aviso al asesor)
                                   └─ after(): registra evento de analítica, no bloquea la respuesta
```

- **Server Action + `useActionState`** (patrón de la guía de Forms de Next 16): `<form action={enviarLead}>`, valida en servidor con `zod`, devuelve `{ ok, errores }` para mostrar errores en español debajo de cada campo. Funciona incluso sin JS (mejora progresiva).
- **Campos mínimos:** nombre, celular (formato `+51 9xx xxx xxx`), correo opcional, `interes` (comprar/vender/invertir/hipoteca/reclutamiento), `origen` (qué botón/página), **casilla de consentimiento** de datos personales con enlace a `/privacidad`, y los datos del contexto (tipo/distrito/m² del asistente; monto/plazo/tasa del simulador; ID de propiedad).
- **Anti-spam:** campo trampa (honeypot) + Cloudflare Turnstile o reCAPTCHA + límite por IP.
- **Variables de entorno (nunca en el código):** `GHL_WEBHOOK_URL` o `GHL_API_KEY` + `GHL_LOCATION_ID` en `.env.local` y en Vercel; usar `after()` de `next/server` para registrar métricas sin retrasar la respuesta.
- **Respuesta al usuario:** estado de carga en el botón, confirmación real ("Recibimos tus datos, te escribimos hoy por WhatsApp"), error entendible y **siempre un plan B**: botón "Escríbenos por WhatsApp" con el mensaje ya armado.
- **Operación:** SLA coherente con lo que promete el sitio (si dice "10 minutos", debe existir alerta inmediata al asesor por WhatsApp/correo en GHL y horario de atención visible).
- **Calendario:** embeber el calendario de GHL en una página `/agendar` (o modal) en lugar del botón muerto; reutilizar `GHLForm.tsx` o `next/script` para el embed.

> **Frase para pegar a Claude Code:** *"Crea `src/app/actions/lead.ts` con una Server Action `enviarLead` que valide con zod (nombre, celular peruano, interés, consentimiento obligatorio, origen y datos de contexto), tenga honeypot, envíe a la URL de webhook de GHL desde `process.env.GHL_WEBHOOK_URL` y devuelva errores en español. Conecta con `useActionState` el formulario de /vender, el CTA del simulador hipotecario, el de inversión, el de 'Contactar a un Broker' y el de reclutamiento. Si falla, muestra un botón de WhatsApp con mensaje prellenado."*

### Bloque B · Fuente única de datos de propiedades *(desbloquea catálogo, fichas, SEO)*

| Opción | Cuándo conviene | Costo/complejidad |
|---|---|---|
| **A. Archivo `src/data/properties.ts`** | Empezar ya (semana 1); edita un desarrollador | Mínimo; sin base de datos |
| **B. Supabase** (tabla `properties` + Storage de fotos + RLS: lectura pública, escritura solo asesores) | Cuando el equipo comercial quiera subir propiedades sin tocar código | Bajo-medio; la integración de Supabase ya está disponible en tu entorno |
| **C. GHL como fuente** | No recomendado: no está pensado como CMS de inventario | — |
| **D. CMS (Sanity/Notion)** | Si necesitas flujo editorial/aprobaciones | Medio |

**Recomendación:** A como puente inmediato y B como destino. Mismo esquema en ambos para migrar sin reescribir.

```ts
type Property = {
  id: string; slug: string;
  titulo: string; tipo: "departamento" | "casa" | "oficina" | "terreno";
  operacion: "venta" | "alquiler"; estado: "disponible" | "reservado" | "vendido";
  precio: number; moneda: "USD" | "PEN";
  distrito: string; direccionAprox: string; lat?: number; lng?: number;
  areaM2: number; dormitorios: number; banos: number; cocheras: number;
  descripcion: string; caracteristicas: string[];
  fotos: { url: string; alt: string }[]; destacada: boolean; publicadaEn: string;
}
```

Con esto: home y catálogo leen del mismo lugar (se acaban las contradicciones), las fotos se limpian (sin texto incrustado) y se generan `sitemap`, JSON-LD y páginas de detalle a partir de los datos.

### Bloque C · Catálogo y fichas completas

- **Fichas** `/propiedades/[slug]` (Server Component + `generateStaticParams` + `generateMetadata`): galería con zoom, ficha técnica, descripción, mapa de zona aproximada, botón **"Consultar por WhatsApp"** con mensaje prellenado ("Hola, me interesa *Depa en Jesús María – US$165,000* (ref. JM-001)"), formulario "Agendar visita", botón compartir (Web Share API), propiedades similares y JSON-LD.
- **Catálogo:** filtros por precio (rango), dormitorios, baños, m², tipo y distrito; orden (precio, recientes); **estado en la URL** (`?distrito=…&min=…`) para compartir búsquedas y que Google indexe filtros útiles; paginación o "cargar más"; vista lista real; favoritos en `localStorage`; chip "Alquiler" solo si hay datos (o quitarlo); estado vacío con acción ("limpiar filtros" o "avísame cuando haya").
- **Tarjetas como enlaces** (`<Link>` a la ficha) con `next/image`.

### Bloque D · Simuladores como imán de leads *(los simuladores son tu mejor activo)*

1. **Extraer la lógica a `src/lib/finance.ts`** (funciones puras) y cubrirla con pruebas (Vitest). Elimina los `useEffect+setState` (4 errores de lint) y el `$∞`.
2. **Hipotecario v2:** TEA → tasa mensual efectiva `(1+TEA)^(1/12)−1`; seguro de desgravamen e inmueble; **TCEA aproximada**; moneda **PEN/USD** con tipo de cambio editable; **cronograma de amortización** (tabla + descarga CSV/PDF); **capacidad de pago** (ingreso mensual y deudas → monto máximo y relación cuota/ingreso *real*); comparador de plazos (10/15/20/25/30); simulación de **prepagos**; aviso "referencial, no es oferta".
3. **Inversión v2:** inputs reales para alcabala, plusvalía, vacancia, comisión de gestión y financiamiento; **cap rate neto vs. rentabilidad bruta** rotulados con claridad; flujo a 5 y 10 años con renta creciente; escenarios (conservador / base / optimista).
4. **Validación:** `min`/`max`/`step`, `inputMode="decimal"`, mensajes ("Ingresa un plazo entre 1 y 30 años") en vez de resultados absurdos.
5. **Convertir el resultado en lead:** botón *"Recibir este cálculo y hablar con un asesor"* que envía a GHL **los números del usuario** (monto, plazo, cuota) junto con sus datos; así el asesor llama con contexto. El PDF se entrega **después** de captar el dato (server-side con `@react-pdf/renderer` o vista imprimible).
6. **Persistir** el último cálculo en `localStorage` y en la URL (`?monto=…&plazo=…`) para compartir.

### Bloque E · Asistente de valoración honesto
- Botón **"Atrás"**, validación por paso, progreso real ("Paso 2 de 3"), y borrador en `localStorage` para no perder lo escrito.
- Guardar **área y habitaciones** (hoy se descartan) y enviarlos con el lead.
- Reformular la promesa: *"Un asesor te contacta hoy con una estimación inicial"* hasta tener un proceso real. Si más adelante hay datos de mercado propios, mostrar **rango estimado por distrito** (con aviso de que es orientativo).

### Bloque F · Confianza, legal y cumplimiento *(a validar con asesoría legal)*
- Páginas **`/privacidad`**, **`/terminos`**, **Libro de Reclamaciones virtual**, razón social/RUC y dirección completa en el footer.
- **Consentimiento de datos** (casilla no premarcada) en cada formulario y **banner de cookies** (necesario en cuanto se active analítica/píxeles).
- Respaldar o quitar las cifras y los "garantizado".

### Bloque G · Medición y operación
- **Analítica:** Vercel Analytics o GA4 + Meta Pixel (con Conversions API si hay campañas). Eventos mínimos: `click_whatsapp` (con página y propiedad), `lead_enviado` (con origen), `simulador_usado`, `simulador_cta`, `vista_propiedad`, `filtro_usado`. Capturar **UTM** y guardarlas en el lead.
- **Notificación inmediata** al asesor (GHL → WhatsApp/correo) y **recordatorio** si el lead no se atiende.
- **Monitoreo de errores** (Sentry o logs de Vercel) y alerta si falla el envío a GHL.
- **Tablero** de conversión en GHL/Looker: visitas → leads → citas → cierres.

### Bloque H · Calidad de ingeniería
- **Pruebas:** Vitest para `finance.ts` (casos límite) y **Playwright** para los flujos críticos (enviar lead, filtrar catálogo, abrir ficha, menú móvil a 390 px).
- **CI** (GitHub Actions o Vercel): `tsc` + `eslint` + `next build` + tests antes de desplegar.
- Completar `.gitignore`, `README` real, `.env.example`, y actualizar a `next@16.3.8`.

### Bloque I · Contenido y crecimiento
- **Blog/Guías en MDX** (Next lo soporta nativamente): "cómo calcular tu cuota", "gastos al comprar (alcabala, notaría, registros)", "Crédito MiVivienda", "cómo vender rápido". Cada guía enlaza al simulador y a `/vender`.
- **Landings por distrito** con inventario filtrado + datos de la zona.
- **Testimonios y casos reales**, reseñas de Google, perfil de empresa en Google, FAQ.
- **Alertas de nuevas propiedades** ("avísame por WhatsApp/correo") como segundo imán de leads.

---

## 5. Hoja de ruta priorizada

| Prioridad | Funcionalidad | Esfuerzo | Depende de | Resultado medible |
|---|---|---|---|---|
| **P0 — esta semana** | Unificar contacto y arreglar enlaces muertos (`#vender`, `#contacto`, "(GHL)") | 2-3 h | confirmar número/dominio | Ningún botón sin destino |
| **P0** | **Embudo de leads (Bloque A)**: acción de servidor + GHL + WhatsApp plan B | 2-3 días | credenciales de GHL | Primer lead de prueba entra a GHL |
| **P0** | Páginas `/privacidad`, `/terminos` + consentimiento | 1 día | texto legal | Formularios con consentimiento |
| **P1 — semanas 2-3** | Fuente única de propiedades (Bloque B, opción A) + datos y fotos reales | 3-5 días | fotos y fichas del cliente | Home y catálogo sin contradicciones |
| **P1** | Fichas `/propiedades/[slug]` con WhatsApp prellenado | 3-4 días | Bloque B | URLs indexables por propiedad |
| **P1** | Simuladores v2 + `finance.ts` con pruebas + CTA que envía el cálculo | 4-6 días | Bloque A | Cuota correcta; leads con contexto |
| **P1** | Analítica + eventos + banner de cookies | 1-2 días | Bloque F | Conversión visible |
| **P2 — mes 2** | Catálogo con filtros avanzados, URL con estado, favoritos | 3-4 días | Bloque B | Búsquedas compartibles |
| **P2** | Calendario de GHL (`/agendar`) y asistente de valoración v2 | 2-3 días | Bloque A | Citas agendadas |
| **P2** | Pruebas E2E + CI | 2 días | — | Despliegues sin romper el embudo |
| **P3 — continuo** | Blog MDX, landings por distrito, testimonios, alertas de propiedades, Supabase como panel de inventario | recurrente | — | Tráfico orgánico y leads recurrentes |

### Definición de "sitio funcional mínimo" (MVP) — 5 condiciones
1. Un visitante deja sus datos desde **cualquier** CTA y el asesor lo recibe en GHL y por WhatsApp.
2. Cada propiedad del catálogo tiene **ficha propia** con datos coherentes y botón de WhatsApp.
3. Los simuladores **no devuelven valores imposibles** y su resultado puede enviarse como lead.
4. Existen **privacidad, términos y consentimiento**.
5. Se **mide** (visitas → leads) para saber qué funciona.

---

## 6. No verificado
- La integración real con **GoHighLevel**: no tengo credenciales ni sé qué formularios, flujos y calendarios existen en la cuenta; el diseño del Bloque A asume webhook o API.
- Costos/límites de **Vercel, GHL y Supabase** según tu plan.
- Operación comercial: horarios de atención, quién recibe los leads y el tiempo de respuesta que se puede prometer.
- Requisitos legales y de registro del sector inmobiliario en Perú: validar con asesoría.
- Funcionamiento en teléfono físico y en navegadores distintos de Chromium.
