-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create storage bucket for listings
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true);

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for listings bucket
CREATE POLICY "Listing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Landlords can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Landlords can update their listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Landlords can delete their listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);