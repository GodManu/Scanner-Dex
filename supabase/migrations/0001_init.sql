-- 0001_init.sql
-- Esquema base: perfiles, uso diario, historial de escaneos, RLS y la función
-- atómica que hace cumplir el límite de 10 escaneos/día.

-- ───────────────────────────── Tablas ─────────────────────────────

create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  full_name          text,
  locale             text not null default 'es' check (locale in ('es', 'en')),
  is_premium         boolean not null default false,
  premium_expires_at timestamptz,
  created_at         timestamptz not null default now()
);

-- Una fila por usuario por día (contador). Reset lógico por fecha.
create table if not exists public.daily_usage (
  user_id    uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  scan_count int  not null default 0,
  primary key (user_id, usage_date)
);

-- Historial opcional (para "mis cartas" / auditoría).
create table if not exists public.scans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  card_id         text,
  recognized_name text,
  created_at      timestamptz not null default now()
);

-- ─────────────────── Crear profile al registrarse ───────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Evitar que un usuario se auto-marque premium desde el cliente ───
-- Solo el service_role (webhook de RevenueCat) puede tocar estas columnas.

create or replace function public.guard_premium_columns()
returns trigger language plpgsql as $$
begin
  if auth.role() is distinct from 'service_role' then
    new.is_premium := old.is_premium;
    new.premium_expires_at := old.premium_expires_at;
  end if;
  return new;
end $$;

drop trigger if exists guard_premium on public.profiles;
create trigger guard_premium
  before update on public.profiles
  for each row execute function public.guard_premium_columns();

-- ───────────────────────────── RLS ─────────────────────────────

alter table public.profiles    enable row level security;
alter table public.daily_usage enable row level security;
alter table public.scans       enable row level security;

-- Perfil: cada quien ve y edita el suyo (premium queda protegido por el trigger).
create policy "own profile select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id);

-- daily_usage: solo LECTURA del propio contador (para pintar "X/10").
-- La ESCRITURA ocurre únicamente dentro de consume_scan (security definer).
create policy "own usage select" on public.daily_usage
  for select using (auth.uid() = user_id);

-- scans: solo lectura del propio historial.
create policy "own scans select" on public.scans
  for select using (auth.uid() = user_id);

-- ──────────────── Función atómica de límite (núcleo) ────────────────
-- Devuelve JSON: { allowed, premium, remaining, limit }
--   remaining = -1  -> ilimitado (premium)
-- La zona horaria fija el momento del reset diario (BCS = America/Mazatlan).

create or replace function public.consume_scan()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_premium boolean;
  v_expires timestamptz;
  v_today   date := (now() at time zone 'America/Mazatlan')::date;
  v_count   int;
  v_limit   int := 10;
begin
  if v_user is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  select is_premium, premium_expires_at
    into v_premium, v_expires
    from public.profiles where id = v_user;

  -- Premium activo => ilimitado.
  if v_premium is true and (v_expires is null or v_expires > now()) then
    insert into public.scans(user_id) values (v_user);
    return jsonb_build_object('allowed', true, 'premium', true, 'remaining', -1);
  end if;

  -- Incremento ATÓMICO del contador del día (upsert + returning).
  insert into public.daily_usage (user_id, usage_date, scan_count)
  values (v_user, v_today, 1)
  on conflict (user_id, usage_date)
  do update set scan_count = public.daily_usage.scan_count + 1
  returning scan_count into v_count;

  -- Si se pasó del límite, se rechaza y se deja el contador topado en v_limit.
  if v_count > v_limit then
    update public.daily_usage set scan_count = v_limit
      where user_id = v_user and usage_date = v_today;
    return jsonb_build_object('allowed', false, 'premium', false,
                              'remaining', 0, 'limit', v_limit);
  end if;

  insert into public.scans(user_id) values (v_user);
  return jsonb_build_object('allowed', true, 'premium', false,
                            'remaining', v_limit - v_count, 'limit', v_limit);
end $$;

-- Solo usuarios autenticados pueden invocarla.
revoke all on function public.consume_scan() from public;
grant execute on function public.consume_scan() to authenticated;
