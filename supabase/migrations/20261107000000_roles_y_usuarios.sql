-- Usuarios y roles del administrador (D-35, 2026-11-07). Reemplaza el alta a mano por SQL.
--
-- `administradores` pasa a ser la lista de personas con acceso a /admin, cada una con un rol:
--   administrador → catálogo + gestión de usuarios (/admin/usuarios)
--   editor        → solo catálogo (crear, editar, fotos, publicar, archivar)
-- `es_admin()` conserva su nombre (lo usan todas las políticas del catálogo y del bucket) pero ahora
-- significa "tiene acceso activo al catálogo": cualquier rol, sin suspender. La gestión de usuarios
-- usa `es_administrador()`.
--
-- Las altas, contraseñas, suspensiones y bajas las hace el servidor con la clave secreta
-- (SUPABASE_SECRET_KEY, solo en el servidor) después de comprobar `es_administrador()`; por eso no
-- hay políticas de escritura para `authenticated` en estas tablas.

-- ───────────────────────── Rol y estado ─────────────────────────
alter table public.administradores
  add column rol text not null default 'administrador' check (rol in ('administrador', 'editor')),
  -- Con valor: sin acceso (además, Auth la bloquea con `ban_duration`).
  add column suspendido_en timestamptz,
  -- true mientras la persona use la contraseña temporal que le dio quien la creó.
  add column debe_cambiar_clave boolean not null default false,
  add column creado_por text;

-- Acceso al catálogo: cualquier rol, sin suspender. (Mismo nombre, para no tocar las políticas.)
create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores
    where user_id = (select auth.uid()) and suspendido_en is null
  );
$$;

-- Gestión de usuarios: solo el rol administrador, sin suspender.
create function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.administradores
    where user_id = (select auth.uid()) and suspendido_en is null and rol = 'administrador'
  );
$$;

revoke execute on function public.es_administrador() from public, anon;
grant execute on function public.es_administrador() to authenticated;

-- ───────────────────────── Siempre un administrador activo ─────────────────────────
-- Ni cambiar de rol, ni suspender, ni borrar (tampoco en cascada al borrar la cuenta de Auth) puede
-- dejar el sitio sin ningún administrador activo. La app lo comprueba antes; esto es la red.
create function public.administradores_conservar_uno()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.rol = 'administrador' and old.suspendido_en is null
     and (tg_op = 'DELETE' or new.rol <> 'administrador' or new.suspendido_en is not null)
     and not exists (
       select 1 from public.administradores
       where user_id <> old.user_id and rol = 'administrador' and suspendido_en is null
     )
  then
    raise exception 'Debe quedar al menos un administrador activo'
      using errcode = 'P0001', hint = 'ultimo_administrador';
  end if;
  return coalesce(new, old);
end;
$$;

revoke execute on function public.administradores_conservar_uno() from public, anon, authenticated;

create trigger administradores_conservar_uno
  before update or delete on public.administradores
  for each row execute function public.administradores_conservar_uno();

-- ───────────────────────── Lecturas para el panel ─────────────────────────
-- Lista para /admin/usuarios con el último ingreso (que vive en auth.users). Solo administradores.
create function public.listar_usuarios()
returns table (
  user_id uuid,
  correo text,
  rol text,
  suspendido_en timestamptz,
  debe_cambiar_clave boolean,
  creado_en timestamptz,
  creado_por text,
  ultimo_ingreso timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_administrador() then
    raise exception 'Sin permiso' using errcode = '42501';
  end if;
  return query
    select a.user_id, a.correo, a.rol, a.suspendido_en, a.debe_cambiar_clave, a.creado_en, a.creado_por,
           u.last_sign_in_at
      from public.administradores a
      left join auth.users u on u.id = a.user_id
     order by a.creado_en;
end;
$$;

revoke execute on function public.listar_usuarios() from public, anon;
grant execute on function public.listar_usuarios() to authenticated;

-- Quien entra con contraseña temporal y la cambia en /admin/cuenta: solo toca su propia fila.
create function public.clave_cambiada()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.administradores set debe_cambiar_clave = false
   where user_id = (select auth.uid());
$$;

revoke execute on function public.clave_cambiada() from public, anon;
grant execute on function public.clave_cambiada() to authenticated;

-- ───────────────────────── Registro de cambios ─────────────────────────
-- Quién hizo qué sobre qué cuenta. Sin contraseñas ni datos más allá del correo. Lo escribe el
-- servidor (clave secreta); los administradores lo leen en /admin/usuarios.
create table public.auditoria_usuarios (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  actor_id uuid,
  actor_correo text not null,
  accion text not null check (accion in (
    'crear', 'cambiar_rol', 'suspender', 'reactivar', 'restablecer_clave', 'quitar_acceso'
  )),
  objetivo_correo text not null,
  detalle text
);

create index auditoria_usuarios_creado_idx on public.auditoria_usuarios (creado_en desc);

alter table public.auditoria_usuarios enable row level security;

revoke all on public.auditoria_usuarios from anon, authenticated;
grant select on public.auditoria_usuarios to authenticated;

create policy "administradores leen el registro"
  on public.auditoria_usuarios for select to authenticated
  using ((select public.es_administrador()));
