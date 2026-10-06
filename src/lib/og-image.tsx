import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { BRAND_NAME } from "@/lib/contact";
import { OG_SIZE } from "@/lib/seo";

// ImageResponse no lee las variables CSS de Tailwind: estos hex repiten los
// tokens `dark`, `primary` y `secondary` de globals.css.
const DARK = "#122137";
const SECONDARY = "#7CC04B";

/** Imagen para compartir el enlace (Open Graph y Twitter). Sin cifras ni promesas. */
export const generarImagenOg = async () => {
  const logo = await readFile(
    path.join(process.cwd(), "public", "imagenes", "logo AS Tupropiedad.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 96px",
          background: DARK,
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 340,
            height: 340,
            borderRadius: 48,
            background: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={300} height={300} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1.05 }}>
            {BRAND_NAME}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: SECONDARY,
            }}
          >
            Boutique inmobiliaria · Lima
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
};
