import { afterEach, describe, expect, it, vi } from "vitest";
import { leerClaveSecreta } from "@/lib/supabase/servicio";
import {
  esquemaClaveNueva,
  esquemaNuevoUsuario,
  estadoUsuario,
  esRol,
  generarClaveTemporal,
  MENSAJE_ULTIMO_ADMINISTRADOR,
  motivoBloqueo,
  puedeGestionarUsuarios,
  type UsuarioPanel,
} from "./roles";

const usuario = (id: string, extra: Partial<UsuarioPanel> = {}): UsuarioPanel => ({
  id,
  correo: `${id}@ejemplo.com`,
  rol: "administrador",
  suspendidoEn: null,
  debeCambiarClave: false,
  creadoEn: "2026-11-07T00:00:00Z",
  creadoPor: null,
  ultimoIngreso: null,
  ...extra,
});

describe("roles", () => {
  it("solo el administrador gestiona usuarios", () => {
    expect(puedeGestionarUsuarios("administrador")).toBe(true);
    expect(puedeGestionarUsuarios("editor")).toBe(false);
  });

  it("reconoce solo los roles conocidos", () => {
    expect(esRol("editor")).toBe(true);
    expect(esRol("superusuario")).toBe(false);
    expect(esRol(null)).toBe(false);
  });

  it("estado: suspendido manda sobre la contraseña temporal", () => {
    expect(estadoUsuario({ suspendidoEn: null, debeCambiarClave: false })).toBe("activo");
    expect(estadoUsuario({ suspendidoEn: null, debeCambiarClave: true })).toBe("invitado");
    expect(estadoUsuario({ suspendidoEn: "2026-11-07T00:00:00Z", debeCambiarClave: true })).toBe("suspendido");
  });
});

describe("motivoBloqueo", () => {
  const yo = usuario("yo");
  const otroAdmin = usuario("otro");
  const editora = usuario("editora", { rol: "editor" });

  it("nadie se cambia a sí mismo desde la lista", () => {
    for (const accion of ["cambiar_rol", "suspender", "quitar_acceso"] as const) {
      expect(motivoBloqueo(accion, yo, "yo", [yo, otroAdmin], "editor")).toMatch(/propia cuenta/);
    }
    expect(motivoBloqueo("restablecer_clave", yo, "yo", [yo])).toMatch(/Mi cuenta/);
  });

  it("un administrador gestiona a una editora", () => {
    const todos = [yo, editora];
    expect(motivoBloqueo("cambiar_rol", editora, "yo", todos, "administrador")).toBeNull();
    expect(motivoBloqueo("suspender", editora, "yo", todos)).toBeNull();
    expect(motivoBloqueo("restablecer_clave", editora, "yo", todos)).toBeNull();
    expect(motivoBloqueo("quitar_acceso", editora, "yo", todos)).toBeNull();
  });

  it("no deja el sitio sin administrador activo", () => {
    // El único administrador activo es "otro" (yo estoy suspendido en este escenario hipotético).
    const yoSuspendido = usuario("yo", { suspendidoEn: "2026-11-07T00:00:00Z" });
    const todos = [yoSuspendido, otroAdmin, editora];
    expect(motivoBloqueo("suspender", otroAdmin, "yo", todos)).toBe(MENSAJE_ULTIMO_ADMINISTRADOR);
    expect(motivoBloqueo("quitar_acceso", otroAdmin, "yo", todos)).toBe(MENSAJE_ULTIMO_ADMINISTRADOR);
    expect(motivoBloqueo("cambiar_rol", otroAdmin, "yo", todos, "editor")).toBe(MENSAJE_ULTIMO_ADMINISTRADOR);
    // Con otro administrador activo, sí se puede.
    expect(motivoBloqueo("cambiar_rol", otroAdmin, "yo", [yo, otroAdmin], "editor")).toBeNull();
    expect(motivoBloqueo("quitar_acceso", otroAdmin, "yo", [yo, otroAdmin])).toBeNull();
  });

  it("rechaza cambios que no cambian nada", () => {
    const suspendida = usuario("editora", { rol: "editor", suspendidoEn: "2026-11-07T00:00:00Z" });
    expect(motivoBloqueo("cambiar_rol", editora, "yo", [yo, editora], "editor")).toMatch(/Ya tiene/);
    expect(motivoBloqueo("cambiar_rol", editora, "yo", [yo, editora])).toBe("Elige un rol.");
    expect(motivoBloqueo("suspender", suspendida, "yo", [yo, suspendida])).toMatch(/ya está suspendido/);
    expect(motivoBloqueo("reactivar", editora, "yo", [yo, editora])).toMatch(/ya está activo/);
    expect(motivoBloqueo("reactivar", suspendida, "yo", [yo, suspendida])).toBeNull();
  });
});

describe("contraseña temporal", () => {
  it("tiene tres grupos de cuatro, sin caracteres confusos", () => {
    for (let i = 0; i < 200; i++) {
      const clave = generarClaveTemporal();
      expect(clave).toMatch(/^[a-km-zA-HJ-NP-Z2-9]{4}-[a-km-zA-HJ-NP-Z2-9]{4}-[a-km-zA-HJ-NP-Z2-9]{4}$/);
      expect(clave).not.toMatch(/[0O1lI]/);
    }
  });

  it("descarta los bytes que sesgarían la distribución", () => {
    // 255 está por encima del límite de rechazo (56 * 4 = 224): nunca se usa.
    let llamada = 0;
    const clave = generarClaveTemporal((n) => new Uint8Array(n).fill(llamada++ === 0 ? 255 : 0));
    expect(clave).toBe("aaaa-aaaa-aaaa");
  });

  it("no se repite", () => {
    const claves = new Set(Array.from({ length: 500 }, () => generarClaveTemporal()));
    expect(claves.size).toBe(500);
  });
});

describe("esquemas", () => {
  it("normaliza el correo y exige un rol", () => {
    const ok = esquemaNuevoUsuario.safeParse({ correo: "  Ana@Ejemplo.COM ", rol: "editor" });
    expect(ok.success && ok.data.correo).toBe("ana@ejemplo.com");
    const mal = esquemaNuevoUsuario.safeParse({ correo: "ana", rol: "dueña" });
    expect(mal.success).toBe(false);
    expect(mal.error?.issues.map((i) => i.path[0])).toEqual(["correo", "rol"]);
  });

  it("contraseña nueva: largo mínimo y confirmación", () => {
    expect(esquemaClaveNueva.safeParse({ clave: "corta", confirmacion: "corta" }).success).toBe(false);
    const distinta = esquemaClaveNueva.safeParse({ clave: "una frase larga", confirmacion: "otra frase larga" });
    expect(distinta.error?.issues[0].path).toEqual(["confirmacion"]);
    expect(esquemaClaveNueva.safeParse({ clave: "una frase larga", confirmacion: "una frase larga" }).success).toBe(true);
  });
});

describe("leerClaveSecreta", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("solo acepta claves secretas con formato de Supabase", () => {
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(leerClaveSecreta()).toBeNull();
    vi.stubEnv("SUPABASE_SECRET_KEY", "sin-clave");
    expect(leerClaveSecreta()).toBeNull();
    vi.stubEnv("SUPABASE_SECRET_KEY", " sb_secret_abc ");
    expect(leerClaveSecreta()).toBe("sb_secret_abc");
    vi.stubEnv("SUPABASE_SECRET_KEY", "eyJhbGciOi.x.y");
    expect(leerClaveSecreta()).toBe("eyJhbGciOi.x.y");
  });
});
