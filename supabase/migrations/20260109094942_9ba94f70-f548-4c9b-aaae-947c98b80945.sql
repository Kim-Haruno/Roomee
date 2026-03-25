
-- Add occupancy columns to listings
ALTER TABLE public.listings 
ADD COLUMN max_occupants integer NOT NULL DEFAULT 1,
ADD COLUMN current_occupants integer NOT NULL DEFAULT 0;

-- Create applications table
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  landlord_id uuid NOT NULL,
  
  -- Student details
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  age integer NOT NULL,
  sex text NOT NULL,
  place_of_residence text NOT NULL,
  school text NOT NULL,
  about_me text,
  
  -- Application status
  status text NOT NULL DEFAULT 'pending',
  landlord_notes text,
  admin_notes text,
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Students can view their own applications"
ON public.applications FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can create applications"
ON public.applications FOR INSERT
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Landlords can view applications for their listings"
ON public.applications FOR SELECT
USING (landlord_id = auth.uid());

CREATE POLICY "Landlords can update applications for their listings"
ON public.applications FOR UPDATE
USING (landlord_id = auth.uid());

CREATE POLICY "Admins can view all applications"
ON public.applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all applications"
ON public.applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
