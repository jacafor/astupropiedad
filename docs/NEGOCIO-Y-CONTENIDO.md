# Negocio y contenido

Qué es AS Tupropiedad según el propio sitio, cómo debe sonar, qué se puede afirmar y qué datos faltan. **Nada de lo marcado "sin verificar" debe tratarse como cierto hasta que el cliente lo confirme.** Los temas legales son banderas para validar con asesoría, no dictamen.

## 1. Quién es y qué ofrece (según el sitio)

- **Marca:** AS Tupropiedad — "Boutique Inmobiliaria". Lima, Perú. Dirección: *Calle San Juan 211, La Molina* (confirmada 2026-10-29, D-28).
- **Servicios** (`/servicios`): representación de comprador (*personal shopper*), marketing para vendedores, estructuración financiera con alianzas bancarias, auditoría legal inmobiliaria.
- **Públicos:** compradores, vendedores, inversionistas y consultores/corredores que quieran unirse al equipo.
- **Zonas mencionadas:** Miraflores, San Isidro, Surco (texto); inventario de muestra en Jesús María, La Molina, Ate, Callao y "Lima".
- **Herramientas públicas:** simulador hipotecario, calculadora de rentabilidad, asistente de valoración.

## 2. Datos de contacto — **pendiente de confirmar**

| Dato | Valores encontrados | Decisión |
|---|---|---|
| WhatsApp / teléfono | `+51 940 428 352` (navbar) · `+51 900 000 000` (footer y botón flotante, **relleno**) · `940 215 027` (banner y el HTML anterior, ya archivado) · `994 741 703` y `977 588 905` (letreros dentro de flyers) | **Pendiente.** Elegir uno oficial |
| Correo | `contacto@astupropiedad.pe` | Confirmar que existe y se lee |
| Dominio | `astupropiedad.com` (flyers, banner) · `astupropiedad.pe` (correo y el HTML anterior, ya archivado) · `as-tupropiedad.pe` (enlace GHL) | **Durante la migración (D-34):** canónico `web.astupropiedad.com`; `*.vercel.app` redirige allí. Falta pasar `www` al sitio nuevo y redirigir los demás |
| Dirección | **Calle San Juan 211, La Molina** (jforero, 2026-10-29) | **Decidida (D-28).** En `contact.ts`; no es el domicilio fiscal |
| Horario de atención | **Lunes a sábado, 8:00 a 20:00 h** (jforero, 2026-10-29) | **Decidido (D-28).** En `contact.ts` y en el pie |
| Razón social / RUC | no existen | Necesario en el footer |
| Redes sociales | Facebook, Instagram, LinkedIn y YouTube (tomadas de la web actual, 2026-10-29) | **Decididas (D-28).** TikTok sin confirmar |
| Moneda de los precios | venta en USD, alquiler en PEN (jforero, 2026-10-29) | **Decidida (D-28).** `MONEDA_POR_OPERACION` en `properties.ts`, con prueba |
| Convenios bancarios | BBVA, BCP, Scotiabank e Interbank (jforero, 2026-10-29) | Publicados solo en texto en `/simulador-hipotecario`; **falta archivar el respaldo escrito** (P-10) |

Los datos de contacto confirmados van **solo** en `src/lib/contact.ts` y se importan desde el resto.

## 3. Voz y tono

- **Guía de voz (sesión 03, D-10 y D-16):**
  - **Tratamiento "tú"** en todo el sitio, sin "usted", "su" dirigido al visitante, "agende", "ingrese", "descubra", "venda"… Imperativo en "tú": *vende, descubre, calcula, escríbenos*.
  - **Tono:** español natural de Perú, cercano y claro; aspiracional sin adjetivos huecos ni afirmaciones absolutas (ver §4).
  - **Se conservan (marca o servicio):** AS Tupropiedad, *Boutique Inmobiliaria*, **Personal Shopper** (se explica la primera vez: "un asesor que busca por ti"), *Premium*, *marketing*, WhatsApp, IA.
  - **Términos técnicos se conservan y se explican la primera vez:** *cap rate* ("lo que rinde la propiedad al año respecto de su precio"), TEA ("tasa anual (TEA)"), *home staging* ("puesta en escena de interiores").
  - **Se tradujeron:** Elite Portfolio → Selección destacada; Flat → Departamento; Real Estate → sector inmobiliario; Credit Advisory → Asesoría de crédito; Wealth Management Tools → Herramientas de gestión patrimonial; Investment Intelligence → Inteligencia de inversión; Cash Flow → Flujo de caja; Core Financiero → Centro financiero; "Nosotros (Firm)" → Nosotros; Scroll → Desliza; "&" → "y"; tour → recorrido virtual.
  - Para textos nuevos: si hay equivalente natural en español, úsalo; el inglés solo si es marca o término que el cliente ya usa así.
- Titulares: promesa concreta antes que adjetivos ("Vende tu departamento en Lima con una valoración gratuita").
- CTA: verbo + resultado ("Pide tu valoración gratuita", "Calcula tu cuota", "Escríbenos por WhatsApp").

## 4. Política de afirmaciones

1. **Prohibido** afirmar "garantizado", "100 % seguro", "sin riesgo", "los mejores" o rendimientos futuros como hechos.
2. Toda cifra necesita **fuente y fecha** (documento interno, informe de mercado, base de datos propia) o se quita.
3. Las estimaciones (plusvalía, ocupación, ROI) se presentan como **ejemplo/escenario**, con el supuesto a la vista.
4. Las fichas de propiedad **deben coincidir** con la escritura/ficha comercial: precio, m², dormitorios, baños, distrito, estado.
5. No nombrar entidades bancarias ni "alianzas" sin autorización/respaldo escrito.
6. No usar fotos de terceros ni de stock como si fueran inventario propio.

### Inventario de afirmaciones actuales (todas *sin verificar*)

> **Sesión 02 (2026-10-05):** las cifras (+15 años, $40M, 120+, 4 alianzas, 45 días, +5k, ROI 8.5 %, plusvalía 12 %, ocupación 75 %), los nombres de bancos, "garantizado"/"100 % seguro" y el equipo ficticio **se quitaron del sitio**. Cuando el cliente las respalde (P-10), se reponen con fuente y fecha. Quedan por revisar las afirmaciones cualitativas marcadas en la columna *Acción* de la tabla de abajo (tour 360°, Home Staging, campañas con IA, "10 minutos").

| Afirmación | Dónde | Acción |
|---|---|---|
| "+15 años de experiencia" | Nosotros, Personal Shopper | Confirmar o quitar |
| "$40M volumen intermediado" · "120+ familias asesoradas" | Nosotros | Confirmar con cifras reales |
| "4 alianzas bancarias top" · "ejecutivos en BCP, BBVA, Scotiabank e Interbank" | Nosotros, Simulador hipotecario | Confirmar convenios por escrito |
| "45 días promedio de venta" · "+5k base de inversores" | Vender | Confirmar o quitar |
| "ROI promedio 8.5 %" · "plusvalía estimada 12 %" | Home (InvestmentSmarter) | Convertir en ejemplo con supuestos, o quitar |
| "plusvalía **garantizada**" · "capital **garantizado**" · "100 % segura" | InvestmentSmarter, PropertyZones, Servicios | **Eliminar** |
| "ocupación superior al 75 %" (Miraflores) | PropertyZones | Citar fuente o quitar |
| "Especialista — Arquitecto & Broker, +10 años" ×3 | Nosotros | Reemplazar por personas reales |
| "Análisis en 10 minutos por WhatsApp o correo" | Vender | Solo si hay proceso/horario que lo cumpla |
| "Tour virtual 360°, Home Staging, campañas con IA" | Servicios, Vender | Mostrar muestra real o quitar |

### Contradicciones entre el catálogo y los flyers (2026-10-05, pendiente del cliente — P-13)

Ningún flyer muestra precio: **todos los precios del sitio carecen de respaldo.** Estos son los datos que no coinciden (flyer = lo que dice la imagen de `public/imagenes/`):

| Dónde | Dice el sitio | Dice el flyer / la foto |
|---|---|---|
| Home, destacada 1 (`foto-edificio-miraflores-1.jpg`) | "Flat Moderno con Vista Panorámica", Jesús María, $155,000, 85 m², 2 dorm, 2 baños | La foto es un edificio en **Miraflores** (cartel: "Último depa de 3 dorm – 100 m²") |
| Home, destacada 2 (`foto-edificio-miraflores-2.jpg`) | "Residencia Familiar", La Molina, $275,000, 220 m², 4 dorm, 3 baños | Misma foto del edificio de **Miraflores**; no es una residencia |
| Catálogo 1 | Jesús María, $165,000, 3 dorm, 2 baños, **95 m²** (la home dice $155,000 · 85 m² · 2 dorm para "Jesús María") | Calle Talara, Jesús María: **77 m²**, 3 dorm, 2 baños, 1 cochera, ascensor; sin precio |
| Catálogo 2 | "Hermoso Depa en La Molina", $250,000, **4 dorm, 4 baños, 320 m²** | Santa Patricia, La Molina: **113 m²**, 3 dorm, 2 baños |
| Catálogo 3 | "**Casa** en Urb. Alpamayo", distrito **Ate**, $420,000, 3 dorm, 3 baños, **180 m²** | **Departamento**, Calle El Banco – Urb. Alpamayo: **94 m²**, 3 dorm, 2 baños; el flyer no indica distrito |
| Catálogo 4 | "Departamento Amplio Callao", $85,000, **0 dorm**, 2 baños, **85 m²** | Ciudad del Pescador, Bellavista – Callao: **94 m²**, **3 dorm**, **3 baños**, ascensor |
| Catálogo 5 (`flyer-miraflores-hipolito-unanue.jpg`) | "Proyecto Inversión", Lima, $110,000, 1 dorm, 1 baño, 45 m² | Es el flyer del departamento de **Av. Hipólito Unanue, Miraflores** (el edificio rotula 3 dorm – 100 m²) |
| Catálogo 6 (`foto-edificio-amarillo.jpg`) | "Casa Exclusiva", La Molina, $550,000, 5 dorm, 4 baños, 400 m² | La foto es un **edificio de departamentos**; sin ubicación ni datos |
| Sin uso en el catálogo | — | Pueblo Libre, Calle Coraceros: 86 m², 3 dorm, 2 baños (`flyer-pueblo-libre-coraceros.jpg`); `foto-edificio-rojo-blanco.jpg` y `flyer-cordillera-condor-ate.webp` no se revisaron |
| `/propiedades` filtro "Alquiler" | Existe la pestaña | No hay ninguna propiedad en alquiler |

### Cómo agregar una propiedad (desde el administrador, D-30)

Las propiedades viven en Supabase y se editan en **`/admin`** (no se enlaza desde el sitio; escribe la dirección). Catálogo, home, ficha, WhatsApp y sitemap se actualizan solos al guardar.

1. **Ingresa** en `/admin/ingresar` con tu correo y contraseña.
2. **Nueva propiedad** → completa los datos reales: código de referencia (único, ej. `JM-001`), título (≈ 40 caracteres, sin precio ni teléfono), operación (la moneda la fija: venta en USD, alquiler en PEN, D-28), tipo, distrito (la dirección exacta no se publica), precio, áreas, dormitorios, baños, cocheras, descripción y, si quieres, características (una por línea). La dirección web se crea sola con el título y el código. Se guarda como **borrador**: nadie la ve. Nada de dato inventado: si no lo tienes, no la publiques.
3. **Sube las fotos** (JPG, PNG o WebP; hasta 20 a la vez, elegidas o arrastradas a la zona de carga; las de más de 4 MB se reducen solas), cada una con una descripción de lo que se ve. Deben ser limpias: sin teléfonos, precios, logos ni marcas de agua. La primera es la portada; cambia el orden **arrastrando el asa ⠿** (con el ratón o el dedo) o con las flechas y "Hacer portada". Se convierten a WebP y se les quita la ubicación GPS.
4. **Vista previa** → revisa la ficha tal como se verá. Luego **Publicar** (pide al menos una foto). Desde ese momento la dirección web ya no cambia.
5. **Mantenla al día:** el estado comercial (disponible, reservado, vendido) se cambia con un clic; reservada o vendida sale del catálogo pero su ficha sigue. **Archivar** la quita del sitio (su enlace da 404) y se puede restaurar. Las propiedades no se borran.

Destacada = aparece en la home (las 2 más recientes). Sin las variables de Supabase el catálogo muestra su estado vacío honesto (D-20) y, solo en desarrollo, la ficha `EJEMPLO`.

#### Dar acceso a alguien al administrador (desde `/admin/usuarios`, D-35)

Lo hace un **administrador** (hoy jforero); no hace falta tocar Supabase ni SQL.

1. Entra en **`/admin` → Usuarios**.
2. En **Dar acceso a una persona**, escribe su correo y elige el rol: **Editor** (carga, edita, publica y archiva propiedades; no ve usuarios) o **Administrador** (además da y quita accesos). Pulsa **Crear acceso**.
3. Aparece una **contraseña temporal** una sola vez: cópiala y entrégasela por un canal privado (en persona o por chat directo, nunca en un grupo ni en el chat de Claude), junto con la dirección `/admin/ingresar`. Al entrar, el sistema le pide elegir una contraseña propia.
4. En la lista puedes, para cada persona: cambiar su rol, **suspender** (no puede entrar hasta que la reactives), generar una **contraseña temporal nueva** (si olvidó la suya) o **quitar acceso** (se borra su cuenta; las propiedades que cargó se quedan). Nadie se cambia a sí mismo desde la lista y siempre queda al menos un administrador activo. Cada cambio queda en el **registro de cambios**.
5. Cada persona cambia su contraseña cuando quiera en **Mi cuenta**.

Requisito técnico: la variable `SUPABASE_SECRET_KEY` en Vercel (ver [INTEGRACIONES.md](INTEGRACIONES.md) §1). Sin ella la lista se ve, pero los botones quedan desactivados. El registro público de Supabase sigue apagado: solo entra quien tenga acceso dado desde aquí.

## 5. Cumplimiento (Perú) — checklist a validar con asesoría legal

- [ ] **Política de privacidad** y **términos** publicados (`/privacidad`, `/terminos`) *(borrador `noindex` desde 2026-10-16; falta revisión legal y quitar `LEGALES_EN_BORRADOR`)*.
- [ ] **Consentimiento expreso** de tratamiento de datos personales en cada formulario (casilla sin premarcar) — Ley 29733 y su reglamento.
- [ ] **Libro de Reclamaciones virtual** accesible desde el sitio.
- [ ] **Razón social, RUC y domicilio** visibles.
- [ ] **Registro del agente inmobiliario**, si corresponde por normativa.
- [ ] **Publicidad veraz** (INDECOPI): sin afirmaciones absolutas ni cifras sin respaldo.
- [ ] Simulador hipotecario: aviso de **referencial / no vinculante** y de que depende de la evaluación del banco *(hecho 2026-10-07, sesión 06; fórmulas en [ARQUITECTURA.md](ARQUITECTURA.md))*. **Pendiente:** mostrar **TCEA** (requiere seguros y comisiones del banco).
- [ ] **Cookies/analítica:** banner de consentimiento antes de activar píxeles o analítica.
- [ ] **Fotos:** sin matrículas ni personas identificables; derechos de uso de cada imagen.

## 6. Glosario (para textos y simuladores)

| Término | Significado |
|---|---|
| **Alcabala** | Impuesto a la transferencia de inmuebles; lo paga el comprador (hay un tramo inafecto: validar valores vigentes con un contador antes de usar un % fijo) |
| **Arbitrios** | Tasas municipales (limpieza, serenazgo, parques) |
| **TEA** | Tasa Efectiva Anual (no incluye comisiones ni seguros) |
| **TEM** | Tasa Efectiva Mensual: `(1 + TEA)^(1/12) − 1` |
| **TCEA** | Tasa de Costo Efectivo Anual (incluye comisiones y seguros) — la comparable entre bancos |
| **Seguro de desgravamen** | Cubre la deuda si fallece el titular |
| **Cap rate neto** | (renta anual − gastos operativos) / precio. **No es** la rentabilidad bruta (renta anual / precio) |
| **Plusvalía** | Aumento del valor del inmueble en el tiempo (estimación, no garantía) |
| **Cuota inicial** | Porcentaje del precio que paga el comprador al contado |
| **Relación cuota/ingreso** | Cuota mensual ÷ ingreso mensual del hogar (los bancos fijan topes) |

## 7. Qué necesitamos del cliente (bloqueos de contenido)

1. ~~Teléfono/WhatsApp, correo, dominio, dirección, horario y redes~~ (recibidos); **faltan** RUC y razón social, y confirmar TikTok.
2. Inventario real: por propiedad → precio, moneda, m², dormitorios, baños, cocheras, distrito, dirección aproximada, estado y **fotos limpias**.
3. Fotos, nombres y cargos del equipo real (y registro profesional si aplica).
4. Cifras verificables o autorización para quitarlas.
5. Respaldo escrito de los convenios bancarios (los nombres ya se publican, D-28).
6. Textos legales (privacidad, términos) revisados.
7. GoHighLevel por API (D-27): token e IDs en Vercel, pipeline, campos, calendario de llamadas y flujo de atención.
