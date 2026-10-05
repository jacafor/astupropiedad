# 06 · Simuladores correctos (P1 · C7)

**Tú das:** nada obligatorio. P-4 (moneda) sigue pendiente: por defecto la sesión ofrece USD y PEN con tipo de cambio editable por el usuario.
**Autorizo en este prompt:** instalar `vitest`. Quita la línea si no quieres.
**Importante:** los porcentajes de alcabala y plusvalía **no se fijan** en esta sesión: serán campos editables y quedan marcados "a validar con notario o contador".

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: sacar la matemática financiera de los componentes, corregir los errores de C7 y probarla. Responde en español, tono "tú". Lee docs/auditorias/AUDITORIA-WEB.md (C7) y docs/auditorias/AUDITORIA-FUNCIONALIDADES.md (Bloque D).

Autorizo: instalar vitest como dependencia de desarrollo. No autorizo otras dependencias.

Errores a corregir (todos verificados en la auditoría):
- Con plazo = 0 el simulador hipotecario muestra "$∞"; hay valores negativos posibles; "3.5x" está escrito a mano en simulador-hipotecario/page.tsx (~línea 110); la tasa mensual se calcula como TEA/12 en lugar de (1+TEA)^(1/12) − 1; alcabala y plusvalía están fijas.

Tareas:
1. src/lib/finance.ts con funciones puras y tipadas: tasaMensualDesdeTEA, cuotaFrancesa (caso TEA=0 → capital/n), cronogramaFrances, ingresoMinimoRequerido, rentabilidad bruta/neta y cap rate para el simulador de inversión. Cada una valida entradas y devuelve un resultado o un error tipado; nunca NaN, Infinity ni negativos.
2. src/lib/finance.test.ts con Vitest: valores de referencia calculados a mano o con una hoja de cálculo (documenta el caso en un comentario), y casos límite: plazo 0, monto 0, TEA 0, números negativos, valores enormes, decimales.
3. Los componentes dejan de calcular: llaman a lib/finance y muestran mensajes de validación en español junto al campo en vez de resultados imposibles. Sustituye el "3.5x" por un valor calculado o un texto honesto.
4. Alcabala/plusvalía/gastos notariales: campos editables con valor inicial vacío o neutro y una nota "Valor referencial: confírmalo con tu notario o contador". No escribas tasas legales de memoria.
5. Moneda: selector USD/PEN con tipo de cambio que el usuario escribe; no incluyas un tipo de cambio fijo inventado.
6. Aviso de simulación visible (resultado referencial, sujeto a evaluación de la entidad financiera), sin afirmaciones absolutas.

Pruebas: `npx vitest run` verde; en el navegador (390 y 1280 px) prueba los dos simuladores con plazo 0, monto vacío, TEA 0, valores gigantes y negativos: nunca debe aparecer $∞, NaN ni un número negativo. npx tsc --noEmit && npm run lint && npm run build.

Documenta las fórmulas y supuestos en docs/NEGOCIO-Y-CONTENIDO.md o docs/ARQUITECTURA.md. Marca el ROADMAP. Dime qué verificaste de verdad y qué no (p. ej. no contrastaste con el simulador de un banco real, y recomienda hacerlo).
````
