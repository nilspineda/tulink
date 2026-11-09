-- =========================================================
-- SCRIPT SQL PARA CONFIGURACIÓN DE SUPABASE (IDEMPOTENTE)
-- =========================================================

-- 1. Crear la tabla de Perfiles (profiles) si no existe
-- NOTA: el email se obtiene de auth.users, no se almacena aquí
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  bio text,
  avatar_url text,
  background_type text default 'solid' not null,
  background_color text default '#020617' not null,
  background_color_end text default '#020617' not null,
  background_url text,
  views integer default 0 not null,
  is_admin boolean default false not null,
  marketing_consent boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(username) >= 3)
);

-- Eliminar columna email si existe (migración desde schema anterior)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'
  ) then
    alter table public.profiles drop column email;
  end if;
end $$;

-- Habilitar Row Level Security (profiles)
alter table public.profiles enable row level security;

-- Eliminar políticas previas de profiles
drop policy if exists "Cualquiera puede ver perfiles públicos" on public.profiles;
drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.profiles;
drop policy if exists "Los usuarios pueden insertar su propio perfil" on public.profiles;
drop policy if exists "Los usuarios leen su perfil o un admin lee todos" on public.profiles;

-- Helper para comprobar si el usuario actual es admin. SECURITY DEFINER y
-- owned by postgres (bypassa RLS) para evitar recursión en las políticas.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Solo el dueño del perfil o un admin pueden leer la tabla base.
-- (is_admin / marketing_consent ya no quedan expuestos publicamente)
create policy "Los usuarios leen su perfil o un admin lee todos"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Vista pública con SOLO columnas seguras para las páginas de perfil.
-- Corre con privilegios del owner (bypassa RLS) pero expone pocas columnas.
create or replace view public.public_profiles as
select
  id,
  username,
  full_name,
  bio,
  avatar_url,
  background_type,
  background_color,
  background_color_end,
  background_url,
  views,
  created_at
from public.profiles;

revoke all on public.public_profiles from public;
grant select on public.public_profiles to anon, authenticated;

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id and is_admin = false);

-- Protección anti-escalada de privilegios: un usuario normal NO puede
-- cambiar su propia columna is_admin ni inflar manualmente sus vistas.
create or replace function public.protect_profile_admin_flag()
returns trigger as $$
begin
  if auth.uid() is not null then
    if new.is_admin is distinct from old.is_admin
       and not exists (
         select 1 from public.profiles
         where id = auth.uid() and is_admin = true
       ) then
      new.is_admin := old.is_admin;
    end if;

    if new.views is distinct from old.views
       and coalesce(current_setting('tulink.allow_views_update', true), '') <> 'on'
       and not exists (
         select 1 from public.profiles
         where id = auth.uid() and is_admin = true
       ) then
      new.views := old.views;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_profile_admin_flag on public.profiles;
create trigger protect_profile_admin_flag
  before update on public.profiles
  for each row execute procedure public.protect_profile_admin_flag();


-- 2. Crear la tabla de Enlaces (links)
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  embed_type text default 'link' not null,
  active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (links)
alter table public.links enable row level security;

-- Eliminar políticas previas de links
drop policy if exists "Cualquiera puede ver los enlaces activos" on public.links;
drop policy if exists "Los usuarios pueden crear sus propios enlaces" on public.links;
drop policy if exists "Los usuarios pueden actualizar sus propios enlaces" on public.links;
drop policy if exists "Los usuarios pueden eliminar sus propios enlaces" on public.links;

create policy "Cualquiera puede ver enlaces activos, dueño ve todos"
  on public.links for select
  using (active = true or auth.uid() = user_id);

create policy "Los usuarios pueden crear sus propios enlaces"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios enlaces"
  on public.links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios enlaces"
  on public.links for delete
  using (auth.uid() = user_id);


-- 3. Bucket de Avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Los avatares son públicos y visibles por cualquiera" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden subir fotos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden actualizar sus fotos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden borrar sus fotos" on storage.objects;

create policy "Los avatares son públicos y visibles por cualquiera"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Los usuarios autenticados pueden subir fotos"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden actualizar sus fotos"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden borrar sus fotos"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);


-- 4. Bucket de Fondos de Perfil
insert into storage.buckets (id, name, public)
values ('backgrounds', 'backgrounds', true)
on conflict (id) do nothing;

drop policy if exists "Los fondos son públicos y visibles por cualquiera" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden subir fondos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden actualizar sus fondos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden borrar sus fondos" on storage.objects;

create policy "Los fondos son públicos y visibles por cualquiera"
  on storage.objects for select
  using (bucket_id = 'backgrounds');

create policy "Los usuarios autenticados pueden subir fondos"
  on storage.objects for insert
  with check (bucket_id = 'backgrounds' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden actualizar sus fondos"
  on storage.objects for update
  using (bucket_id = 'backgrounds' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'backgrounds' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden borrar sus fondos"
  on storage.objects for delete
  using (bucket_id = 'backgrounds' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);


-- 5. Trigger para crear automáticamente el perfil del usuario al registrarse
--    El username se sanea en servidor: aunque alguien llame a auth.signUp
--    directamente con metadata arbitraria, el formato se normaliza.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
  clean_username text;
  fallback_username text;
begin
  raw_username := lower(coalesce(new.raw_user_meta_data->>'username', ''));
  clean_username := regexp_replace(raw_username, '[^a-z0-9_]', '', 'g');

  fallback_username := 'u_' || substr(md5(random()::text), 1, 10);

  if char_length(clean_username) < 3 then
    clean_username := fallback_username;
  else
    clean_username := left(clean_username, 24);
  end if;

  insert into public.profiles (id, username, full_name, avatar_url, background_type, background_color, background_color_end, marketing_consent)
  values (
    new.id,
    clean_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'solid',
    '#020617',
    '#020617',
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
  )
  on conflict (id) do nothing;

  return new;
exception
  when unique_violation then
    -- El username ya está tomado: usar uno aleatorio para no romper el signup.
    insert into public.profiles (id, username, full_name, avatar_url, background_type, background_color, background_color_end, marketing_consent)
    values (
      new.id,
      fallback_username,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      'solid',
      '#020617',
      '#020617',
      coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
    )
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 6. Función para incrementar vistas de perfiles
--    Solo cuenta 1 visita por llamada; el flag de sesión permite al trigger
--    de protección aceptar este incremento aunque lo invoque un visitante.
create or replace function public.increment_profile_views(profile_id uuid)
returns void as $$
begin
  perform set_config('tulink.allow_views_update', 'on', true);

  update public.profiles
  set views = views + 1
  where id = profile_id;

  perform set_config('tulink.allow_views_update', 'off', true);
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.increment_profile_views(uuid) from public;
revoke all on function public.increment_profile_views(uuid) from anon;
revoke all on function public.increment_profile_views(uuid) from authenticated;
grant execute on function public.increment_profile_views(uuid) to anon, authenticated;


-- 7. Índices para rendimiento
create index if not exists idx_links_user_id on public.links(user_id);
create index if not exists idx_links_user_active_sort on public.links(user_id, active, sort_order);
create index if not exists idx_profiles_created_at on public.profiles(created_at);


-- 8. Función para actualizar sort_order de enlaces en batch (evita N+1)
create or replace function public.batch_update_link_order(updates jsonb)
returns void as $$
declare
  rec jsonb;
begin
  for rec in select * from jsonb_array_elements(updates) loop
    update public.links
    set sort_order = (rec->>'sort_order')::integer
    where id = (rec->>'id')::uuid
      and user_id = auth.uid();
  end loop;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function public.batch_update_link_order(jsonb) from public;
revoke all on function public.batch_update_link_order(jsonb) from anon;
grant execute on function public.batch_update_link_order(jsonb) to authenticated;


-- 9. Función para que un ADMIN elimine un perfil (y su usuario de auth)
--    Solo un usuario con is_admin = true puede ejecutarla.
--    Cada paso va protegido: si uno falla (p. ej. permisos sobre auth.users
--    o storage.objects) el resto sigue ejecutándose y se devuelve el detalle
--    del fallo para poder mostrarlo en la UI.
drop function if exists public.admin_delete_profile(uuid);

create or replace function public.admin_delete_profile(target_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_errors text[] := array[]::text[];
begin
  if auth.uid() is null
     or not exists (
       select 1 from public.profiles
       where id = auth.uid() and is_admin = true
     ) then
    raise exception 'No autorizado' using errcode = '42501';
  end if;

  if target_id = auth.uid() then
    raise exception 'Un administrador no puede eliminar su propio perfil';
  end if;

  -- 1) Limpieza de almacenamiento (avatares y fondos del usuario).
  --    Best-effort: si el rol no puede tocar storage.objects se ignora.
  begin
    delete from storage.objects
    where bucket_id in ('avatars', 'backgrounds')
      and (storage.foldername(name))[1] = target_id::text;
  exception when others then
    v_errors := v_errors || ('storage: ' || sqlerrm);
  end;

  -- 2) Borrar el perfil y sus enlaces (FK ON DELETE CASCADE).
  --    Se hace ANTES de borrar el usuario de auth: el borrado en cascada de
  --    auth.users dispara un DELETE sobre profiles que choca con las
  --    políticas RLS (no hay policy de DELETE y la cascada no es SECURITY
  --    DEFINER). Como owner de la tabla, esta sesión sí puede borrarla.
  begin
    delete from public.links where user_id = target_id;
  exception when others then
    v_errors := v_errors || ('links: ' || sqlerrm);
  end;

  begin
    delete from public.profiles where id = target_id;
  exception when others then
    v_errors := v_errors || ('profiles: ' || sqlerrm);
  end;

  -- 3) Borrar el usuario de auth. Ya no queda perfil, así que la cascada
  --    no tiene filas que eliminar y no choca con RLS.
  begin
    delete from auth.users where id = target_id;
  exception when others then
    v_errors := v_errors || ('auth.users: ' || sqlerrm);
  end;

  if array_length(v_errors, 1) > 0 then
    return 'Perfil eliminado parcialmente. Detalle: ' || array_to_string(v_errors, ' | ');
  end if;

  return 'ok';
end;
$$;

revoke all on function public.admin_delete_profile(uuid) from public;
revoke all on function public.admin_delete_profile(uuid) from anon;
grant execute on function public.admin_delete_profile(uuid) to authenticated;

-- Permisos para que la RPC pueda borrar usuarios de auth y objetos de storage.
-- Se ignoran los fallos: la función tiene plan B por paso.
do $$
begin
  execute 'grant delete on table auth.users to postgres';
exception when others then
  raise notice 'No se pudo otorgar DELETE sobre auth.users: %', sqlerrm;
end $$;

do $$
begin
  execute 'grant delete on table storage.objects to postgres';
exception when others then
  raise notice 'No se pudo otorgar DELETE sobre storage.objects: %', sqlerrm;
end $$;
