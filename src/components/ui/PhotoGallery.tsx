import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Check, Image as ImageIcon, ChevronLeft, Search, Calendar, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoItem {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  date: Date;
}

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
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoItem[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if we have previously granted permission and auto-load photos
  useEffect(() => {
    const hasPermission = localStorage.getItem('echoroom_photo_permission') === 'granted';
    if (hasPermission) {
      setPermissionGranted(true);
      loadPhotosFromStorage();
    } else {
      // Auto-request permission when component mounts
      requestPhotoAccess();
    }
  }, []);

  // Load photos from localStorage if available
  const loadPhotosFromStorage = () => {
    const savedPhotos = localStorage.getItem('echoroom_gallery_photos');
    if (savedPhotos) {
      try {
        const photoData = JSON.parse(savedPhotos);
        const photos = photoData.map((data: any, index: number) => ({
          id: `photo-${index}`,
          file: new File([], data.name, { type: data.type }),
          url: data.url,
          name: data.name,
          size: data.size,
          date: new Date(data.date)
        }));
        setGalleryPhotos(photos);
      } catch (error) {
        console.error('Error loading saved photos:', error);
      }
    }
  };


  // Request photo library access
  const requestPhotoAccess = async () => {
    setIsLoading(true);
    try {
      if ('showDirectoryPicker' in window) {
        // Modern browsers with File System Access API
        const dirHandle = await window.showDirectoryPicker({
          mode: 'read',
          types: [{
            description: 'Photos',
            accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
          }]
        });
        
        await loadPhotosFromDirectory(dirHandle);
        setPermissionGranted(true);
        localStorage.setItem('echoroom_photo_permission', 'granted');
      } else {
        // For browsers without File System Access API, use traditional file picker
        // but allow selecting multiple files to simulate "all photos"
        openFilePicker();
      }
    } catch (error) {
      console.error('Failed to access photos:', error);
      // If user cancels or error occurs, show empty state
      setIsLoading(false);
    }
  };

  // Load photos from directory using File System Access API
  const loadPhotosFromDirectory = async (dirHandle: FileSystemDirectoryHandle) => {
    const photoList: PhotoItem[] = [];
    
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file' && handle.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        try {
          const file = await handle.getFile();
          photoList.push({
            id: `photo-${photoList.length}`,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            date: new Date(file.lastModified)
          });
        } catch (error) {
          console.error(`Failed to load ${name}:`, error);
        }
      }
    }
    
    // Sort by date (newest first)
    photoList.sort((a, b) => b.date.getTime() - a.date.getTime());
    setGalleryPhotos(photoList);
    savePhotosToStorage(photoList);
  };

  // Load photos from files
  const loadPhotosFromFiles = async (files: File[]) => {
    const photoList: PhotoItem[] = files.map((file, index) => ({
      id: `photo-${index}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      date: new Date(file.lastModified)
    }));
    
    // Sort by date (newest first)
    photoList.sort((a, b) => b.date.getTime() - a.date.getTime());
    setGalleryPhotos(photoList);
    savePhotosToStorage(photoList);
  };

  // Save photos to localStorage
  const savePhotosToStorage = (photos: PhotoItem[]) => {
    const photoData = photos.map(photo => ({
      name: photo.name,
      type: photo.file.type,
      url: photo.url,
      size: photo.size,
      date: photo.date.toISOString()
    }));
    localStorage.setItem('echoroom_gallery_photos', JSON.stringify(photoData));
  };

  // Handle photo selection
  const togglePhotoSelection = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else if (newSelection.size < maxPhotos) {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  // Send selected photos
  const handleSend = () => {
    const selectedFiles = galleryPhotos
      .filter(photo => selectedPhotos.has(photo.id))
      .map(photo => photo.file);
    
    if (selectedFiles.length > 0) {
      onSendPhotos(selectedFiles);
      setSelectedPhotos(new Set());
    }
  };

  // Traditional file picker fallback
  const openFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files);
        await loadPhotosFromFiles(files);
        setPermissionGranted(true);
        localStorage.setItem('echoroom_photo_permission', 'granted');
        setIsLoading(false);
      } else {
        // User cancelled, stop loading
        setIsLoading(false);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // Filter and sort photos
  const filteredPhotos = galleryPhotos
    .filter(photo => 
      photo.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

  // Clear gallery
  const clearGallery = () => {
    setGalleryPhotos([]);
    setSelectedPhotos(new Set());
    setPermissionGranted(false);
    localStorage.removeItem('echoroom_gallery_photos');
    localStorage.removeItem('echoroom_photo_permission');
  };

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
          {permissionGranted && galleryPhotos.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearGallery}
              className="p-2 text-muted-foreground hover:text-destructive"
            >
              <X size={16} />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedPhotos.size}/{maxPhotos}
          </span>
          <Button
            onClick={handleSend}
            disabled={selectedPhotos.size === 0}
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
        {isLoading ? (
          // Show loading state
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading photos...</p>
          </div>
        ) : !permissionGranted || filteredPhotos.length === 0 ? (
          // Show empty state when no photos or permission not granted
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <ImageIcon size={32} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">
                {!permissionGranted ? 'Access Your Photos' : 
                 galleryPhotos.length === 0 ? 'No Photos Found' : 'No Photos Match Your Search'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {!permissionGranted ? 'Please allow access to your photo library to continue' :
                 galleryPhotos.length === 0 ? 'Try selecting a different folder or use the file picker' : 
                 'Try adjusting your search terms'}
              </p>
              <Button onClick={requestPhotoAccess} size="lg">
                <ImageIcon size={20} className="mr-2" />
                {!permissionGranted ? 'Grant Access' : 
                 galleryPhotos.length === 0 ? 'Select Photos' : 'Refresh'}
              </Button>
            </div>
          </div>
        ) : (
          // Show gallery grid with search and sort controls
          <div className="space-y-4">
            {/* Search and Sort Controls */}
            {galleryPhotos.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search photos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                    className="flex-1"
                  >
                    <Calendar size={14} className="mr-1" />
                    Date
                  </Button>
                  <Button
                    variant={sortBy === 'name' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('name')}
                    className="flex-1"
                  >
                    <Folder size={14} className="mr-1" />
                    Name
                  </Button>
                  <Button
                    variant={sortBy === 'size' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('size')}
                    className="flex-1"
                  >
                    Size
                  </Button>
                </div>
              </div>
            )}

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-2">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedPhotos.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all",
                      isSelected ? "ring-2 ring-primary" : "hover:opacity-80"
                    )}
                    onClick={() => togglePhotoSelection(photo.id)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check size={14} className="text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    
                    {/* Photo info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs opacity-0 hover:opacity-100 transition-opacity">
                      <div className="truncate">{photo.name}</div>
                      <div className="text-xs opacity-75">
                        {(photo.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for fallback */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default PhotoGallery;
