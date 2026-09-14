-- Fix: RLS helper functions must be executable by authenticated
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_company_admin() to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_company(text, text) from public, anon;
revoke execute on function public.join_company(text) from public, anon;
grant execute on function public.create_company(text, text) to authenticated;
grant execute on function public.join_company(text) to authenticated;
