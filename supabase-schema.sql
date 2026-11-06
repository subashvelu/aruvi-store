-- Supabase table schema for Aruvi checkout and digital delivery
-- Run this in the Supabase SQL editor or via psql.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  product_id text,
  product_name text not null,
  product_slug text,
  product_format text,
  product_price numeric not null,
  payment_id text,
  payment_status text not null,
  delivery_type text,
  digital_link text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric not null,
  tag text,
  featured boolean not null default false,
  short_description text not null,
  description text not null,
  features text[] not null default '{}',
  gallery jsonb not null default '[]'::jsonb,
  shipping_label text,
  delivery_note text,
  is_digital_product boolean not null default false,
  digital_label text,
  digital_price numeric,
  digital_access_link text,
  enable_physical_version boolean not null default true,
  physical_label text,
  physical_price numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products
  add column if not exists gallery jsonb not null default '[]'::jsonb;
