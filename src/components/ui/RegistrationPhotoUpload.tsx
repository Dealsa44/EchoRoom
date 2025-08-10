import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Upload, 
  Camera, 
  Edit, 
  Trash2, 
  GripVertical,
  Star,
  TrendingUp,
  Heart,
  Sparkles
} from 'lucide-react';
import PhotoCropper from './PhotoCropper';
import { Photo, photoStorage } from '@/lib/photoStorage';

interface RegistrationPhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

const RegistrationPhotoUpload: React.FC<RegistrationPhotoUploadProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const [dragOverPhoto, setDragOverPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const [recentlyAddedPhoto, setRecentlyAddedPhoto] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate matching percentage based on number of photos
  const getMatchingPercentage = (photoCount: number) => {
    const basePercentage = 35; // Base percentage with no photos
    const maxBonus = 45; // Maximum bonus for photos
    const bonus = Math.min(photoCount * 7.5, maxBonus); // 7.5% per photo, max 45%
    return Math.min(basePercentage + bonus, 80); // Cap at 80%
  };

  const currentMatchingPercentage = getMatchingPercentage(photos.length);
  const nextPhotoPercentage = getMatchingPercentage(photos.length + 1);

  // Real photo upload with validation and storage
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (photos.length >= maxPhotos) {
      return;
    }

    // Check storage before uploading
    const storageInfo = photoStorage.getStorageInfo();
    if (storageInfo.percentage > 85) {
      setStorageWarning('Storage is nearly full. Consider uploading fewer or smaller photos.');
      
      // Try to clear old photos
      const cleared = photoStorage.clearOldPhotos(5);
      if (cleared > 0) {
        console.log(`Cleared ${cleared} old photo entries to free up space`);
        setStorageWarning('Cleared some old data to make space. Please try again.');
        setTimeout(() => setStorageWarning(null), 3000);
        return;
      }
    }

    setIsUploading(true);
    setStorageWarning(null);

    try {
      const newPhotos: Photo[] = [];
      
      for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
        const file = files[i];
        
        // Validate file
        const validation = photoStorage.validateFile(file);
        if (!validation.valid) {
          setStorageWarning(validation.error || 'Invalid file');
          continue;
        }

        try {
          // Create photo object with base64 conversion (no verification for registration)
          const isPrimary = photos.length === 0 && newPhotos.length === 0;
          const newPhoto = await photoStorage.createPhoto(file, isPrimary);
          // Remove verification status for registration
          newPhoto.verificationStatus = 'not_submitted';
          newPhoto.isVerified = false;
          newPhotos.push(newPhoto);

          // Set animation for the most recent photo
          if (i === 0) {
            setRecentlyAddedPhoto(newPhoto.id);
            setTimeout(() => setRecentlyAddedPhoto(null), 2000);
          }
        } catch (error) {
          console.error('Failed to process photo:', error);
          setStorageWarning('Failed to process photo. Please try a smaller image.');
        }
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
      }

    } finally {
      setIsUploading(false);
      // Clear warning after 5 seconds
      if (storageWarning) {
        setTimeout(() => setStorageWarning(null), 5000);
      }
    }
  }, [photos, maxPhotos, onPhotosChange, storageWarning]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            setTimeout(() => {
              if (ctx) {
                ctx.drawImage(video, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) {
                    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                    const files = { 0: file, length: 1 } as FileList;
                    handleFileUpload(files);
                  }
                }, 'image/jpeg');
              }
              
              stream.getTracks().forEach(track => track.stop());
            }, 1000);
          });
        })
        .catch(() => {
          simulateCameraCapture();
        });
    } else {
      simulateCameraCapture();
    }
  };

  const simulateCameraCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#666';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Camera Photo', 200, 200);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          const files = { 0: file, length: 1 } as FileList;
          handleFileUpload(files);
        }
      }, 'image/jpeg');
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      setPhotoToDelete(photo);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeletePhoto = () => {
    if (!photoToDelete) return;
    
    const updatedPhotos = photos.filter(photo => photo.id !== photoToDelete.id);
    
    if (photoToDelete.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }
    
    onPhotosChange(updatedPhotos);
    setShowDeleteConfirm(false);
    setPhotoToDelete(null);
  };

  const handleDragStart = (e: React.DragEvent, photo: Photo) => {
    setDraggedPhoto(photo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, photo: Photo) => {
    e.preventDefault();
    if (draggedPhoto && draggedPhoto.id !== photo.id) {
      setDragOverPhoto(photo);
    }
  };

  const handleDragLeave = () => {
    setDragOverPhoto(null);
  };

  const handleDrop = (e: React.DragEvent, targetPhoto: Photo) => {
    e.preventDefault();
    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) {
      setDraggedPhoto(null);
      setDragOverPhoto(null);
      return;
    }

    reorderPhotos(draggedPhoto, targetPhoto);
  };

  const reorderPhotos = (sourcePhoto: Photo, targetPhoto: Photo) => {
    const draggedIndex = photos.findIndex(p => p.id === sourcePhoto.id);
    const targetIndex = photos.findIndex(p => p.id === targetPhoto.id);
    
    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(targetIndex, 0, removed);
    
    newPhotos.forEach((photo, index) => {
      photo.isPrimary = index === 0;
    });
    
    onPhotosChange(newPhotos);
    setDraggedPhoto(null);
    setDragOverPhoto(null);
    setIsTouchDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent, photo: Photo) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setDraggedPhoto(photo);

    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      setIsTouchDragging(true);
    }, 150);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !draggedPhoto) return;

    if (!isTouchDragging) setIsTouchDragging(true);

    const touch = e.touches[0];
    setTouchOffset({
      x: touch.clientX - touchStart.x,
      y: touch.clientY - touchStart.y
    });

    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const photoCard = elementBelow?.closest('[data-photo-id]') as HTMLElement | null;
    if (photoCard) {
      const photoId = photoCard.getAttribute('data-photo-id');
      const photo = photos.find(p => p.id === photoId);
      if (photo && photo.id !== draggedPhoto.id) {
        setDragOverPhoto(photo);
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);

    if (isTouchDragging && dragOverPhoto && draggedPhoto && dragOverPhoto.id !== draggedPhoto.id) {
      reorderPhotos(draggedPhoto, dragOverPhoto);
    }

    setTouchStart(null);
    setDraggedPhoto(null);
    setIsTouchDragging(false);
    setTouchOffset({ x: 0, y: 0 });
    setDragOverPhoto(null);
  };

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo);
  };

  const handleSaveEditedPhoto = (editedImageUrl: string) => {
    if (editingPhoto) {
      const updatedPhotos = photos.map(photo => 
        photo.id === editingPhoto.id 
          ? { ...photo, url: editedImageUrl }
          : photo
      );
      onPhotosChange(updatedPhotos);
      setEditingPhoto(null);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Storage Warning */}
      {storageWarning && (
        <Card className="bg-orange-50 border-orange-200 w-full">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="text-sm text-orange-800">
                {storageWarning}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Percentage Display */}
      {photos.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 overflow-hidden relative w-full">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-blue-100/30 animate-pulse" />
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">
                    {currentMatchingPercentage}% Match Potential
                  </div>
                  <div className="text-sm text-green-600">
                    Great! Your profile is looking attractive
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
            </div>
            
            {photos.length < maxPhotos && (
              <div className="mt-3 p-3 bg-white/60 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 font-medium mb-1">
                  Add another photo to reach {nextPhotoPercentage}%!
                </div>
                <div className="text-xs text-green-600">
                  Each photo increases your chances of meaningful connections
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          disabled={isUploading || photos.length >= maxPhotos}
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 border-dashed border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/5 text-xs sm:text-sm"
        >
          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="font-medium">Upload Photos</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraCapture}
          disabled={isUploading || photos.length >= maxPhotos}
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 border-dashed border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/5 text-xs sm:text-sm"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span className="font-medium">Take Photo</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
          {photos.map((photo, index) => (
            <Card 
              key={photo.id} 
              data-photo-id={photo.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                draggedPhoto?.id === photo.id && isTouchDragging ? 'z-50 shadow-2xl' : ''
              } ${
                draggedPhoto?.id === photo.id && !isTouchDragging ? 'opacity-50 scale-95' : ''
              } ${
                dragOverPhoto?.id === photo.id ? 'ring-2 ring-primary ring-opacity-50 scale-105' : ''
              } ${
                recentlyAddedPhoto === photo.id ? 'ring-2 ring-green-400 shadow-lg animate-pulse' : ''
              }`}
              style={{
                touchAction: 'none',
                ...(draggedPhoto?.id === photo.id && isTouchDragging
                  ? {
                      transform: `translate(${touchOffset.x}px, ${touchOffset.y}px)`,
                      zIndex: 1000 as const,
                      pointerEvents: 'none' as const
                    }
                  : {})
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, photo)}
              onDragOver={(e) => handleDragOver(e, photo)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, photo)}
              onTouchStart={(e) => handleTouchStart(e, photo)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/400/400?random=' + index;
                    }}
                  />
                  
                  {/* Action buttons - always visible on mobile */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleEditPhoto(photo)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-0"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg border-0"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  {/* Drag handle */}
                  <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                    <div className={`h-7 w-7 sm:h-8 sm:w-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-colors ${
                      isTouchDragging && draggedPhoto?.id === photo.id 
                        ? 'bg-blue-600' 
                        : 'bg-gray-800/80'
                    }`}>
                      <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  </div>

                  {/* Primary photo badge */}
                  {photo.isPrimary && (
                    <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Primary
                      </Badge>
                    </div>
                  )}

                  {/* New photo animation */}
                  {recentlyAddedPhoto === photo.id && (
                    <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                        +{nextPhotoPercentage - currentMatchingPercentage}% Match!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo count and instructions */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          {photos.length} of {maxPhotos} photos uploaded
        </div>
        {photos.length === 0 && (
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-1">
              📸 Add photos to boost your match potential!
            </div>
            <div className="text-xs text-blue-600">
              Members with photos get 5x more matches than those without
            </div>
          </div>
        )}
        {photos.length > 1 && (
          <div className="text-xs text-muted-foreground text-center">
            💡 Touch and hold the 6-dot handle, then drag to reorder photos. First photo becomes primary.
          </div>
        )}
      </div>

      {/* Photo Editing Modal */}
      <Dialog open={!!editingPhoto} onOpenChange={() => setEditingPhoto(null)}>
        <DialogContent className="max-w-sm w-[92vw] max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-3 pb-1">
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>
              Adjust your photo to make it perfect for your profile
            </DialogDescription>
          </DialogHeader>
          {editingPhoto && (
            <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
              <PhotoCropper
                imageUrl={editingPhoto.url}
                onSave={handleSaveEditedPhoto}
                onCancel={() => setEditingPhoto(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {photoToDelete && (
              <div className="flex justify-center">
                <img
                  src={photoToDelete.url}
                  alt="Photo to delete"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPhotoToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeletePhoto}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationPhotoUpload;
