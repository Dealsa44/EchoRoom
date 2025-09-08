import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Check, Image as ImageIcon, ChevronLeft } from 'lucide-react';
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
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hasRealPhotos, setHasRealPhotos] = useState(false);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-request gallery access when component mounts on mobile
  useEffect(() => {
    if (isMobile) {
      // Automatically trigger file picker to request gallery access
      setTimeout(() => {
        openFilePicker();
      }, 100);
    }
  }, [isMobile]);


  const handleFileSelect = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    // Limit to maxPhotos
    const filesToAdd = validFiles.slice(0, maxPhotos - selectedPhotos.length);
    
    if (filesToAdd.length === 0) return;

    setSelectedPhotos(prev => [...prev, ...filesToAdd]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedPhotos, maxPhotos]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsLoadingPhotos(true);
      // Add real photos to gallery
      const realPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
      setGalleryPhotos(prev => [...prev, ...realPhotos]);
      setHasRealPhotos(true);
      handleFileSelect(files);
      setIsLoadingPhotos(false);
    }
  };

  const togglePhotoSelection = (photo: File) => {
    const isSelected = selectedPhotos.some(p => p === photo);
    
    if (isSelected) {
      setSelectedPhotos(prev => prev.filter(p => p !== photo));
    } else if (selectedPhotos.length < maxPhotos) {
      setSelectedPhotos(prev => [...prev, photo]);
    }
  };

  const handleSend = () => {
    if (selectedPhotos.length > 0) {
      onSendPhotos(selectedPhotos);
      setSelectedPhotos([]);
    }
  };

  const openFilePicker = () => {
    // Create a new file input to ensure it triggers properly
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFileInputChange({ target } as React.ChangeEvent<HTMLInputElement>);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // For PC, show file picker interface
  if (!isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-md mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Photos</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select up to {maxPhotos} photos from your computer
            </p>
            <Button onClick={openFilePicker} size="lg">
              <ImageIcon size={20} className="mr-2" />
              Choose Photos
            </Button>
          </div>
          
          {selectedPhotos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  onClick={handleSend}
                  size="sm"
                  className="px-4"
                >
                  <Send size={16} className="mr-2" />
                  Send
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Selected photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 p-0"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
  }

  // For mobile, show gallery interface
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto w-full z-10 max-h-[60vh] flex flex-col"
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <ChevronLeft size={20} />
          </Button>
          <h3 className="text-lg font-semibold">Gallery</h3>
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

      {/* Gallery Content - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {isLoadingPhotos ? (
          // Show loading state
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading photos...</p>
          </div>
        ) : !hasRealPhotos ? (
          // Show empty state when no photos
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Photos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Select photos from your device to add them to the gallery
              </p>
              <Button onClick={openFilePicker} size="lg">
                <ImageIcon size={20} className="mr-2" />
                Select Photos
              </Button>
            </div>
          </div>
        ) : (
          // Show gallery grid
          <div className="grid grid-cols-3 gap-2">
            {galleryPhotos.map((photo, index) => {
              const isSelected = selectedPhotos.includes(photo);
              return (
                <div
                  key={index}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all",
                    isSelected ? "ring-2 ring-primary" : "hover:opacity-80"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhotoSelection(photo);
                  }}
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Gallery photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Add more photos button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center hover:border-muted-foreground/50 transition-colors"
            >
              <ImageIcon size={24} className="text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add More</span>
            </button>
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
