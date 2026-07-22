-- 0002_price_cache.sql
-- Caché de precios. Es lo que hace viable el free tier:
-- sin esto, 100 escaneos agotan la cuota diaria del proveedor.
-- Con esto, 1000 usuarios escaneando las mismas 50 cartas = 50 llamadas.

create table if not exists public.card_prices (
  cache_key  text primary key,       -- "proveedor:nombre:numero"
  payload    jsonb not null,         -- el objeto de precios ya normalizado
  fetched_at timestamptz not null default now()
);

create index if not exists card_prices_fetched_idx
  on public.card_prices (fetched_at);

-- RLS activo y SIN políticas para el cliente: nadie lee/escribe desde la app.
-- Solo el edge function (service_role) la toca, y service_role ignora RLS.
alter table public.card_prices enable row level security;

-- Limpieza opcional de entradas viejas (corre manualmente o con pg_cron).
create or replace function public.purge_old_prices()
returns void language sql as $$
  delete from public.card_prices where fetched_at < now() - interval '30 days';
$$;
