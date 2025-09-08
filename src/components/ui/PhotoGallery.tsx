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
    // For mobile, we'll create a more realistic gallery simulation
    // In a real app, you'd use libraries like react-native-image-picker or similar
    const mockPhotos = Array.from({ length: 24 }, (_, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create more realistic photo-like images
        const scenarios = [
          // Portrait photos
          () => {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 400, 400);
            // Face
            ctx.fillStyle = '#ffdbac';
            ctx.beginPath();
            ctx.arc(200, 150, 60, 0, 2 * Math.PI);
            ctx.fill();
            // Hair
            ctx.fillStyle = ['#8B4513', '#654321', '#2F1B14', '#D2691E'][i % 4];
            ctx.fillRect(140, 90, 120, 80);
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(180, 130, 8, 8);
            ctx.fillRect(212, 130, 8, 8);
            // Smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(200, 170, 20, 0, Math.PI);
            ctx.stroke();
          },
          // Landscape photos
          () => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.7, '#98FB98');
            gradient.addColorStop(1, '#90EE90');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 400);
            // Mountains
            ctx.fillStyle = '#8B7D6B';
            ctx.beginPath();
            ctx.moveTo(0, 300);
            ctx.lineTo(100, 200);
            ctx.lineTo(200, 250);
            ctx.lineTo(300, 180);
            ctx.lineTo(400, 220);
            ctx.lineTo(400, 400);
            ctx.closePath();
            ctx.fill();
            // Sun
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(320, 80, 30, 0, 2 * Math.PI);
            ctx.fill();
          },
          // Food photos
          () => {
            ctx.fillStyle = '#FFF8DC';
            ctx.fillRect(0, 0, 400, 400);
            // Plate
            ctx.fillStyle = '#F5F5DC';
            ctx.beginPath();
            ctx.arc(200, 200, 120, 0, 2 * Math.PI);
            ctx.fill();
            // Food items
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(150, 150, 100, 20);
            ctx.fillStyle = '#FF6347';
            ctx.fillRect(160, 170, 80, 15);
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(170, 185, 60, 10);
          },
          // Pet photos
          () => {
            ctx.fillStyle = '#E6E6FA';
            ctx.fillRect(0, 0, 400, 400);
            // Cat body
            ctx.fillStyle = ['#FFA500', '#808080', '#8B4513', '#000000'][i % 4];
            ctx.beginPath();
            ctx.arc(200, 200, 80, 0, 2 * Math.PI);
            ctx.fill();
            // Ears
            ctx.fillStyle = ['#FFA500', '#808080', '#8B4513', '#000000'][i % 4];
            ctx.beginPath();
            ctx.moveTo(180, 120);
            ctx.lineTo(200, 80);
            ctx.lineTo(220, 120);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(200, 80);
            ctx.lineTo(220, 120);
            ctx.lineTo(240, 120);
            ctx.closePath();
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(185, 180, 8, 8);
            ctx.fillRect(207, 180, 8, 8);
            // Nose
            ctx.fillStyle = '#FF69B4';
            ctx.beginPath();
            ctx.arc(196, 200, 4, 0, 2 * Math.PI);
            ctx.fill();
          },
          // City photos
          () => {
            ctx.fillStyle = '#191970';
            ctx.fillRect(0, 0, 400, 400);
            // Buildings
            for (let x = 0; x < 400; x += 40) {
              const height = 100 + Math.random() * 200;
              ctx.fillStyle = ['#2F4F4F', '#696969', '#A9A9A9', '#C0C0C0'][Math.floor(x / 40) % 4];
              ctx.fillRect(x, 400 - height, 35, height);
            }
            // Windows
            ctx.fillStyle = '#FFD700';
            for (let x = 10; x < 390; x += 40) {
              for (let y = 300; y < 380; y += 20) {
                if (Math.random() > 0.3) {
                  ctx.fillRect(x, y, 8, 12);
                }
              }
            }
          },
          // Nature photos
          () => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#228B22');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 400);
            // Trees
            for (let x = 50; x < 350; x += 60) {
              ctx.fillStyle = '#8B4513';
              ctx.fillRect(x, 250, 15, 150);
              ctx.fillStyle = '#228B22';
              ctx.beginPath();
              ctx.arc(x + 7, 250, 30, 0, 2 * Math.PI);
              ctx.fill();
            }
            // Flowers
            ctx.fillStyle = '#FF69B4';
            for (let x = 30; x < 370; x += 40) {
              ctx.beginPath();
              ctx.arc(x, 350, 8, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        ];
        
        // Use different scenarios for variety
        const scenario = scenarios[i % scenarios.length];
        scenario();
      }
      
      return new Promise<File>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}_${i + 1}.jpg`, { type: 'image/jpeg' });
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
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
      // Add real photos to gallery
      const realPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
      setGalleryPhotos(prev => [...prev, ...realPhotos]);
      setHasRealPhotos(true);
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

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasRealPhotos ? (
          // Show load photos button when no real photos
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Load Your Photos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Select photos from your device to add them to the gallery
              </p>
              <Button onClick={openFilePicker} size="lg">
                <ImageIcon size={20} className="mr-2" />
                Load Photos
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
            
            {/* Add more photos button */}
            <button
              onClick={openFilePicker}
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
