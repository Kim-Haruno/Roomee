-- Create roommate profiles table for preferences
CREATE TABLE public.roommate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_city TEXT,
  move_in_date DATE,
  smoking TEXT CHECK (smoking IN ('no', 'yes', 'outside_only', 'no_preference')),
  pets TEXT CHECK (pets IN ('no_pets', 'has_pets', 'pets_welcome', 'no_preference')),
  noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'social', 'no_preference')),
  cleanliness TEXT CHECK (cleanliness IN ('very_tidy', 'tidy', 'relaxed', 'no_preference')),
  sleep_schedule TEXT CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible', 'no_preference')),
  guests TEXT CHECK (guests IN ('rarely', 'sometimes', 'often', 'no_preference')),
  interests TEXT[] DEFAULT '{}',
  age_range_min INTEGER,
  age_range_max INTEGER,
  gender_preference TEXT CHECK (gender_preference IN ('male', 'female', 'any')),
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roommate_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for roommate_profiles
CREATE POLICY "Users can view visible roommate profiles"
ON public.roommate_profiles FOR SELECT
USING (is_visible = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own roommate profile"
ON public.roommate_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roommate profile"
ON public.roommate_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roommate profile"
ON public.roommate_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_roommate_profiles_updated_at
BEFORE UPDATE ON public.roommate_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();