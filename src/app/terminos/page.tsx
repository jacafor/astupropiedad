import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Pendiente } from "@/components/LegalPage";
import { BRAND_NAME, EMAIL, mailLink } from "@/lib/contact";
import { rutaMetadata } from "@/lib/seo";

export const metadata: Metadata = rutaMetadata("/terminos");

const enlace = "underline underline-offset-4 font-bold text-primary hover:text-dark";

const Page = () => (
  <LegalPage
    titulo="Términos y condiciones"
    introduccion={
      <p>
        Al usar este sitio web aceptas estas condiciones. Si no estás de acuerdo con ellas, te pedimos que no lo uses.
      </p>
    }
    secciones={[
      {
        titulo: "Quiénes somos",
        contenido: (
          <p>
            Este sitio pertenece a {BRAND_NAME}. Razón social: <Pendiente>razón social</Pendiente> · RUC:{" "}
            <Pendiente>RUC</Pendiente> · Domicilio: <Pendiente>dirección legal completa</Pendiente>.
          </p>
        ),
      },
      {
        titulo: "Qué ofrece el sitio",
        contenido: (
          <p>
            Información sobre nuestros servicios inmobiliarios, un catálogo de propiedades, simuladores y formularios
            para que nos contactes. El sitio no es una oferta vinculante ni sustituye la asesoría de un profesional.
          </p>
        ),
      },
      {
        titulo: "Información de propiedades",
        contenido: (
          <p>
            Hacemos lo posible por mantener al día los datos de cada propiedad, pero precios, áreas y disponibilidad
            pueden cambiar sin aviso. Confirma siempre los datos con un asesor antes de tomar una decisión.{" "}
            <Pendiente>alcance de la responsabilidad según la asesoría legal</Pendiente>
          </p>
        ),
      },
      {
        titulo: "Simuladores",
        contenido: (
          <p>
            Los simuladores hipotecario y de inversión dan resultados <strong>referenciales</strong>, calculados con los
            valores que tú escribes. No constituyen una oferta de crédito ni una promesa de rentabilidad. Las
            condiciones reales dependen de la evaluación de la entidad financiera y de la situación de cada persona.
            Confirma impuestos y gastos con tu notario o contador.
          </p>
        ),
      },
      {
        titulo: "Uso adecuado",
        contenido: (
          <p>
            Te pedimos no usar el sitio para fines ilícitos, no intentar acceder a sistemas que no son públicos y
            entregar datos verdaderos en los formularios.
          </p>
        ),
      },
      {
        titulo: "Propiedad intelectual",
        contenido: (
          <p>
            Los textos, imágenes, logotipos y diseño del sitio pertenecen a {BRAND_NAME} o a sus titulares y no se pueden
            reproducir sin autorización. <Pendiente>titularidad y derechos de uso de las imágenes</Pendiente>
          </p>
        ),
      },
      {
        titulo: "Tus datos personales",
        contenido: (
          <p>
            El tratamiento de tus datos se explica en la{" "}
            <Link href="/privacidad" className={enlace}>
              política de privacidad
            </Link>
            .
          </p>
        ),
      },
      {
        titulo: "Libro de Reclamaciones",
        contenido: (
          <p>
            <Pendiente>texto y enlace al Libro de Reclamaciones, si corresponde (consultar a la asesoría legal)</Pendiente>
          </p>
        ),
      },
      {
        titulo: "Ley aplicable y contacto",
        contenido: (
          <p>
            <Pendiente>ley aplicable y jurisdicción</Pendiente> Para cualquier consulta sobre estos términos escríbenos a{" "}
            <a href={mailLink} className={enlace}>
              {EMAIL}
            </a>
            .
          </p>
        ),
      },
      {
        titulo: "Cambios en estos términos",
        contenido: <p>Podemos actualizar estos términos; la versión vigente es la publicada en esta página.</p>,
      },
    ]}
  />
);

export default Page;
