# 00 · Git y limpieza (P-7, P-8)

**Hazla primero.** Sin historial, cualquier error de las sesiones siguientes no se puede deshacer.
**Tú das:** nada obligatorio. Si quieres subir el código a GitHub, crea antes un repositorio **privado** vacío en github.com y pega la URL.
**Antes de pegar:** este prompt autoriza borrar `Imagenes/` y archivar `legacy/`. Si no quieres alguna de las dos cosas, borra esa línea.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: dejar el proyecto bajo control de versiones y quitar los duplicados. Responde en español.

Contexto: el proyecto no es un repositorio git. docs/DECISIONES.md P-7 y P-8 tienen mi recomendación. Según docs/DECISIONES.md P-8, los 14 archivos de Imagenes/ eran idénticos byte a byte a public/imagenes/ y nada en src/ usaba legacy/ ni Imagenes/. Compruébalo tú de nuevo antes de borrar.

Autorizo expresamente:
- git init (rama main) y los commits descritos abajo.
- Borrar la carpeta Imagenes/ DESPUÉS de repetir la comparación byte a byte y confirmar que no hay diferencias.
- Comprimir legacy/ en ../Web-AS-Tupropiedad-respaldo/legacy.zip (fuera del proyecto) y luego quitar legacy/ del proyecto.
NO autorizo: git push ni crear el remoto sin que yo te dé la URL; cambiar la configuración global de git; borrar nada de public/imagenes/.

Pasos:
1. Revisa `git config user.name` y `user.email`. Si faltan, dímelo y espera; no los inventes ni uses --global.
2. Verifica .gitignore: que excluya node_modules, .next, .env* (salvo .env.example) y *.tsbuildinfo. Corre `git init`, luego `git status` y confirma que no entra ningún secreto, .next ni node_modules.
3. Primer commit con TODO el estado actual (mensaje: "Estado inicial del proyecto") para que Imagenes/ y legacy/ queden en el historial.
4. Haz la comparación byte a byte, borra Imagenes/, crea el zip de legacy/ (y verifica que el zip se abre y contiene los 2 HTML), quita legacy/. Segundo commit: "Limpieza: quitar Imagenes/ duplicada y archivar legacy/".
5. Actualiza AGENTS.md (sección Estructura y la fila "Entorno": ya es repo git; quita las menciones a legacy/ e Imagenes/ como carpetas presentes), README.md, docs/ARQUITECTURA.md si las menciona, y docs/DECISIONES.md: cierra P-7 y P-8 con una entrada nueva D-12 (estado Aceptada, fecha de hoy, responsable jforero). Tercer commit con esos cambios de documentación.
6. Si te di una URL de remoto: `git remote add origin <url>` y `git push -u origin main`. Si no, dime los dos comandos exactos para hacerlo yo.

Hecho cuando: `git log --oneline` muestra 3 commits; `git status` limpio; Imagenes/ y legacy/ ya no están; `npm run build` sigue OK; la documentación no menciona carpetas que ya no existen.
Al terminar: dime qué verificaste de verdad y qué no.
````
