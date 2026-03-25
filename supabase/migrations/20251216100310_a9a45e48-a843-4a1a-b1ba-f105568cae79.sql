-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add application_status to profiles
ALTER TABLE public.profiles 
ADD COLUMN application_status TEXT NOT NULL DEFAULT 'pending' 
CHECK (application_status IN ('pending', 'approved', 'rejected', 'more_info_needed'));

ALTER TABLE public.profiles 
ADD COLUMN admin_notes TEXT;

-- Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'shared')),
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  available_from DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info_needed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for listings
CREATE POLICY "Anyone can view approved listings"
ON public.listings FOR SELECT
USING (status = 'approved' OR landlord_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Landlords can create listings"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own listings"
ON public.listings FOR UPDATE
USING (landlord_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete listings"
ON public.listings FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add update trigger for listings
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create policy for admins to update profiles
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));