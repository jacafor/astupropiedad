/**
 * Estado de las páginas legales (/privacidad y /terminos).
 *
 * ÚNICO lugar donde se decide si siguen en borrador. Mientras sea `true`:
 *  - sus páginas llevan `robots: noindex` y el aviso "BORRADOR" (ver `rutaMetadata` y `LegalPage`);
 *  - NO aparecen en `sitemap.xml` (ver `src/app/sitemap.ts`).
 * Cuando la asesoría legal las revise y se rellenen los [PENDIENTE], cámbialo a `false`.
 */
export const LEGALES_EN_BORRADOR = true;

/** Fecha del borrador actual (se actualiza al editar los textos). */
export const LEGALES_FECHA = "23 de octubre de 2026";
