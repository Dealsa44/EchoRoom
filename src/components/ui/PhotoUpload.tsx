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
  X, 
  Shield, 
  AlertTriangle,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  GripVertical,
  Star,
  Check
} from 'lucide-react';
import PhotoCropper from './PhotoCropper';
import { Photo, photoStorage } from '@/lib/photoStorage';

interface PhotoUploadProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 6 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPhotoForVerification, setSelectedPhotoForVerification] = useState<Photo | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);
  const [dragOverPhoto, setDragOverPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real photo upload with validation and storage
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (photos.length >= maxPhotos) {
      return;
    }

    setIsUploading(true);

    try {
      const newPhotos: Photo[] = [];
      
      for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
        const file = files[i];
        
        // Validate file
        const validation = photoStorage.validateFile(file);
        if (!validation.valid) {
          continue;
        }

        // Create photo object with base64 conversion
        const isPrimary = photos.length === 0 && newPhotos.length === 0;
        const newPhoto = await photoStorage.createPhoto(file, isPrimary);
        newPhotos.push(newPhoto);
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
      }

    } finally {
      setIsUploading(false);
    }
  }, [photos, maxPhotos, onPhotosChange]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault(); // Prevent form submission
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault(); // Prevent form submission
    }
    
    // Use device camera if available, otherwise simulate
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          // Create canvas to capture frame
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Capture frame after a short delay
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
              
              // Stop camera stream
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

    // Passive listener error fix: do not call preventDefault on passive events.
    // Instead, rely on touch-action: none set on the card to stop scrolling.
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

  const handleVerificationRequest = (photo: Photo) => {
    setSelectedPhotoForVerification(photo);
    setShowVerificationModal(true);
  };

  const simulateVerification = async (photo: Photo) => {
    // Simulate verification process
    const updatedPhotos = photos.map(p => 
      p.id === photo.id 
        ? { ...p, verificationStatus: 'pending' as const }
        : p
    );
    
    onPhotosChange(updatedPhotos);
    
    // Simulate verification result after 3 seconds
    setTimeout(() => {
      const isApproved = Math.random() > 0.2; // 80% approval rate
      const finalPhotos = updatedPhotos.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              verificationStatus: isApproved ? 'approved' : 'rejected',
              isVerified: isApproved
            }
          : p
      );
      
      onPhotosChange(finalPhotos);
    }, 3000);
  };

  const getVerificationBadge = (photo: Photo) => {
    switch (photo.verificationStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 text-xs">✓ Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">⏳ Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 text-xs">✗ Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="grid grid-cols-2 gap-4">
                 <Button
           type="button"
           variant="outline"
           onClick={(e) => {
             e.preventDefault();
             fileInputRef.current?.click();
           }}
           disabled={isUploading || photos.length >= maxPhotos}
           className="h-24 flex flex-col items-center justify-center gap-2 border-dashed"
         >
           <Upload className="w-6 h-6" />
           <span className="text-sm">Upload Photos</span>
         </Button>
         
         <Button
           type="button"
           variant="outline"
           onClick={handleCameraCapture}
           disabled={isUploading || photos.length >= maxPhotos}
           className="h-24 flex flex-col items-center justify-center gap-2 border-dashed"
         >
           <Camera className="w-6 h-6" />
           <span className="text-sm">Take Photo</span>
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
         <div className="grid grid-cols-2 gap-4">
           {photos.map((photo, index) => (
             <Card 
               key={photo.id} 
               data-photo-id={photo.id}
               className={`relative overflow-hidden transition-all duration-200 ${
                 draggedPhoto?.id === photo.id && isTouchDragging ? 'z-50 shadow-2xl' : ''
               } ${
                 draggedPhoto?.id === photo.id && !isTouchDragging ? 'opacity-50 scale-95' : ''
               } ${
                 dragOverPhoto?.id === photo.id ? 'ring-2 ring-primary ring-opacity-50 scale-105' : ''
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
                   
                                       {/* Mobile-friendly action buttons - always visible */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleEditPhoto(photo)}
                        className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-lg border-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                   {/* Drag handle - The 6 dots indicate you can drag to reorder photos */}
                   <div className="absolute top-2 left-2">
                     <div className={`h-8 w-8 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-colors ${
                       isTouchDragging && draggedPhoto?.id === photo.id 
                         ? 'bg-blue-600' 
                         : 'bg-gray-800/80'
                     }`}>
                       <GripVertical className="w-4 h-4 text-white" />
                     </div>
                   </div>

                   {/* Badges */}
                   <div className="absolute bottom-2 left-2 flex flex-col gap-1">
                     {photo.isPrimary && (
                       <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs flex items-center gap-1">
                         <Star className="w-3 h-3" />
                         Primary
                       </Badge>
                     )}
                     {getVerificationBadge(photo)}
                   </div>

                   {/* Verification button */}
                                        {photo.verificationStatus === 'not_submitted' && (
                       <div className="absolute bottom-2 right-2">
                         <Button
                           type="button"
                           size="sm"
                           onClick={() => handleVerificationRequest(photo)}
                           className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white shadow-lg border-0"
                         >
                           <Shield className="w-4 h-4" />
                         </Button>
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

      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Photo Verification
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-3">
                Photo verification helps ensure your profile is authentic and increases your chances of getting matches.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>Clear, well-lit photo of your face</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>No filters or heavy editing</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>You should be the only person in the photo</span>
                </div>
              </div>
            </div>
            
            {selectedPhotoForVerification && (
              <div className="relative aspect-square">
                <img
                  src={selectedPhotoForVerification.url}
                  alt="Verification"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowVerificationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedPhotoForVerification) {
                    simulateVerification(selectedPhotoForVerification);
                    setShowVerificationModal(false);
                  }
                }}
                className="flex-1"
              >
                Submit for Verification
              </Button>
            </div>
          </div>
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

export default PhotoUpload;
