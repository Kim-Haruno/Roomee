import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

interface AvatarUploadProps {
  currentUrl?: string | null;
  name?: string;
  onUpload: (url: string) => void;
}

export const AvatarUpload = ({ currentUrl, name, onUpload }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload({ bucket: 'avatars' });

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      onUpload(url);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">Click to upload a profile photo</p>
    </div>
  );
};
