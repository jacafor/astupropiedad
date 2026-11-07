"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Ban, Check, Copy, KeyRound, PlayCircle, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import {
  cambiarRol,
  crearUsuario,
  quitarAcceso,
  reactivarUsuario,
  restablecerClave,
  suspenderUsuario,
} from "@/app/admin/acciones-usuarios";
import {
  DESCRIPCION_ROL,
  ETIQUETA_ESTADO_USUARIO,
  ETIQUETA_ROL,
  estadoUsuario,
  ROLES,
  type EstadoUsuario,
  type Rol,
  type UsuarioPanel,
} from "@/lib/admin/roles";
import type { ResultadoAccion, ResultadoClave } from "@/lib/admin/tipos";
import { Aviso, estilos } from "./ui";

// Contraste ≥ 4.5:1 (docs/DISENO.md §4), como Insignias.tsx.
const COLOR_ROL: Record<Rol, string> = {
  administrador: "bg-dark text-white",
  editor: "bg-white text-primary border border-primary",
};

const COLOR_ESTADO: Record<EstadoUsuario, string> = {
  activo: "bg-white text-secondary-dark border border-secondary-dark",
  invitado: "bg-gray-200 text-dark",
  suspendido: "bg-white text-red-700 border border-red-600",
};

export const InsigniaRol = ({ rol }: { rol: Rol }) => (
  <span className={`${estilos.insignia} ${COLOR_ROL[rol]}`}>{ETIQUETA_ROL[rol]}</span>
);

export const InsigniaEstadoUsuario = ({ estado }: { estado: EstadoUsuario }) => (
  <span className={`${estilos.insignia} ${COLOR_ESTADO[estado]}`}>{ETIQUETA_ESTADO_USUARIO[estado]}</span>
);

// ───────────────────────── Contraseña temporal (se muestra una vez) ─────────────────────────

const ClaveTemporal = ({ correo, clave, urlIngreso, alCerrar }: { correo: string; clave: string; urlIngreso: string; alCerrar: () => void }) => {
  const [copiada, setCopiada] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const id = useId();

  // Foco al panel: quien usa lector de pantalla oye la contraseña nueva sin buscarla.
  useEffect(() => titulo.current?.focus(), []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(clave);
      setCopiada(true);
    } catch {
      setCopiada(false);
    }
  };

  return (
    <section aria-labelledby={id} className="rounded-2xl border-2 border-primary bg-light p-5 sm:p-6 space-y-4">
      <h3 id={id} ref={titulo} tabIndex={-1} className="text-lg font-serif font-black text-dark focus:outline-none">
        Contraseña temporal de <span className="break-all">{correo}</span>
      </h3>
      <div className="flex flex-wrap items-center gap-3">
        <code
          aria-label="Contraseña temporal"
          className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-dark bg-white border border-gray-300 rounded-xl px-4 py-3 select-all break-all"
        >
          {clave}
        </code>
        <button type="button" onClick={copiar} className={estilos.botonSecundario}>
          {copiada ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
          {copiada ? "Copiada" : "Copiar"}
        </button>
      </div>
      <p role="status" className="sr-only">
        {copiada ? "Contraseña copiada" : ""}
      </p>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700 leading-relaxed">
        <li>Entrégasela por un canal privado (en persona o por un chat directo), no en un grupo.</li>
        <li>
          Que entre en <span className="font-bold text-dark break-all">{urlIngreso}</span> con su correo y esta contraseña.
        </li>
        <li>Al entrar, el sistema le pedirá elegir una propia; esta deja de usarse.</li>
      </ol>
      <p className="text-sm font-bold text-dark">No se volverá a mostrar. Si se pierde, genera otra desde la lista.</p>
      <button type="button" onClick={alCerrar} className={estilos.botonPrincipal}>
        Ya la entregué o la copié
      </button>
    </section>
  );
};

// ───────────────────────── Dar acceso ─────────────────────────

export const FormNuevoUsuario = ({ habilitado, urlIngreso }: { habilitado: boolean; urlIngreso: string }) => {
  const [resultado, enviar, enviando] = useActionState<ResultadoClave | null, FormData>(crearUsuario, null);
  const [cerrado, setCerrado] = useState<string | null>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const id = useId();
  const errores = resultado?.errores ?? {};
  const claveVisible = resultado?.ok && resultado.clave && resultado.correo && cerrado !== resultado.clave;

  // Con `onSubmit` (no `action`) React no vacía el formulario si hay un error; tras crear, sí se vacía.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => enviar(fd));
  };
  useEffect(() => {
    if (resultado?.ok) formulario.current?.reset();
  }, [resultado]);

  return (
    <section aria-labelledby={`${id}-titulo`} className={`${estilos.tarjeta} p-6 sm:p-8 space-y-6`}>
      <div>
        <h2 id={`${id}-titulo`} className="text-xl font-serif font-black text-dark">
          Dar acceso a una persona
        </h2>
        <p className="mt-2 text-gray-700">
          Se crea su cuenta con una contraseña temporal que verás aquí una sola vez. No se envía ningún correo.
        </p>
      </div>

      <div aria-live="polite">{resultado && !(resultado.ok && !claveVisible) && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}</div>

      {claveVisible && (
        <ClaveTemporal correo={resultado.correo!} clave={resultado.clave!} urlIngreso={urlIngreso} alCerrar={() => setCerrado(resultado.clave!)} />
      )}
      {/* Oculto (no desmontado) mientras se muestra la clave: así conserva su estado. */}
      <div hidden={Boolean(claveVisible)}>
        <form ref={formulario} onSubmit={onSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor={`${id}-correo`} className={estilos.etiqueta}>
              Correo de la persona
            </label>
            <input
              id={`${id}-correo`}
              name="correo"
              type="email"
              autoComplete="off"
              required
              disabled={!habilitado}
              aria-invalid={errores.correo ? true : undefined}
              aria-describedby={errores.correo ? `${id}-correo-error` : undefined}
              className={`${estilos.campo} ${errores.correo ? estilos.campoError : estilos.campoNormal}`}
            />
            {errores.correo && (
              <p id={`${id}-correo-error`} className={estilos.error}>
                {errores.correo}
              </p>
            )}
          </div>

          <fieldset aria-describedby={errores.rol ? `${id}-rol-error` : undefined}>
            <legend className={estilos.etiqueta}>Rol</legend>
            <div className="grid gap-3">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className="flex items-start gap-3 rounded-2xl border border-gray-300 p-4 cursor-pointer has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
                >
                  <input
                    type="radio"
                    name="rol"
                    value={r}
                    defaultChecked={r === "editor"}
                    disabled={!habilitado}
                    className="mt-1 w-5 h-5 accent-primary shrink-0"
                  />
                  <span>
                    <span className="block font-black text-dark">{ETIQUETA_ROL[r]}</span>
                    <span className="block text-sm text-gray-700">{DESCRIPCION_ROL[r]}</span>
                  </span>
                </label>
              ))}
            </div>
            {errores.rol && (
              <p id={`${id}-rol-error`} className={estilos.error}>
                {errores.rol}
              </p>
            )}
          </fieldset>

          <button type="submit" disabled={enviando || !habilitado} className={estilos.botonPrincipal}>
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            {enviando ? "Creando…" : "Crear acceso"}
          </button>
        </form>
      </div>
    </section>
  );
};

// ───────────────────────── Una persona de la lista ─────────────────────────

const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Lima" });

export const FilaUsuario = ({
  usuario,
  esYo,
  habilitado,
  urlIngreso,
}: {
  usuario: UsuarioPanel;
  esYo: boolean;
  habilitado: boolean;
  urlIngreso: string;
}) => {
  const [resultado, setResultado] = useState<ResultadoClave | null>(null);
  const [quitado, setQuitado] = useState(false);
  const [pendiente, iniciar] = useTransition();
  const estado = estadoUsuario(usuario);
  const otroRol: Rol = usuario.rol === "administrador" ? "editor" : "administrador";
  const titulo = useId();

  const ejecutar = (fn: () => Promise<ResultadoAccion | ResultadoClave>, confirmar?: string) => () => {
    if (confirmar && !window.confirm(confirmar)) return;
    iniciar(async () => {
      setResultado(await fn());
    });
  };

  const claveVisible = resultado?.ok && resultado.clave && resultado.correo;

  // Tras quitar el acceso la fila se queda con el aviso (si desapareciera, nadie leería la confirmación).
  if (quitado) {
    return (
      <li aria-labelledby={titulo} className={`${estilos.tarjeta} p-5 sm:p-6 space-y-3`}>
        <h3 id={titulo} className="font-black text-gray-700 text-lg leading-tight break-all line-through">
          {usuario.correo}
        </h3>
        <div aria-live="polite">{resultado && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}</div>
      </li>
    );
  }

  return (
    <li aria-labelledby={titulo} className={`${estilos.tarjeta} p-5 sm:p-6 space-y-4`}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 mr-auto">
          <h3 id={titulo} className="font-black text-dark text-lg leading-tight break-all">
            {usuario.correo}
            {esYo && <span className="ml-2 text-xs font-black uppercase tracking-widest text-gray-600">(tú)</span>}
          </h3>
          <p className="text-sm text-gray-700 mt-1">
            Último ingreso: {usuario.ultimoIngreso ? fecha.format(new Date(usuario.ultimoIngreso)) : "nunca"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Acceso desde {fecha.format(new Date(usuario.creadoEn))}
            {usuario.creadoPor ? ` · lo dio ${usuario.creadoPor}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InsigniaRol rol={usuario.rol} />
          <InsigniaEstadoUsuario estado={estado} />
        </div>
      </div>

      <div aria-live="polite">{resultado && !claveVisible && <Aviso ok={resultado.ok} mensaje={resultado.mensaje} />}</div>
      {claveVisible && (
        <ClaveTemporal correo={resultado.correo!} clave={resultado.clave!} urlIngreso={urlIngreso} alCerrar={() => setResultado(null)} />
      )}

      {esYo ? (
        <p className="text-sm text-gray-700">
          Es tu cuenta: tu contraseña la cambias en <Link href="/admin/cuenta" className="font-bold text-primary underline">Mi cuenta</Link>. Tu rol
          o tu acceso solo los puede cambiar otro administrador.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2" aria-label={`Acciones para ${usuario.correo}`} role="group">
          <button
            type="button"
            disabled={!habilitado || pendiente}
            onClick={ejecutar(() => cambiarRol(usuario.id, otroRol))}
            className={estilos.botonSecundario}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Hacer {ETIQUETA_ROL[otroRol].toLowerCase()}
          </button>
          {usuario.suspendidoEn ? (
            <button type="button" disabled={!habilitado || pendiente} onClick={ejecutar(() => reactivarUsuario(usuario.id))} className={estilos.botonSecundario}>
              <PlayCircle className="w-4 h-4" aria-hidden="true" />
              Reactivar
            </button>
          ) : (
            <button
              type="button"
              disabled={!habilitado || pendiente}
              onClick={ejecutar(
                () => suspenderUsuario(usuario.id),
                `¿Suspender a ${usuario.correo}? No podrá entrar hasta que lo reactives. Sus propiedades no cambian.`
              )}
              className={estilos.botonSecundario}
            >
              <Ban className="w-4 h-4" aria-hidden="true" />
              Suspender
            </button>
          )}
          <button
            type="button"
            disabled={!habilitado || pendiente}
            onClick={ejecutar(
              () => restablecerClave(usuario.id),
              `¿Generar una contraseña temporal nueva para ${usuario.correo}? La actual dejará de servir.`
            )}
            className={estilos.botonSecundario}
          >
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            Nueva contraseña
          </button>
          <button
            type="button"
            disabled={!habilitado || pendiente}
            onClick={ejecutar(
              async () => {
                const r = await quitarAcceso(usuario.id);
                if (r.ok) setQuitado(true);
                return r;
              },
              `¿Quitar el acceso a ${usuario.correo}? Se borra su cuenta del administrador (las propiedades que cargó se quedan). No se puede deshacer, pero puedes volver a darle acceso.`
            )}
            className={estilos.botonPeligro}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Quitar acceso
          </button>
        </div>
      )}
    </li>
  );
};
