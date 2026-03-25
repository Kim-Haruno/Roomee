-- Create a public view for profiles that excludes sensitive fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
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
-- Excludes: email, phone, admin_notes (sensitive data)

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive SELECT policy - users can only view their own profile, admins can view all
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));