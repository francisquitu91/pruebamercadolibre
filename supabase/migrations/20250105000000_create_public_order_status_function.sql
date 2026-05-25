-- Create a public function to get order status (bypasses RLS)
create or replace function public.get_order_status(p_order_id uuid)
returns text as $$
declare
  v_status text;
begin
  select status into v_status
  from public.orders
  where id = p_order_id
  limit 1;
  
  return v_status;
end;
$$ language plpgsql security definer;

-- Grant execute permission to anon (public)
grant execute on function public.get_order_status(uuid) to anon, authenticated;
