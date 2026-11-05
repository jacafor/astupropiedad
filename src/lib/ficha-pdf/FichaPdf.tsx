import { Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BRAND_NAME, EMAIL, PHONE_DISPLAY } from "@/lib/contact";
import { precioTexto } from "@/lib/propiedades";
import { ETIQUETA_OPERACION, ETIQUETA_TIPO, type Property } from "@/data/properties";

/**
 * Ficha de propiedad en PDF (A4), generada en el servidor por `/propiedades/[slug]/ficha.pdf`.
 * react-pdf no lee Tailwind: estos hex repiten los tokens `primary`, `secondary`, `dark` y `light`
 * de globals.css. Fuentes estándar del PDF (Helvetica y Times), que traen tildes y ñ.
 */
const COLOR = { primary: "#014898", secondary: "#7CC04B", dark: "#122137", light: "#f8fafc", texto: "#374151", borde: "#e5e7eb" };

/** Una foto ya convertida a JPG (react-pdf no admite WebP). */
export type FotoPdf = { datos: Buffer; alt: string };

export type DatosFichaPdf = {
  propiedad: Property;
  /** Portada primero; hasta 4. */
  fotos: FotoPdf[];
  logo: Buffer;
  /** Enlace absoluto a la ficha web. */
  url: string;
  /** Fecha de generación, ya formateada ("5 de noviembre de 2026"). */
  fecha: string;
};

const s = StyleSheet.create({
  pagina: { paddingTop: 24, paddingBottom: 60, paddingHorizontal: 36, fontFamily: "Helvetica", fontSize: 10, color: COLOR.texto },
  cabecera: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  logo: { width: 64, height: 64 },
  eyebrow: { fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 1.5, color: COLOR.primary, textAlign: "right" },
  referencia: { fontFamily: "Helvetica-Bold", fontSize: 12, color: COLOR.dark, textAlign: "right", marginTop: 3 },
  portada: { width: "100%", height: 235, objectFit: "cover", borderRadius: 10 },
  miniaturas: { flexDirection: "row", gap: 8, marginTop: 8 },
  miniatura: { flex: 1, height: 80, objectFit: "cover", borderRadius: 6 },
  insignias: { flexDirection: "row", gap: 6, marginTop: 12 },
  insignia: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.2, color: "white", backgroundColor: COLOR.dark, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  insigniaClara: { color: COLOR.dark, backgroundColor: COLOR.light, borderWidth: 1, borderColor: COLOR.borde },
  insigniaEstado: { backgroundColor: COLOR.primary },
  titulo: { fontFamily: "Times-Bold", fontSize: 21, color: COLOR.dark, marginTop: 8 },
  distrito: { fontFamily: "Helvetica-Bold", fontSize: 9, letterSpacing: 1, color: COLOR.texto, marginTop: 4 },
  precio: { fontFamily: "Helvetica-Bold", fontSize: 22, color: COLOR.primary, marginTop: 8 },
  datos: { flexDirection: "row", gap: 6, marginTop: 12 },
  dato: { flex: 1, backgroundColor: COLOR.light, borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  datoValor: { fontFamily: "Helvetica-Bold", fontSize: 13, color: COLOR.dark },
  datoEtiqueta: { fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 1, color: COLOR.texto, marginTop: 2 },
  subtitulo: { fontFamily: "Times-Bold", fontSize: 14, color: COLOR.dark, marginTop: 12, marginBottom: 4 },
  parrafo: { lineHeight: 1.5 },
  lista: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  item: { width: "50%", flexDirection: "row", marginTop: 4, paddingRight: 8 },
  vineta: { color: COLOR.secondary, fontFamily: "Helvetica-Bold", width: 10 },
  pie: { position: "absolute", left: 36, right: 36, bottom: 22, borderTopWidth: 1, borderTopColor: COLOR.borde, paddingTop: 8, flexDirection: "row", justifyContent: "space-between", fontSize: 8 },
  pieMarca: { fontFamily: "Helvetica-Bold", color: COLOR.dark, fontSize: 9 },
  enlace: { color: COLOR.primary, textDecoration: "none" },
});

const Dato = ({ valor, etiqueta }: { valor: string; etiqueta: string }) => (
  <View style={s.dato}>
    <Text style={s.datoValor}>{valor}</Text>
    <Text style={s.datoEtiqueta}>{etiqueta.toUpperCase()}</Text>
  </View>
);

const FichaPdf = ({ propiedad: p, fotos, logo, url, fecha }: DatosFichaPdf) => {
  const [portada, ...otras] = fotos;
  return (
    <Document title={`${p.titulo} · ${BRAND_NAME}`} author={BRAND_NAME} subject={`Ficha de la propiedad ${p.id}`} language="es-PE">
      <Page size="A4" style={s.pagina}>
        <View style={s.cabecera}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf, no de HTML */}
          <Image src={logo} style={s.logo} />
          <View>
            <Text style={s.eyebrow}>FICHA DE PROPIEDAD</Text>
            <Text style={s.referencia}>Ref. {p.id}</Text>
          </View>
        </View>

        {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf, no de HTML */}
        {portada && <Image src={portada.datos} style={s.portada} />}
        {otras.length > 0 && (
          <View style={s.miniaturas}>
            {otras.map((f, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text -- Image de react-pdf, no de HTML
              <Image key={i} src={f.datos} style={s.miniatura} />
            ))}
          </View>
        )}

        <View style={s.insignias}>
          <Text style={s.insignia}>{ETIQUETA_OPERACION[p.operacion].toUpperCase()}</Text>
          <Text style={[s.insignia, s.insigniaClara]}>{ETIQUETA_TIPO[p.tipo].toUpperCase()}</Text>
          {p.estado !== "disponible" && (
            <Text style={[s.insignia, s.insigniaEstado]}>{p.estado === "reservado" ? "RESERVADO" : "VENDIDO"}</Text>
          )}
        </View>
        <Text style={s.titulo}>{p.titulo}</Text>
        <Text style={s.distrito}>{p.distrito.toUpperCase()}</Text>
        <Text style={s.precio}>{precioTexto(p)}</Text>

        <View style={s.datos}>
          <Dato valor={`${p.areaConstruidaM2} m²`} etiqueta="Construida" />
          {p.areaTotalM2 !== undefined && <Dato valor={`${p.areaTotalM2} m²`} etiqueta="Total" />}
          <Dato valor={String(p.dormitorios)} etiqueta="Dormitorios" />
          <Dato valor={String(p.banos)} etiqueta="Baños" />
          <Dato valor={String(p.cocheras)} etiqueta="Cocheras" />
        </View>

        <Text style={s.subtitulo}>Descripción</Text>
        <Text style={s.parrafo}>{p.descripcion.trim()}</Text>

        {p.caracteristicas && p.caracteristicas.length > 0 && (
          <>
            <Text style={s.subtitulo}>Características</Text>
            <View style={s.lista}>
              {p.caracteristicas.map((c) => (
                <View key={c} style={s.item} wrap={false}>
                  <Text style={s.vineta}>•</Text>
                  <Text>{c}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={s.pie} fixed>
          <View>
            <Text style={s.pieMarca}>{BRAND_NAME}</Text>
            <Text>
              WhatsApp {PHONE_DISPLAY} · {EMAIL}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Link src={url} style={s.enlace}>
              Ver la ficha en línea
            </Link>
            <Text>Generada el {fecha}. Precio y disponibilidad sujetos a confirmación.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FichaPdf;
