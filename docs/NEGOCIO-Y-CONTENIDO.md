# Negocio y contenido

Qué es AS Tupropiedad según el propio sitio, cómo debe sonar, qué se puede afirmar y qué datos faltan. **Nada de lo marcado "sin verificar" debe tratarse como cierto hasta que el cliente lo confirme.** Los temas legales son banderas para validar con asesoría, no dictamen.

## 1. Quién es y qué ofrece (según el sitio)

- **Marca:** AS Tupropiedad — "Boutique Inmobiliaria". Lima, Perú. Dirección declarada: *San Isidro, Lima* (sin calle).
- **Servicios** (`/servicios`): representación de comprador (*personal shopper*), marketing para vendedores, estructuración financiera con alianzas bancarias, auditoría legal inmobiliaria.
- **Públicos:** compradores, vendedores, inversionistas y consultores/corredores que quieran unirse al equipo.
- **Zonas mencionadas:** Miraflores, San Isidro, Surco (texto); inventario de muestra en Jesús María, La Molina, Ate, Callao y "Lima".
- **Herramientas públicas:** simulador hipotecario, calculadora de rentabilidad, asistente de valoración.

## 2. Datos de contacto — **pendiente de confirmar**

| Dato | Valores encontrados | Decisión |
|---|---|---|
| WhatsApp / teléfono | `+51 940 428 352` (navbar) · `+51 900 000 000` (footer y botón flotante, **relleno**) · `940 215 027` (banner y `legacy/`) · `994 741 703` y `977 588 905` (letreros dentro de flyers) | **Pendiente.** Elegir uno oficial |
| Correo | `contacto@astupropiedad.pe` | Confirmar que existe y se lee |
| Dominio | `astupropiedad.com` (flyers, banner) · `astupropiedad.pe` (correo, `legacy/`) · `as-tupropiedad.pe` (enlace GHL) | **Pendiente.** Elegir dominio canónico y redirigir los demás |
| Dirección | "San Isidro, Lima - Perú" | Falta calle y número |
| Horario de atención | no existe | Necesario si se promete respuesta rápida |
| Razón social / RUC | no existen | Necesario en el footer |
| Redes sociales | enlaces `#` | Faltan las URL reales |

Los datos de contacto confirmados van **solo** en `src/lib/contact.ts` y se importan desde el resto.

## 3. Voz y tono

- **Hoy:** formal, aspiracional, con muchas palabras en inglés (*Elite Portfolio, Credit Advisory, Wealth Management Tools, Off-Market, Home Staging, Flat, Cap Rate, hub*) y mezcla de "usted" ("Su patrimonio…") con "tú" ("Sincera tu cuota…", "Ingresa tus datos…"). Ver pendiente P-2 en [DECISIONES.md](DECISIONES.md).
- **Recomendado (a confirmar con el cliente):** español de Perú, claro y cercano; **un solo tratamiento** en todo el sitio; términos técnicos con explicación breve la primera vez (TEA, TCEA, cap rate, alcabala, arbitrios); reservar el inglés para el nombre de la marca/servicio si aporta.
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

## 5. Cumplimiento (Perú) — checklist a validar con asesoría legal

- [ ] **Política de privacidad** y **términos** publicados (`/privacidad`, `/terminos`).
- [ ] **Consentimiento expreso** de tratamiento de datos personales en cada formulario (casilla sin premarcar) — Ley 29733 y su reglamento.
- [ ] **Libro de Reclamaciones virtual** accesible desde el sitio.
- [ ] **Razón social, RUC y domicilio** visibles.
- [ ] **Registro del agente inmobiliario**, si corresponde por normativa.
- [ ] **Publicidad veraz** (INDECOPI): sin afirmaciones absolutas ni cifras sin respaldo.
- [ ] Simulador hipotecario: aviso de **referencial / no vinculante**; mostrar **TCEA**; indicar que depende de la evaluación del banco.
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

1. Teléfono/WhatsApp, correo, dominio, dirección, horario, RUC y redes oficiales.
2. Inventario real: por propiedad → precio, moneda, m², dormitorios, baños, cocheras, distrito, dirección aproximada, estado y **fotos limpias**.
3. Fotos, nombres y cargos del equipo real (y registro profesional si aplica).
4. Cifras verificables o autorización para quitarlas.
5. Convenios bancarios que se pueden nombrar.
6. Textos legales (privacidad, términos) revisados.
7. Acceso a GoHighLevel: formularios, calendario, webhook/API y flujo de atención.
