import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  Move, 
  Check, 
  X,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Palette,
  Sun,
  Contrast as ContrastIcon
} from 'lucide-react';

interface PhotoCropperProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

const PhotoCropper: React.FC<PhotoCropperProps> = ({ imageUrl, onSave, onCancel }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 300, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sourceImageUrl, setSourceImageUrl] = useState(imageUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep local source image in sync with prop
  useEffect(() => {
    setSourceImageUrl(imageUrl);
  }, [imageUrl]);

  // Auto-place crop box when entering crop mode to keep handles visible
  useEffect(() => {
    if (cropMode) {
      const margin = 24;
      setCropArea({ x: margin, y: margin, width: 400 - margin * 2, height: 400 - margin * 2 });
    }
  }, [cropMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (canvas && ctx && img) {
      canvas.width = 400;
      canvas.height = 400;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const effectiveRotation = cropMode ? 0 : rotation;
      const effectiveZoom = cropMode ? 1 : zoom;
      ctx.rotate((effectiveRotation * Math.PI) / 180);
      ctx.scale(effectiveZoom, effectiveZoom);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Draw image centered
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
      
      ctx.drawImage(
        img,
        -imgWidth * scale / 2,
        -imgHeight * scale / 2,
        imgWidth * scale,
        imgHeight * scale
      );

      ctx.restore();
    }
  }, [rotation, zoom, brightness, contrast, cropMode, sourceImageUrl]);

  const handleSave = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = canvasRef.current;
    if (canvas) {
      const editedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(editedImageUrl);
    }

    setIsProcessing(false);
  };

  const resetAdjustments = () => {
    setRotation(0);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setCropArea({ x: 50, y: 50, width: 300, height: 300 });
    setCropMode(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropMode) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check for resize handles first
    const handleSize = 20;
    const handles = {
      // Corner handles
      'top-left': { x: cropArea.x, y: cropArea.y },
      'top-right': { x: cropArea.x + cropArea.width, y: cropArea.y },
      'bottom-left': { x: cropArea.x, y: cropArea.y + cropArea.height },
      'bottom-right': { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height },
      // Edge handles
      'top': { x: cropArea.x + cropArea.width / 2, y: cropArea.y },
      'bottom': { x: cropArea.x + cropArea.width / 2, y: cropArea.y + cropArea.height },
      'left': { x: cropArea.x, y: cropArea.y + cropArea.height / 2 },
      'right': { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height / 2 }
    };
    
    for (const [handle, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) <= handleSize && Math.abs(y - pos.y) <= handleSize) {
        setResizeHandle(handle);
        setIsDragging(true);
        setDragStart({ x, y });
        return;
      }
    }
    
    // Check if click is within crop area for dragging
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cropMode || !isDragging) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (resizeHandle) {
      // Resize crop area
      const minSize = 50;
      setCropArea(prev => {
        let newArea = { ...prev };
        
        switch (resizeHandle) {
          // Corner handles
          case 'top-left':
            newArea.x = Math.min(x, prev.x + prev.width - minSize);
            newArea.y = Math.min(y, prev.y + prev.height - minSize);
            newArea.width = Math.max(minSize, prev.x + prev.width - newArea.x);
            newArea.height = Math.max(minSize, prev.y + prev.height - newArea.y);
            break;
          case 'top-right':
            newArea.y = Math.min(y, prev.y + prev.height - minSize);
            newArea.width = Math.max(minSize, x - prev.x);
            newArea.height = Math.max(minSize, prev.y + prev.height - newArea.y);
            break;
          case 'bottom-left':
            newArea.x = Math.min(x, prev.x + prev.width - minSize);
            newArea.width = Math.max(minSize, prev.x + prev.width - newArea.x);
            newArea.height = Math.max(minSize, y - prev.y);
            break;
          case 'bottom-right':
            newArea.width = Math.max(minSize, x - prev.x);
            newArea.height = Math.max(minSize, y - prev.y);
            break;
          // Edge handles - only resize in one direction
          case 'top':
            newArea.y = Math.min(y, prev.y + prev.height - minSize);
            newArea.height = Math.max(minSize, prev.y + prev.height - newArea.y);
            break;
          case 'bottom':
            newArea.height = Math.max(minSize, y - prev.y);
            break;
          case 'left':
            newArea.x = Math.min(x, prev.x + prev.width - minSize);
            newArea.width = Math.max(minSize, prev.x + prev.width - newArea.x);
            break;
          case 'right':
            newArea.width = Math.max(minSize, x - prev.x);
            break;
        }
        
        // Keep within bounds
        newArea.x = Math.max(0, Math.min(400 - newArea.width, newArea.x));
        newArea.y = Math.max(0, Math.min(400 - newArea.height, newArea.y));
        
        return newArea;
      });
    } else {
      // Move crop area
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(400 - prev.width, x - dragStart.x)),
        y: Math.max(0, Math.min(400 - prev.height, y - dragStart.y))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeHandle(null);
  };

  return (
    <div className="space-y-4">

             {/* Canvas Preview */}
       <div className="flex justify-center">
         <div 
           ref={containerRef}
           className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden max-w-full"
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
           onTouchStart={(e) => {
             const touch = e.touches[0];
             const mouseEvent = new MouseEvent('mousedown', {
               clientX: touch.clientX,
               clientY: touch.clientY
             });
             handleMouseDown(mouseEvent as any);
           }}
           onTouchMove={(e) => {
             e.preventDefault();
             const touch = e.touches[0];
             const mouseEvent = new MouseEvent('mousemove', {
               clientX: touch.clientX,
               clientY: touch.clientY
             });
             handleMouseMove(mouseEvent as any);
           }}
           onTouchEnd={handleMouseUp}
         >
           <canvas
             ref={canvasRef}
             className="w-full max-w-xs h-auto aspect-square object-cover"
           />
           
           {/* Crop Overlay */}
           {cropMode && (
             <div 
               className="absolute inset-0 pointer-events-none"
               style={{
                 background: 'rgba(0, 0, 0, 0.5)',
                 clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${cropArea.x}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y + cropArea.height}px, ${cropArea.x + cropArea.width}px ${cropArea.y}px, ${cropArea.x}px ${cropArea.y}px)`
               }}
             />
           )}
           
           {/* Crop Frame */}
           {cropMode && (
             <div
               className="absolute border-2 border-white shadow-lg"
               style={{
                 left: cropArea.x,
                 top: cropArea.y,
                 width: cropArea.width,
                 height: cropArea.height
               }}
             >
               {/* Corner handles - larger for mobile */}
               <div className="absolute -top-2 -left-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-nw-resize" />
               <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-ne-resize" />
               <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-sw-resize" />
               <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-blue-500 cursor-se-resize" />
               
               {/* Edge handles for resizing */}
               <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full border border-blue-500 cursor-w-resize transform -translate-y-1/2" />
               <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full border border-blue-500 cursor-e-resize transform -translate-y-1/2" />
               <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white rounded-full border border-blue-500 cursor-n-resize transform -translate-x-1/2" />
               <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-white rounded-full border border-blue-500 cursor-s-resize transform -translate-x-1/2" />
             </div>
           )}
           
           <img
             ref={imageRef}
             src={sourceImageUrl}
             alt="Original"
             className="hidden"
             onLoad={() => {
               // Trigger redraw when image loads
               const canvas = canvasRef.current;
               const ctx = canvas?.getContext('2d');
               const img = imageRef.current;
               if (canvas && ctx && img) {
                 canvas.width = 400;
                 canvas.height = 400;
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 ctx.save();
                 ctx.translate(canvas.width / 2, canvas.height / 2);
                 ctx.rotate((rotation * Math.PI) / 180);
                 ctx.scale(zoom, zoom);
                 ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                 
                 const imgWidth = img.naturalWidth;
                 const imgHeight = img.naturalHeight;
                 const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
                 
                 ctx.drawImage(
                   img,
                   -imgWidth * scale / 2,
                   -imgHeight * scale / 2,
                   imgWidth * scale,
                   imgHeight * scale
                 );
                 ctx.restore();
               }
             }}
           />
         </div>
       </div>

             {/* Controls */}
       <div className="space-y-3">
         {/* Crop Mode Toggle */}
         <div className="flex items-center justify-between gap-2">
           <div className="flex items-center gap-2">
             <input
               type="checkbox"
               checked={cropMode}
               onChange={(e) => setCropMode(e.target.checked)}
               className="rounded"
             />
             <span className="text-sm font-medium">Crop Mode</span>
           </div>
           {cropMode && (
             <Button
               type="button"
               size="sm"
               onClick={() => {
                 const baseCanvas = canvasRef.current;
                 const img = imageRef.current;
                 if (!baseCanvas || !img) return;

                 // Create a cropped image from the original image using cropArea
                 const croppedCanvas = document.createElement('canvas');
                 croppedCanvas.width = cropArea.width;
                 croppedCanvas.height = cropArea.height;
                 const ctx = croppedCanvas.getContext('2d');
                 if (!ctx) return;

                 // Draw the original image centered on a 400x400 view, then extract crop
                 const tempCanvas = document.createElement('canvas');
                 tempCanvas.width = 400;
                 tempCanvas.height = 400;
                 const tctx = tempCanvas.getContext('2d');
                 if (!tctx) return;

                 tctx.save();
                 tctx.translate(200, 200);
                 tctx.rotate((rotation * Math.PI) / 180);
                 tctx.scale(zoom, zoom);
                 tctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
                 const imgWidth = img.naturalWidth;
                 const imgHeight = img.naturalHeight;
                 const scale = Math.min(400 / imgWidth, 400 / imgHeight);
                 tctx.drawImage(
                   img,
                   -imgWidth * scale / 2,
                   -imgHeight * scale / 2,
                   imgWidth * scale,
                   imgHeight * scale
                 );
                 tctx.restore();

                 const imageData = tctx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
                 ctx.putImageData(imageData, 0, 0);

                 // Update the working image to the cropped version immediately
                 const newUrl = croppedCanvas.toDataURL('image/jpeg', 0.9);
                 setSourceImageUrl(newUrl);
                 setCropMode(false);
               }}
             >
               Apply
             </Button>
           )}
         </div>

         {/* Basic Adjustments - Collapsible */}
         <div className="border rounded-lg">
           <button
             type="button"
             onClick={() => setShowAdvanced(!showAdvanced)}
             className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
           >
             <div className="flex items-center gap-2">
               <Palette className="w-4 h-4" />
               <span className="text-sm font-medium">Adjustments</span>
             </div>
             {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
           </button>
           {/* Fixed-height scroll region to avoid layout height changes */}
           <div className={`${showAdvanced ? 'max-h-56' : 'max-h-0'} overflow-hidden overflow-y-auto transition-[max-height] duration-200 ease-in-out`}> 
             <div className="px-3 pb-3 space-y-3">
               {/* Rotation */}
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <RotateCw className="w-3 h-3" />
                   <span className="text-xs font-medium">Rotation</span>
                   <span className="text-xs text-muted-foreground ml-auto">{rotation}°</span>
                 </div>
                 <Slider
                   value={[rotation]}
                   onValueChange={(value) => setRotation(value[0])}
                   min={-180}
                   max={180}
                   step={1}
                   className="w-full h-1.5"
                 />
               </div>

               {/* Zoom */}
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <ZoomIn className="w-3 h-3" />
                   <span className="text-xs font-medium">Zoom</span>
                   <span className="text-xs text-muted-foreground ml-auto">{Math.round(zoom * 100)}%</span>
                 </div>
                 <Slider
                   value={[zoom]}
                   onValueChange={(value) => setZoom(value[0])}
                   min={0.5}
                   max={2}
                   step={0.1}
                   className="w-full h-1.5"
                 />
               </div>

               {/* Brightness */}
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Sun className="w-3 h-3" />
                   <span className="text-xs font-medium">Brightness</span>
                   <span className="text-xs text-muted-foreground ml-auto">{brightness}%</span>
                 </div>
                 <Slider
                   value={[brightness]}
                   onValueChange={(value) => setBrightness(value[0])}
                   min={50}
                   max={150}
                   step={1}
                   className="w-full h-1.5"
                 />
               </div>

               {/* Contrast */}
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <ContrastIcon className="w-3 h-3" />
                   <span className="text-xs font-medium">Contrast</span>
                   <span className="text-xs text-muted-foreground ml-auto">{contrast}%</span>
                 </div>
                 <Slider
                   value={[contrast]}
                   onValueChange={(value) => setContrast(value[0])}
                   min={50}
                   max={150}
                   step={1}
                   className="w-full h-1.5"
                 />
               </div>
             </div>
           </div>
         </div>
      </div>

             {/* Action Buttons */}
       <div className="flex flex-col gap-2 pt-2 border-t">
         <Button
           variant="outline"
           onClick={resetAdjustments}
           className="w-full h-9 text-sm"
         >
           Reset
         </Button>
         <div className="flex gap-2">
           <Button
             variant="outline"
             onClick={onCancel}
             className="flex-1 h-9 text-sm"
           >
             Cancel
           </Button>
           <Button
             onClick={handleSave}
             disabled={isProcessing}
             className="flex-1 h-9 text-sm"
           >
             {isProcessing ? (
               <>
                 <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                 Processing...
               </>
             ) : (
               <>
                 <Check className="w-3 h-3 mr-2" />
                 Save
               </>
             )}
           </Button>
         </div>
       </div>
    </div>
  );
};

export default PhotoCropper;
