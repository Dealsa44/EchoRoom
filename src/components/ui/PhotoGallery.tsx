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

  // Check if we have previously granted permission
  useEffect(() => {
    const hasPermission = localStorage.getItem('echoroom_photo_permission') === 'granted';
    if (hasPermission) {
      setPermissionGranted(true);
      loadPhotosFromStorage();
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
      } else if ('showOpenFilePicker' in window) {
        // Fallback for browsers with limited File System Access API
        const fileHandles = await window.showOpenFilePicker({
          multiple: true,
          types: [{
            description: 'Images',
            accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
          }]
        });
        
        const files = await Promise.all(fileHandles.map(handle => handle.getFile()));
        await loadPhotosFromFiles(files);
        setPermissionGranted(true);
        localStorage.setItem('echoroom_photo_permission', 'granted');
      } else {
        // Fallback to traditional file picker
        openFilePicker();
      }
    } catch (error) {
      console.error('Failed to access photos:', error);
      // Fallback to traditional file picker
      openFilePicker();
    } finally {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <ChevronLeft size={20} />
            </Button>
            <h3 className="text-lg font-semibold">Photo Library</h3>
            {permissionGranted && galleryPhotos.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearGallery}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedPhotos.size}/{maxPhotos}
            </span>
            <Button
              onClick={handleSend}
              disabled={selectedPhotos.size === 0}
              size="sm"
              className="px-4"
            >
              <Send size={16} className="mr-2" />
              Send {selectedPhotos.size}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!permissionGranted ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h4 className="text-lg font-medium mb-2">Access Your Photos</h4>
              <p className="text-gray-600 mb-4">
                Allow EchoRoom to access your photo library to select and share photos easily.
              </p>
              <Button
                onClick={requestPhotoAccess}
                disabled={isLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  'Grant Access'
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Search and Sort Controls */}
              {galleryPhotos.length > 0 && (
                <div className="p-4 border-b border-gray-200 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search photos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="p-4 flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Loading photos...</p>
                  </div>
                ) : filteredPhotos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">
                        {galleryPhotos.length === 0 ? 'No Photos Found' : 'No Photos Match Your Search'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {galleryPhotos.length === 0 
                          ? 'Try selecting a different folder or use the file picker'
                          : 'Try adjusting your search terms'
                        }
                      </p>
                      <Button onClick={requestPhotoAccess} size="lg">
                        <ImageIcon size={20} className="mr-2" />
                        {galleryPhotos.length === 0 ? 'Select Photos' : 'Refresh'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredPhotos.map((photo) => {
                      const isSelected = selectedPhotos.has(photo.id);
                      return (
                        <div
                          key={photo.id}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all",
                            isSelected ? "ring-2 ring-blue-500" : "hover:opacity-80"
                          )}
                          onClick={() => togglePhotoSelection(photo.id)}
                        >
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
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
                )}
              </div>
            </>
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
    </div>
  );
};

export default PhotoGallery;
