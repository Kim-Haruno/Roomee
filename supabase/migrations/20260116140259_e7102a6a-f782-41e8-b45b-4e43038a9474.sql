-- Enable RLS on profiles_public view by creating it as a secure view
-- First drop and recreate the view with proper security
DROP VIEW IF EXISTS public.profiles_public;

-- Create a secure view with security_invoker to inherit the caller's permissions
-- This view will respect the underlying table's RLS policies
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  role,
  university,
  stay_duration,
  application_status,
  created_at,
  updated_at
FROM public.profiles;

-- Grant select to authenticated users only (not anon)
REVOKE ALL ON public.profiles_public FROM anon;
GRANT SELECT ON public.profiles_public TO authenticated;