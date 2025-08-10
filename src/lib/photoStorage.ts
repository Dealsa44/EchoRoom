export interface Photo {
  id: string;
  url: string;
  isVerified: boolean;
  isPrimary: boolean;
  uploadDate: Date;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  originalFile?: File; // For local storage reference
}

const PHOTOS_STORAGE_KEY = 'echoroom_user_photos';

export const photoStorage = {
  // Save photos to localStorage
  savePhotos: (userId: string, photos: Photo[]): { success: boolean; error?: string } => {
    try {
      const storageKey = `${PHOTOS_STORAGE_KEY}_${userId}`;
      const photosData = photos.map(photo => ({
        ...photo,
        uploadDate: photo.uploadDate.toISOString(),
        // Don't store File objects in localStorage
        originalFile: undefined
      }));
      
      const dataString = JSON.stringify(photosData);
      
      // Check approximate size (in characters, rough estimate)
      const sizeEstimate = dataString.length * 2; // Each character is roughly 2 bytes
      console.log(`Attempting to save ${photos.length} photos, estimated size: ${Math.round(sizeEstimate / 1024)} KB`);
      
      localStorage.setItem(storageKey, dataString);
      return { success: true };
    } catch (error) {
      console.error('Failed to save photos to localStorage:', error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return { 
          success: false, 
          error: 'Storage quota exceeded. Please try uploading fewer or smaller photos.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to save photos. Please try again.' 
      };
    }
  },

  // Load photos from localStorage
  loadPhotos: (userId: string): Photo[] => {
    try {
      const storageKey = `${PHOTOS_STORAGE_KEY}_${userId}`;
      const photosData = localStorage.getItem(storageKey);
      if (photosData) {
        const parsed = JSON.parse(photosData);
        return parsed.map((photo: any) => ({
          ...photo,
          uploadDate: new Date(photo.uploadDate)
        }));
      }
    } catch (error) {
      console.error('Failed to load photos from localStorage:', error);
    }
    return [];
  },

  // Clear photos for a user
  clearPhotos: (userId: string): void => {
    try {
      const storageKey = `${PHOTOS_STORAGE_KEY}_${userId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear photos from localStorage:', error);
    }
  },

  // Convert file to compressed base64 for storage
  fileToBase64: (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  // Create a new photo object
  createPhoto: (file: File, isPrimary: boolean = false): Promise<Photo> => {
    return photoStorage.fileToBase64(file).then(base64 => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: base64,
      isVerified: false,
      isPrimary,
      uploadDate: new Date(),
      verificationStatus: 'not_submitted',
      originalFile: file
    }));
  },

  // Validate file
  validateFile: (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'Please upload only image files.' };
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'Please upload images smaller than 5MB.' };
    }

    return { valid: true };
  },

  // Get current storage usage
  getStorageInfo: (): { used: number; available: number; percentage: number } => {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }
      
      // Rough estimate of localStorage limit (usually 5-10MB)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB in characters
      const available = Math.max(0, estimatedLimit - used);
      const percentage = (used / estimatedLimit) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    }
  },

  // Clear old photos to free up space
  clearOldPhotos: (keepCount: number = 10): number => {
    try {
      const photoKeys: string[] = [];
      for (let key in localStorage) {
        if (key.startsWith(PHOTOS_STORAGE_KEY)) {
          photoKeys.push(key);
        }
      }
      
      // Sort by key (which includes timestamp) and remove oldest
      photoKeys.sort();
      let cleared = 0;
      
      if (photoKeys.length > keepCount) {
        const toRemove = photoKeys.slice(0, photoKeys.length - keepCount);
        toRemove.forEach(key => {
          localStorage.removeItem(key);
          cleared++;
        });
      }
      
      return cleared;
    } catch (error) {
      console.error('Failed to clear old photos:', error);
      return 0;
    }
  }
};
