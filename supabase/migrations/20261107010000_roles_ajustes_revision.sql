-- Ajustes de la revisión del PR #34 sobre 20261107000000_roles_y_usuarios.sql (D-36, 2026-11-07).

-- 1) `clave_cambiada()` ya no apaga la marca de contraseña temporal sin más: antes, quien entraba con
--    la temporal podía llamar a la RPC directamente y seguir usándola. Ahora se guarda el hash de la
--    contraseña temporal cuando se marca, y la marca solo se apaga si la contraseña de Auth cambió.
alter table public.administradores add column hash_clave_temporal text;

create function public.administradores_hash_temporal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.debe_cambiar_clave then
    -- La contraseña vigente al marcar es la temporal (el servidor la fija justo antes).
    select u.encrypted_password into new.hash_clave_temporal from auth.users u where u.id = new.user_id;
  else
    new.hash_clave_temporal := null;
  end if;
  return new;
end;
$$;

revoke execute on function public.administradores_hash_temporal() from public, anon, authenticated;

create trigger administradores_hash_temporal
  before insert or update on public.administradores
  for each row execute function public.administradores_hash_temporal();

-- Para quien ya estaba marcado al aplicar esta migración.
update public.administradores set debe_cambiar_clave = debe_cambiar_clave where debe_cambiar_clave;

drop function public.clave_cambiada();

create function public.clave_cambiada()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cambiadas integer;
begin
  update public.administradores a
     set debe_cambiar_clave = false
    from auth.users u
   where a.user_id = (select auth.uid())
     and u.id = a.user_id
     and a.debe_cambiar_clave
     and u.encrypted_password is distinct from a.hash_clave_temporal;
  get diagnostics cambiadas = row_count;
  return cambiadas > 0;
end;
$$;

revoke execute on function public.clave_cambiada() from public, anon;
grant execute on function public.clave_cambiada() to authenticated;

-- 2) Último administrador: dos cambios simultáneos (cada administrador suspende o degrada al otro)
--    podían pasar la comprobación a la vez. Un candado por transacción los pone en fila: el segundo
--    ve el cambio ya confirmado del primero y se rechaza.
create or replace function public.administradores_conservar_uno()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.rol = 'administrador' and old.suspendido_en is null
     and (tg_op = 'DELETE' or new.rol <> 'administrador' or new.suspendido_en is not null)
  then
    perform pg_advisory_xact_lock(hashtext('public.administradores_conservar_uno'));
    if not exists (
      select 1 from public.administradores
      where user_id <> old.user_id and rol = 'administrador' and suspendido_en is null
    ) then
      raise exception 'Debe quedar al menos un administrador activo'
        using errcode = 'P0001', hint = 'ultimo_administrador';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
