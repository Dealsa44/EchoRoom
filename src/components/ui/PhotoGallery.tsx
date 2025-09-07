import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  onClose: () => void;
  onSendPhotos: (photos: File[]) => void;
  maxPhotos?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  onClose, 
  onSendPhotos, 
  maxPhotos = 10 
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    // Limit to maxPhotos
    const filesToAdd = validFiles.slice(0, maxPhotos - selectedPhotos.length);
    
    if (filesToAdd.length === 0) return;

    const newSelectedPhotos = [...selectedPhotos, ...filesToAdd];
    setSelectedPhotos(newSelectedPhotos);

    // Create preview URLs
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedPhotos, maxPhotos]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removePhoto = (index: number) => {
    const newSelectedPhotos = selectedPhotos.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedPhotos(newSelectedPhotos);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSend = () => {
    if (selectedPhotos.length > 0) {
      onSendPhotos(selectedPhotos);
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedPhotos([]);
      setPreviewUrls([]);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
          <h2 className="text-lg font-semibold">Select Photos</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedPhotos.length}/{maxPhotos}
          </span>
          <Button
            onClick={handleSend}
            disabled={selectedPhotos.length === 0}
            size="sm"
            className="px-4"
          >
            <Send size={16} className="mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-hidden">
        {selectedPhotos.length === 0 ? (
          // Empty state - show file picker
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ImageIcon size={32} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">No photos selected</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Tap below to select up to {maxPhotos} photos from your gallery
                </p>
                <Button onClick={openFilePicker} size="lg">
                  <ImageIcon size={20} className="mr-2" />
                  Choose Photos
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Selected photos grid
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  <img
                    src={url}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </Button>

                  {/* Selection indicator */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                </div>
              ))}

              {/* Add more button */}
              {selectedPhotos.length < maxPhotos && (
                <button
                  onClick={openFilePicker}
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-muted-foreground/50 transition-colors"
                >
                  <ImageIcon size={24} className="text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Add More</span>
                </button>
              )}
            </div>

            {/* Selected count and actions */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
              </p>
              <Button
                onClick={openFilePicker}
                variant="outline"
                size="sm"
                disabled={selectedPhotos.length >= maxPhotos}
              >
                <ImageIcon size={16} className="mr-2" />
                Add More
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotoGallery;
