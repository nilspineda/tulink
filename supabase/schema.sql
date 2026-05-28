-- =========================================================
-- SCRIPT SQL PARA CONFIGURACIÓN DE SUPABASE (IDEMPOTENTE)
-- =========================================================

-- 1. Crear la tabla de Perfiles (profiles) si no existe
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  email text,
  bio text,
  avatar_url text,
  theme_color text default 'default' not null,
  views integer default 0 not null,
  is_admin boolean default false not null,
  marketing_consent boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(username) >= 3)
);

-- Habilitar Row Level Security (RLS) en profiles
alter table public.profiles enable row level security;

-- Eliminar políticas previas de profiles si existen (evita errores al re-ejecutar)
drop policy if exists "Cualquiera puede ver perfiles públicos" on public.profiles;
drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.profiles;
drop policy if exists "Los usuarios pueden insertar su propio perfil" on public.profiles;

-- Crear políticas de seguridad para profiles
create policy "Cualquiera puede ver perfiles públicos"
  on public.profiles for select
  using (true);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. Crear la tabla de Enlaces (links) si no existe
create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  url text not null,
  active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS) en links
alter table public.links enable row level security;

-- Eliminar políticas previas de links si existen
drop policy if exists "Cualquiera puede ver los enlaces activos" on public.links;
drop policy if exists "Los usuarios pueden crear sus propios enlaces" on public.links;
drop policy if exists "Los usuarios pueden actualizar sus propios enlaces" on public.links;
drop policy if exists "Los usuarios pueden eliminar sus propios enlaces" on public.links;

-- Crear políticas de seguridad para links
create policy "Cualquiera puede ver los enlaces activos"
  on public.links for select
  using (true);

create policy "Los usuarios pueden crear sus propios enlaces"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios enlaces"
  on public.links for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios enlaces"
  on public.links for delete
  using (auth.uid() = user_id);


-- 3. Crear Bucket de Almacenamiento para Avatares si no existe
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Eliminar políticas previas del Storage si existen
drop policy if exists "Los avatares son públicos y visibles por cualquiera" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden subir fotos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden actualizar sus fotos" on storage.objects;
drop policy if exists "Los usuarios autenticados pueden borrar sus fotos" on storage.objects;

-- Crear políticas de seguridad para Storage (bucket avatars)
create policy "Los avatares son públicos y visibles por cualquiera"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Los usuarios autenticados pueden subir fotos"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden actualizar sus fotos"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Los usuarios autenticados pueden borrar sus fotos"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text);


-- 4. Trigger para crear automáticamente el perfil del usuario al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, email, avatar_url, theme_color, marketing_consent)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1) || '_' || substr(md5(random()::text), 1, 5)
    ),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'default',
    coalesce((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Crear el disparador en auth.users (si no existe, se elimina y crea)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 5. Función para incrementar vistas de perfiles (RPC)
create or replace function public.increment_profile_views(profile_id uuid)
returns void as $$
begin
  update public.profiles
  set views = views + 1
  where id = profile_id;
end;
$$ language plpgsql security definer;
