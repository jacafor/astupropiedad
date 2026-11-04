-- Ajustes tras el asesor de Supabase (sesión 16, 2026-11-04).

-- 1) es_admin(): el visitante anónimo no la necesita (ninguna política de anon la usa). Sigue
--    disponible para `authenticated`: las políticas la llaman y /admin la consulta por RPC; solo
--    responde si quien llama es administrador, no expone filas.
revoke execute on function public.es_admin() from anon;

-- 2) Una sola política de lectura por rol y tabla (el asesor avisa que dos permisivas se evalúan
--    ambas en cada consulta). Mismo resultado: el público ve lo publicado; administración, todo.
drop policy "el público ve lo publicado" on public.propiedades;
drop policy "administración ve todo" on public.propiedades;

create policy "el público ve lo publicado"
  on public.propiedades for select to anon
  using (visibilidad = 'publicada');

create policy "con sesión: lo publicado o todo si administra"
  on public.propiedades for select to authenticated
  using (visibilidad = 'publicada' or (select public.es_admin()));

drop policy "el público ve fotos de lo publicado" on public.fotos_propiedad;
drop policy "administración ve todas las fotos" on public.fotos_propiedad;

create policy "el público ve fotos de lo publicado"
  on public.fotos_propiedad for select to anon
  using (exists (
    select 1 from public.propiedades p
    where p.id = propiedad_id and p.visibilidad = 'publicada'
  ));

-- La subconsulta pasa por la RLS de propiedades: con sesión, ve las publicadas o todas si administra.
create policy "con sesión: fotos de lo publicado o todas si administra"
  on public.fotos_propiedad for select to authenticated
  using (
    (select public.es_admin())
    or exists (
      select 1 from public.propiedades p
      where p.id = propiedad_id and p.visibilidad = 'publicada'
    )
  );

-- 3) rls_auto_enable() la crea Supabase en proyectos nuevos (activa RLS en cada tabla nueva de
--    public). Es una función de event trigger: no se puede llamar por RPC, pero el asesor la marca
--    como SECURITY DEFINER ejecutable. Quitar EXECUTE no afecta al trigger. Solo si existe.
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
