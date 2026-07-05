-- ============================================================
-- Dompet Gacor — Schema awal
-- Jalankan di Supabase SQL Editor atau via `supabase db push`
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- profiles : data publik user (1:1 dengan auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text unique,
  username    text unique,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- wallets : satu dompet per user
-- ------------------------------------------------------------
create table if not exists public.wallets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  balance     numeric(14,2) not null default 0 check (balance >= 0),
  currency    text not null default 'IDR',
  pin_hash    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- transactions : ledger semua pergerakan saldo
-- type: topup | transfer_in | transfer_out | payment | refund
-- ------------------------------------------------------------
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  wallet_id     uuid not null references public.wallets(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('topup','transfer_in','transfer_out','payment','refund')),
  amount        numeric(14,2) not null check (amount > 0),
  status        text not null default 'success' check (status in ('pending','success','failed')),
  counterparty  uuid references auth.users(id),
  note          text,
  reference     text not null default ('TRX' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_tx_user_created on public.transactions(user_id, created_at desc);
create index if not exists idx_tx_wallet on public.transactions(wallet_id);

-- ------------------------------------------------------------
-- Trigger: buat profile + wallet otomatis saat user register
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data->>'phone')
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- updated_at helper
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_wallets_touch on public.wallets;
create trigger trg_wallets_touch before update on public.wallets
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles     enable row level security;
alter table public.wallets      enable row level security;
alter table public.transactions enable row level security;

-- profiles: bisa dibaca semua user terautentikasi (untuk cari penerima),
-- tapi hanya pemilik yang bisa update
drop policy if exists "profiles_select_auth" on public.profiles;
create policy "profiles_select_auth" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- wallets: hanya pemilik
drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own" on public.wallets
  for select to authenticated using (auth.uid() = user_id);

-- transactions: hanya pemilik yang lihat transaksinya
drop policy if exists "tx_select_own" on public.transactions;
create policy "tx_select_own" on public.transactions
  for select to authenticated using (auth.uid() = user_id);

-- Catatan: INSERT/UPDATE saldo TIDAK diizinkan langsung dari client.
-- Semua mutasi saldo lewat RPC SECURITY DEFINER (lihat 0002_functions.sql)
-- atau lewat backend dengan service_role key.
