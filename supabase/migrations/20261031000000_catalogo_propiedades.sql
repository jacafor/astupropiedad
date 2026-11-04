-- Catálogo de propiedades administrado desde /admin (sesión 16, reemplaza D-11).
-- Lectura pública solo de lo publicado; escritura solo de quien esté en `administradores`.
-- Sin service role: el sitio usa la clave publicable y la sesión de quien administra (RLS manda).

-- ───────────────────────── Administradores ─────────────────────────
-- Se agregan a mano en el editor SQL (ver docs/NEGOCIO-Y-CONTENIDO.md):
--   insert into public.administradores (user_id, correo)
--   select id, email from auth.users where email = 'correo@ejemplo.com';
create table public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  correo text not null,
  creado_en timestamptz not null default now()
);

alter table public.administradores enable row level security;

create policy "cada quien ve su propia fila"
  on public.administradores for select to authenticated
  using (user_id = (select auth.uid()));

-- security definer: consulta `administradores` sin depender de su RLS. search_path vacío (buena práctica).
create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.administradores where user_id = (select auth.uid()));
$$;

revoke execute on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- ───────────────────────── Propiedades ─────────────────────────
create table public.propiedades (
  id uuid primary key default gen_random_uuid(),
  -- Referencia corta que se muestra y viaja en WhatsApp (Property.id, ej. "JM-001").
  codigo text not null unique check (codigo ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$' and char_length(codigo) <= 20),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  titulo text not null check (char_length(titulo) between 5 and 90),
  operacion text not null check (operacion in ('venta', 'alquiler')),
  tipo text not null check (tipo in ('departamento', 'casa', 'oficina', 'terreno')),
  distrito text not null check (char_length(distrito) between 2 and 60),
  precio numeric(14, 2) not null check (precio > 0),
  moneda text not null check (moneda in ('USD', 'PEN')),
  area_construida_m2 numeric(10, 2) not null check (area_construida_m2 > 0),
  area_total_m2 numeric(10, 2) check (area_total_m2 > 0),
  dormitorios smallint not null check (dormitorios between 0 and 50),
  banos smallint not null check (banos between 0 and 50),
  cocheras smallint not null check (cocheras between 0 and 50),
  descripcion text not null check (char_length(descripcion) between 20 and 5000),
  caracteristicas text[] not null default '{}',
  estado text not null default 'disponible' check (estado in ('disponible', 'reservado', 'vendido')),
  destacada boolean not null default false,
  -- borrador: solo /admin · publicada: sitio público · archivada: fuera del sitio (ficha 404).
  visibilidad text not null default 'borrador' check (visibilidad in ('borrador', 'publicada', 'archivada')),
  -- Primera vez que se publicó: desde entonces el slug no cambia (enlaces y sitemap).
  publicada_en timestamptz,
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now(),
  -- D-28: venta en dólares, alquiler en soles.
  constraint moneda_por_operacion check (
    (operacion = 'venta' and moneda = 'USD') or (operacion = 'alquiler' and moneda = 'PEN')
  )
);

create index propiedades_visibilidad_idx on public.propiedades (visibilidad, estado);

create function public.propiedades_antes_de_guardar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizada_en := now();
  if new.visibilidad = 'publicada' and new.publicada_en is null then
    new.publicada_en := now();
  end if;
  if tg_op = 'UPDATE' then
    if old.publicada_en is not null and new.slug <> old.slug then
      raise exception 'El slug no se puede cambiar después de publicar la propiedad'
        using errcode = 'check_violation';
    end if;
    new.publicada_en := coalesce(old.publicada_en, new.publicada_en);
    new.creada_en := old.creada_en;
  end if;
  return new;
end;
$$;

create trigger propiedades_antes_de_guardar
  before insert or update on public.propiedades
  for each row execute function public.propiedades_antes_de_guardar();

alter table public.propiedades enable row level security;

create policy "el público ve lo publicado"
  on public.propiedades for select to anon, authenticated
  using (visibilidad = 'publicada');

create policy "administración ve todo"
  on public.propiedades for select to authenticated
  using ((select public.es_admin()));

create policy "administración crea"
  on public.propiedades for insert to authenticated
  with check ((select public.es_admin()));

create policy "administración edita"
  on public.propiedades for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));
-- Sin política de DELETE: las propiedades se archivan, no se borran.

-- ───────────────────────── Fotos ─────────────────────────
create table public.fotos_propiedad (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid not null references public.propiedades (id) on delete cascade,
  -- Ruta dentro del bucket "propiedades": <propiedad_id>/<uuid>.webp
  ruta text not null unique check (ruta ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'),
  alt text not null check (char_length(alt) between 5 and 160),
  orden integer not null default 0,
  ancho integer not null check (ancho > 0),
  alto integer not null check (alto > 0),
  creada_en timestamptz not null default now()
);

create index fotos_propiedad_propiedad_idx on public.fotos_propiedad (propiedad_id, orden);

alter table public.fotos_propiedad enable row level security;

create policy "el público ve fotos de lo publicado"
  on public.fotos_propiedad for select to anon, authenticated
  using (exists (
    select 1 from public.propiedades p
    where p.id = propiedad_id and p.visibilidad = 'publicada'
  ));

create policy "administración ve todas las fotos"
  on public.fotos_propiedad for select to authenticated
  using ((select public.es_admin()));

create policy "administración agrega fotos"
  on public.fotos_propiedad for insert to authenticated
  with check ((select public.es_admin()));

create policy "administración edita fotos"
  on public.fotos_propiedad for update to authenticated
  using ((select public.es_admin()))
  with check ((select public.es_admin()));

create policy "administración quita fotos"
  on public.fotos_propiedad for delete to authenticated
  using ((select public.es_admin()));

-- Cambiar portada u orden toca a la vez la propiedad y sus fotos; reordenar en una sola llamada
-- evita estados a medias. security invoker: las políticas de arriba siguen mandando.
create function public.ordenar_fotos(p_propiedad uuid, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.fotos_propiedad f
     set orden = x.pos
    from unnest(p_ids) with ordinality as x(id, pos)
   where f.id = x.id and f.propiedad_id = p_propiedad;
end;
$$;

revoke execute on function public.ordenar_fotos(uuid, uuid[]) from public, anon;
grant execute on function public.ordenar_fotos(uuid, uuid[]) to authenticated;

-- ───────────────────────── Almacenamiento ─────────────────────────
-- Bucket público de lectura (las fotos se sirven por URL); solo WebP (lo convierte el servidor) y ≤ 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('propiedades', 'propiedades', true, 5242880, array['image/webp']);

-- Borrar por la API de Storage exige también permiso de lectura sobre el objeto.
create policy "administración lista fotos"
  on storage.objects for select to authenticated
  using (bucket_id = 'propiedades' and (select public.es_admin()));

create policy "administración sube fotos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'propiedades' and (select public.es_admin()));

create policy "administración reemplaza fotos"
  on storage.objects for update to authenticated
  using (bucket_id = 'propiedades' and (select public.es_admin()))
  with check (bucket_id = 'propiedades' and (select public.es_admin()));

create policy "administración borra fotos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'propiedades' and (select public.es_admin()));
