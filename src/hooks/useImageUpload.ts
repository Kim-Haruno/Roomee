import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  bucket: 'avatars' | 'listings';
  maxSizeMB?: number;
}

export const useImageUpload = ({ bucket, maxSizeMB = 5 }: UseImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: 'Error',
          description: `File size must be less than ${maxSizeMB}MB`,
          variant: 'destructive',
        });
        return null;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to upload images',
          variant: 'destructive',
        });
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [bucket, maxSizeMB, toast]);

  const uploadMultipleImages = useCallback(async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    return urls;
  }, [uploadImage]);

  const deleteImage = useCallback(async (url: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Extract file path from URL
      const urlParts = url.split(`/${bucket}/`);
      if (urlParts.length < 2) return false;
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return false;
    }
  }, [bucket]);

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploading,
  };
};
