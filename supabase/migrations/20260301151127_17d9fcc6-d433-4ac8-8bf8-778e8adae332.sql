
CREATE POLICY "Admins can delete roommate profiles"
ON public.roommate_profiles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
