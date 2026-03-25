import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Loader2, ImagePlus } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
}

export const MultiImageUpload = ({
  images,
  onImagesChange,
  maxImages = 10,
  minImages = 0,
}: MultiImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, deleteImage, uploading } = useImageUpload({ bucket: 'listings', maxSizeMB: 10 });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      const url = await uploadImage(file);
      if (url) {
        onImagesChange([...images, url]);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const imageUrl = images[index];
    await deleteImage(imageUrl);
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                Cover
              </span>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {images.length} of {maxImages} images
          {minImages > 0 && ` (minimum ${minImages} required)`}
        </span>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        )}
      </div>
    </div>
  );
};
