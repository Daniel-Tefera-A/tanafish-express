-- TanaFish Express — Supabase / PostgreSQL schema
-- Run in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ───── Enums ─────
create type user_role      as enum ('INDIVIDUAL', 'HOTEL', 'DRIVER', 'SUPPLIER');
create type fish_type      as enum ('TILAPIA', 'CATFISH', 'PERCH');
create type order_type     as enum ('RAW', 'COOKED', 'BULK_B2B');
create type order_status   as enum ('PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED');
create type payment_provider as enum ('TELEBIRR', 'CBE_BIRR', 'CHAPA');
create type payment_status as enum ('PENDING', 'SUCCESS', 'FAILED');
create type vehicle_type   as enum ('BAJAJ', 'MOTORBIKE');

-- ───── users ─────
create table users (
  id          uuid primary key default gen_random_uuid(),
  auth_id     uuid unique,                       -- links to auth.users (Supabase Auth) if used
  email       text unique not null,
  full_name   text,
  role        user_role,                          -- null until onboarding completes
  phone       text,
  address     text,
  kebele      text,
  lat         double precision,
  lng         double precision,
  language    text not null default 'en' check (language in ('en','am')),
  created_at  timestamptz not null default now()
);

-- ───── hotels ─────
create table hotels (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  business_name   text not null,
  tin_number      text not null,
  contact_person  text,
  address_kebele  text not null,
  kitchen_capacity int,                            -- covers / hour
  rating          numeric(2,1) default 4.5,
  avg_prep_minutes int default 25,
  verified        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ───── drivers (extension of users) ─────
create table drivers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references users(id) on delete cascade,
  vehicle       vehicle_type not null,
  id_doc_url    text,                              -- Supabase Storage path
  verified      boolean not null default false,
  is_online     boolean not null default false
);

-- ───── products (raw catch & catalogue) ─────
create table products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  name_am        text,
  fish_type      fish_type not null,
  is_cooked      boolean not null default false,
  price_per_unit numeric(10,2) not null,           -- ETB per kg
  stock_kg       numeric(10,2) not null default 0,
  supplier_id    uuid references users(id)         -- Fishermen Hub
);

-- ───── hotel_dish_offers ─────
create table hotel_dish_offers (
  id            uuid primary key default gen_random_uuid(),
  hotel_id      uuid not null references hotels(id) on delete cascade,
  dish_name     text not null,                     -- Asa Gulash, Asa Lebleb, Asa Tibz, Dulet
  fish_type     fish_type not null default 'TILAPIA',
  cooking_price numeric(10,2) not null,            -- preparation fee ETB
  prep_minutes  int not null default 25,
  is_available  boolean not null default true,
  unique (hotel_id, dish_name, fish_type)
);

-- ───── orders ─────
create table orders (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references users(id),
  hotel_id         uuid references hotels(id),     -- cooking hotel (COOKED) or receiving hotel (BULK_B2B)
  driver_id        uuid references users(id),
  order_type       order_type not null,
  status           order_status not null default 'PENDING_PAYMENT',
  total_amount     numeric(10,2) not null,
  payment_method   payment_provider,
  delivery_address text not null,
  delivery_lat     double precision,
  delivery_lng     double precision,
  pickup_token     text,                           -- OTP shown by driver to supplier/hotel
  delivery_otp     text,                           -- OTP customer gives driver on delivery
  driver_payout    numeric(10,2),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id),
  dish_offer_id uuid references hotel_dish_offers(id),
  fish_type   fish_type not null,
  weight_kg   numeric(5,2) not null,
  preparation text check (preparation in ('WHOLE','GUTTED','FILLETED')),
  unit_price  numeric(10,2) not null
);

-- ───── payments ─────
create table payments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  provider        payment_provider not null,
  transaction_ref text unique,
  amount          numeric(10,2) not null,
  status          payment_status not null default 'PENDING',
  created_at      timestamptz not null default now()
);

-- ───── indexes ─────
create index on orders (customer_id);
create index on orders (hotel_id, status);
create index on orders (driver_id, status);
create index on hotel_dish_offers (hotel_id);

-- ───── updated_at trigger ─────
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
create trigger orders_touch before update on orders
  for each row execute function touch_updated_at();

-- ───── Realtime (Kitchen Display System) ─────
alter publication supabase_realtime add table orders;

-- ───── Row Level Security (sketch — tighten before production) ─────
alter table users enable row level security;
alter table hotels enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;
alter table hotel_dish_offers enable row level security;

create policy "own profile"     on users  for select using (auth_id = auth.uid());
create policy "own profile upd" on users  for update using (auth_id = auth.uid());
create policy "public dish offers" on hotel_dish_offers for select using (true);
create policy "hotel manages offers" on hotel_dish_offers for all using (
  hotel_id in (select h.id from hotels h join users u on u.id = h.user_id where u.auth_id = auth.uid())
);
create policy "customer sees own orders" on orders for select using (
  customer_id in (select id from users where auth_id = auth.uid())
);
create policy "hotel sees its orders" on orders for select using (
  hotel_id in (select h.id from hotels h join users u on u.id = h.user_id where u.auth_id = auth.uid())
);
create policy "driver sees assigned or open" on orders for select using (
  driver_id in (select id from users where auth_id = auth.uid())
  or (driver_id is null and status in ('PAID','READY_FOR_PICKUP'))
);

-- ───── Seed: sample catalogue ─────
insert into products (name, name_am, fish_type, price_per_unit, stock_kg) values
  ('Lake Tana Tilapia (Qurso)', 'ቁርሶ', 'TILAPIA', 320, 120),
  ('Catfish (Ambaza)',          'አምባዛ', 'CATFISH', 280, 60),
  ('Nile Perch',                'የናይል ፐርች', 'PERCH', 420, 40);
