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

  // Load gallery photos on mobile
  useEffect(() => {
    if (isMobile) {
      // For mobile, we'll simulate loading photos from gallery
      // In a real app, you'd use a library like react-native-image-picker or similar
      loadGalleryPhotos();
    }
  }, [isMobile]);

  const loadGalleryPhotos = () => {
    // Simulate gallery photos - in real app, these would come from device gallery
    const mockPhotos = Array.from({ length: 20 }, (_, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create different colored squares to simulate different photos
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Photo ${i + 1}`, 150, 150);
      }
      
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `gallery-photo-${i + 1}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          }
        }, 'image/jpeg');
      });
    });

    Promise.all(mockPhotos).then(setGalleryPhotos);
  };

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
      handleFileSelect(files);
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
    fileInputRef.current?.click();
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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto w-full z-10 max-h-[60vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
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
                onClick={() => togglePhotoSelection(photo)}
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
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
