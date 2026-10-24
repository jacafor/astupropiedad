import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Pendiente } from "@/components/LegalPage";
import { BRAND_NAME, EMAIL, mailLink } from "@/lib/contact";
import { GA_ID, HAY_ANALITICA, META_PIXEL_ID } from "@/lib/consentimiento";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/privacidad");

const herramientas = [GA_ID && "Google Analytics", META_PIXEL_ID && "el píxel de Meta"].filter(
  (h): h is string => Boolean(h)
);

const enlace ="underline underline-offset-4 font-bold text-primary hover:text-dark";

const Page = () => (
  <LegalPage
    titulo="Política de privacidad"
    introduccion={
      <p>
        Esta política explica cómo {BRAND_NAME} trata los datos personales que nos dejas en este sitio web. Si tienes
        dudas, escríbenos a{" "}
        <a href={mailLink} className={enlace}>
          {EMAIL}
        </a>
        .
      </p>
    }
    secciones={[
      {
        titulo: "Quién es el responsable",
        contenido: (
          <>
            <p>
              El responsable del tratamiento de tus datos es {BRAND_NAME}.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Razón social: <Pendiente>razón social</Pendiente>
              </li>
              <li>
                RUC: <Pendiente>RUC</Pendiente>
              </li>
              <li>
                Domicilio: <Pendiente>dirección legal completa</Pendiente>
              </li>
              <li>
                Correo de contacto: {EMAIL}
              </li>
            </ul>
          </>
        ),
      },
      {
        titulo: "Qué datos recogemos",
        contenido: (
          <>
            <p>Solo los que tú nos das al usar los formularios del sitio:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre, celular y, si lo escribes, correo electrónico.</li>
              <li>
                Lo que nos cuentas en tu consulta: por ejemplo, los datos del inmueble que quieres vender o los valores
                que ingresas en los simuladores.
              </li>
              <li>
                La página desde la que nos escribes y, si llegaste desde un anuncio, los parámetros de campaña de la
                dirección web.
              </li>
              <li>La fecha y hora en que aceptaste esta política.</li>
            </ul>
            {HAY_ANALITICA && (
              <p>
                Además, solo si aceptas las cookies, datos de navegación sin tu nombre, celular ni correo (ver
                «Cookies y analítica»).
              </p>
            )}
            <p>
              Si prefieres escribirnos por WhatsApp, los mensajes se rigen además por las condiciones de ese servicio.
            </p>
          </>
        ),
      },
      {
        titulo: "Para qué los usamos",
        contenido: (
          <>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contactarte para responder tu consulta sobre comprar, vender, invertir o tu crédito hipotecario.</li>
              <li>Atender solicitudes de reclutamiento, si nos escribes por ese motivo.</li>
            </ul>
            <p>
              <Pendiente>confirmar con el cliente si los datos también se usarán para enviar publicidad o novedades; si es así, debe pedirse un consentimiento aparte</Pendiente>
            </p>
          </>
        ),
      },
      {
        titulo: "Con quién los compartimos",
        contenido: (
          <>
            <p>
              Tus datos se guardan en la herramienta de gestión de clientes (CRM) que usa {BRAND_NAME} para dar
              seguimiento a las consultas:{" "}
              <Pendiente>confirmar la herramienta (hoy está previsto GoHighLevel) y su ubicación</Pendiente>.
            </p>
            <p>
              También intervienen los proveedores que permiten que el sitio funcione, como el servicio de alojamiento
              web. <Pendiente>lista final de proveedores y si hay transferencia de datos fuera del Perú</Pendiente>
            </p>
            <p>No vendemos tus datos.</p>
          </>
        ),
      },
      {
        titulo: "Cuánto tiempo los conservamos",
        contenido: (
          <p>
            <Pendiente>plazo de conservación de los datos</Pendiente>
          </p>
        ),
      },
      {
        titulo: "Tus derechos (ARCO)",
        contenido: (
          <>
            <p>
              Puedes pedir en cualquier momento el <strong>acceso</strong>, la <strong>rectificación</strong>, la{" "}
              <strong>cancelación</strong> y la <strong>oposición</strong> al uso de tus datos.
            </p>
            <p>
              Para ejercerlos, escríbenos a{" "}
              <a href={mailLink} className={enlace}>
                {EMAIL}
              </a>{" "}
              indicando tu nombre, el celular con el que nos escribiste y qué derecho quieres ejercer.{" "}
              <Pendiente>plazo de respuesta, si se pide copia del documento de identidad y otros derechos que la asesoría legal considere</Pendiente>
            </p>
          </>
        ),
      },
      {
        titulo: "Cookies y analítica",
        id: "cookies",
        contenido: (
          <>
            <p>
              <strong>Siempre:</strong> guardamos en tu navegador (almacenamiento local, no es una cookie) si aceptaste o
              rechazaste las cookies, para no volver a preguntarte. Ese dato no sale de tu equipo.
            </p>
            {HAY_ANALITICA ? (
              <>
                <p>
                  <strong>Solo si aceptas:</strong> usamos {herramientas.join(" y ")} para saber cuántas personas visitan
                  el sitio, qué páginas ven y qué acciones hacen (abrir WhatsApp, usar un simulador, enviar un formulario
                  o ver una propiedad). A estas herramientas <strong>no</strong> les enviamos tu nombre, tu celular ni tu
                  correo.
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  {GA_ID && (
                    <li>
                      Google Analytics (Google): cookies <code>_ga</code> y <code>_ga_…</code>, para medir visitas.
                    </li>
                  )}
                  {META_PIXEL_ID && (
                    <li>
                      Píxel de Meta (Facebook e Instagram): cookie <code>_fbp</code>, para medir el resultado de nuestros
                      anuncios.
                    </li>
                  )}
                </ul>
                <p>
                  Si rechazas, no se cargan y el sitio funciona igual. Puedes cambiar tu decisión cuando quieras en
                  «Preferencias de cookies», al final de cada página, o borrar las cookies desde tu navegador.
                </p>
                <p>
                  <Pendiente>duración de cada cookie según la configuración final, transferencia de datos fuera del Perú (Google y Meta) y revisión legal de este texto y del aviso de cookies</Pendiente>
                </p>
              </>
            ) : (
              <p>
                Hoy el sitio no tiene activada ninguna herramienta de analítica ni de publicidad, así que no usa cookies
                de ese tipo. Si se activan, te pediremos permiso antes y actualizaremos esta sección.
              </p>
            )}
          </>
        ),
      },
      {
        titulo: "Cambios en esta política",
        contenido: (
          <p>
            Si cambiamos esta política, publicaremos la nueva versión en esta misma página. Consulta también los{" "}
            <Link href="/terminos" className={enlace}>
              términos y condiciones
            </Link>
            .
          </p>
        ),
      },
    ]}
  />
);

export default Page;
