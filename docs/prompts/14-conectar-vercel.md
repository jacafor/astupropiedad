# 14 · Conectar el repositorio de GitHub con Vercel

**Cuándo:** cuando quieras tener *previews* automáticos por rama. Se puede hacer ya (la sesión 00 dejó el repo en `https://github.com/jacafor/astupropiedad`), pero **ojo:** con la conexión hecha, cada `push` a `main` será un despliegue a producción. Mientras las sesiones 01-10 no estén hechas, el sitio sigue siendo una fachada con formularios que no funcionan; por eso el prompt trabaja con ramas y no promueve ni asigna dominio.
**Tú haces (en el navegador, la sesión no puede):** iniciar sesión en Vercel y, si aparece, instalar/autorizar la app de GitHub de Vercel para el repo `jacafor/astupropiedad`. Las claves y variables secretas las pones tú en Vercel → Settings → Environment Variables, **no en el chat**.
**Depende de:** 00. Mejor después de 10 (Next actualizado) y 12 (`docs/DESPLIEGUE.md`), pero no es obligatorio.
**Autorizo en este prompt:** conectar el repo de GitHub al proyecto Vercel `web-as-tupropiedad` y crear un despliegue de *preview* desde una rama de prueba. **No autorizo:** desplegar a producción, cambiar o asignar dominios, borrar el proyecto, ni cambiar variables de entorno.

## Procedimiento (de principio a fin)

1. **Antes (tú, 5 min):** en tu terminal, `vercel login` y confirma con `vercel whoami`. Entra a vercel.com → proyecto `web-as-tupropiedad` → *Settings → Git*: mira si ya hay un repositorio conectado. Comprueba en GitHub que `jacafor/astupropiedad` es **privado**.
2. **Abre una sesión nueva** en esta carpeta y pega el bloque de texto de abajo.
3. **La sesión** diagnostica, conecta con `vercel git connect`, revisa la configuración, lista los nombres de variables y prueba con una rama. Si Vercel pide autorizar la app de GitHub, la sesión se detiene: hazlo en el navegador y avísale.
4. **Variables de entorno (tú):** en Vercel → *Settings → Environment Variables*, crea las que la sesión diga que faltan, en los entornos que indique. Nunca las pegues en el chat.
5. **Revisa el preview** que te entregue la sesión (7 rutas, móvil y escritorio) y responde las preguntas de P-12: protección de `main`, fecha del dominio, con o sin `www`.
6. **Después:** a partir de aquí cada sesión trabaja en una rama; un `push` a `main` despliega a producción, así que el merge se hace solo cuando tú lo confirmes.

````text
Arranque obligatorio: antes de actuar, lee AGENTS.md (reglas 1-9, "Protocolo de sesión" y "Diseño — resumen"), docs/DECISIONES.md y la parte que toque de docs/ROADMAP.md; si cambias la interfaz, lee también docs/DISENO.md y usa sus tokens, patrones y reglas de accesibilidad. Si este prompt contradice esas reglas, avísame antes de actuar. Al terminar, cierra según el "Protocolo de sesión" de AGENTS.md (verificación real, ROADMAP, DECISIONES y docs afectados).

Objetivo: que los cambios del repositorio de GitHub se desplieguen en Vercel de forma controlada: previews por rama y producción solo desde main. Responde en español.

Contexto: repo remoto https://github.com/jacafor/astupropiedad (rama main). El proyecto Vercel `web-as-tupropiedad` ya está enlazado en local (.vercel/project.json, ignorado por git) y vercel.json fija framework nextjs. Vercel CLI está instalado. Lee docs/INTEGRACIONES.md §5 y la regla "Pregunta primero" de AGENTS.md: no se despliega a producción ni se toca el dominio sin mi confirmación.

Autorizo: conectar el repo al proyecto y crear un preview desde una rama de prueba. NO autorizo: producción, dominios, variables de entorno, borrar nada.

Pasos:
1. Diagnóstico sin cambiar nada: `git remote -v`, `git status`, `vercel --version`, `vercel whoami`. Si no hay sesión, dime que ejecute `vercel login` en mi terminal y espera; nunca pidas ni guardes tokens. Con `vercel project inspect` (o `vercel link` solo si falta el enlace) confirma que el proyecto es web-as-tupropiedad y muéstrame qué Git tiene conectado hoy, si alguno.
2. Conecta el repositorio: `vercel git connect https://github.com/jacafor/astupropiedad`. Si falla porque falta la app de GitHub de Vercel o permisos, no insistas: dame los pasos exactos en el panel (Vercel → proyecto → Settings → Git → Connect Git Repository) y espera a que yo los haga.
3. Revisa la configuración del proyecto y dime los valores reales, no los supuestos: Production Branch (debe ser main), Framework Preset, Install/Build Command (npm install / npm run build), versión de Node (24 o ≥ 20.9), y que "Preview deployments" esté activo. Cámbialo solo si falta algo y dime qué cambiaste; no toques dominios.
4. Variables de entorno: lista solo los NOMBRES con `vercel env ls` (nunca los valores) y compáralos con .env.example y docs/INTEGRACIONES.md §1. Dime cuáles faltan por entorno (Production / Preview / Development). Las creo yo en el panel; tú no las escribas ni las pidas por chat.
5. Prueba de punta a punta con una rama, sin tocar main: crea la rama `prueba/vercel-preview` con un cambio mínimo y seguro (por ejemplo, una línea en docs/DESPLIEGUE.md si existe, o en docs/INTEGRACIONES.md), haz push de esa rama (pídeme confirmación justo antes del push) y comprueba con `vercel ls` o la URL del preview que el build termina en "Ready". Abre la URL del preview, recorre las 7 rutas a 390 px y 1280 px y confirma que el navbar, el botón de WhatsApp y los simuladores cargan. Al terminar dime cómo borrar la rama de prueba; no la borres sin que yo lo confirme.
6. Documenta en docs/INTEGRACIONES.md §5 y docs/DESPLIEGUE.md (créalo si no existe, resumido): flujo acordado (ramas por sesión → pull request → preview → merge a main = producción), cómo volver atrás (Vercel → Deployments → Promote/Rollback del despliegue anterior, o `git revert`), qué variables hay en cada entorno (solo nombres) y la advertencia de que main despliega a producción. Actualiza la fila P-12 de docs/DECISIONES.md con lo que quedó hecho y lo que sigue pendiente de mi decisión: ¿se protege main (pull request obligatorio)?, ¿quién asigna el dominio astupropiedad.com a producción y cuándo?, ¿www o sin www? No lo decidas tú.
7. Actualiza AGENTS.md (regla de despliegue: ya existe conexión Git → un push a main es un despliegue; trabajar en ramas) y marca el ROADMAP.

Pruebas: build local `npx tsc --noEmit && npm run lint && npm run build` antes de empujar la rama; después, el preview en Vercel en estado Ready y las 7 rutas a 390 y 1280 px. Apaga cualquier servidor local y borra temporales propios.

Hecho cuando: el repo aparece conectado en Vercel; un push a una rama genera un preview en Ready; la documentación explica el flujo y el rollback; no se desplegó nada a producción ni se tocó el dominio. Dime qué verificaste de verdad (URL del preview, estado del build) y qué no (por ejemplo, variables o dominio que quedaron a mi cargo).
````
