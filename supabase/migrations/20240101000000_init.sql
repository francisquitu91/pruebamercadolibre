-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  total decimal(10, 2) not null check (total >= 0),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  mercadopago_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price decimal(10, 2) not null check (price > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_mercadopago_id on public.orders(mercadopago_payment_id);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_product_id on public.order_items(product_id);
create index idx_products_created_at on public.products(created_at);

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- RLS Policies for products (public read)
create policy "Products are viewable by everyone" on public.products
  for select
  using (true);

-- RLS Policies for orders (users can only see their own)
create policy "Users can view their own orders" on public.orders
  for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their own orders" on public.orders
  for insert
  with check (auth.uid() = user_id or user_id is null);

-- RLS Policies for order_items (through orders)
create policy "Users can view items from their orders" on public.order_items
  for select
  using (order_id in (select id from orders where auth.uid() = user_id or user_id is null));
