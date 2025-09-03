// import React, { useState, useRef, useEffect } from 'react';
// import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { cn } from '@/lib/utils';

// interface ImageData {
//   id: string;
//   url: string;
//   filename: string;
//   processedImageUrl?: string;
//   thumbnails?: string[];
//   ocr?: string;
//   objects?: Array<{
//     label: string;
//     confidence: number;
//     bbox?: [number, number, number, number];
//   }>;
// }

// interface ImageViewerProps {
//   image: ImageData;
//   onClose?: () => void;
//   className?: string;
//   showControls?: boolean;
// }

// export const ImageViewer: React.FC<ImageViewerProps> = ({
//   image,
//   onClose,
//   className,
//   showControls = true
// }) => {
//   const [zoom, setZoom] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [position, setPosition] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const imageRef = useRef<HTMLImageElement>(null);

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape' && isFullscreen) {
//         setIsFullscreen(false);
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [isFullscreen]);

//   const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
//   const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
//   const handleRotate = () => setRotation(prev => (prev + 90) % 360);
//   const handleReset = () => {
//     setZoom(1);
//     setRotation(0);
//     setPosition({ x: 0, y: 0 });
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (zoom > 1) {
//       setIsDragging(true);
//       setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
//     }
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (isDragging && zoom > 1) {
//       setPosition({
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       });
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleDownload = () => {
//     const link = document.createElement('a');
//     link.href = image.processedImageUrl || image.url;
//     link.download = image.filename;
//     link.click();
//   };

//   const imageUrl = image.processedImageUrl || image.url;

//   const fullscreenOverlay = isFullscreen && (
//     <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
//       <div className="relative max-w-full max-h-full">
//         <Button
//           onClick={() => setIsFullscreen(false)}
//           variant="ghost"
//           size="sm"
//           className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
//         >
//           <X className="w-4 h-4" />
//         </Button>
//         <img
//           src={imageUrl}
//           alt={image.filename}
//           className="max-w-full max-h-full object-contain"
//         />
//       </div>
//     </div>
//   );

//   return (
//     <>
//       <div className={cn('flex flex-col h-full bg-card', className)} ref={containerRef}>
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div className="flex items-center gap-3">
//             <h3 className="font-semibold text-foreground truncate">{image.filename}</h3>
//             {image.objects && image.objects.length > 0 && (
//               <Badge variant="secondary" className="text-xs">
//                 {image.objects.length} objects detected
//               </Badge>
//             )}
//           </div>

//           {showControls && (
//             <div className="flex items-center gap-1">
//               <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.25}>
//                 <ZoomOut className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
//                 <ZoomIn className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="sm" onClick={handleRotate}>
//                 <RotateCw className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)}>
//                 <Maximize2 className="w-4 h-4" />
//               </Button>
//               <Button variant="ghost" size="sm" onClick={handleDownload}>
//                 <Download className="w-4 h-4" />
//               </Button>
//               {onClose && (
//                 <Button variant="ghost" size="sm" onClick={onClose}>
//                   <X className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Image Container */}
//         <div 
//           className="flex-1 overflow-hidden relative bg-muted cursor-grab active:cursor-grabbing"
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//         >
//                     <div className="absolute inset-0 flex items-center justify-center">
//             <img
//               ref={imageRef}
//               src={imageUrl}
//               alt={image.filename}
//               className="max-w-full max-h-full object-contain transition-transform duration-200"
//               style={{
//                 transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
//                 cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
//               }}
//               onDoubleClick={handleReset}
//               onLoad={() => console.log('Image loaded successfully:', imageUrl)}
//               onError={(e) => {
//                 console.error('Image failed to load:', imageUrl, e);
//                 // You could set a fallback image here
//               }}
//             />
//           </div>

//           {/* Zoom Level Indicator */}
//           {zoom !== 1 && (
//             <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
//               {Math.round(zoom * 100)}%
//             </div>
//           )}
//         </div>

//         {/* Object Detection Results */}
//         {image.objects && image.objects.length > 0 && (
//           <div className="p-4 border-t">
//             <h4 className="text-sm font-medium text-foreground mb-2">Detected Objects</h4>
//             <div className="flex flex-wrap gap-2">
//               {image.objects.slice(0, 6).map((obj, index) => (
//                 <Badge key={index} variant="outline" className="text-xs">
//                   {obj.label} ({Math.round(obj.confidence * 100)}%)
//                 </Badge>
//               ))}
//               {image.objects.length > 6 && (
//                 <Badge variant="outline" className="text-xs">
//                   +{image.objects.length - 6} more
//                 </Badge>
//               )}
//             </div>
//           </div>
//         )}

//         {/* OCR Results */}
//         {image.ocr && (
//           <div className="p-4 border-t">
//             <h4 className="text-sm font-medium text-foreground mb-2">Extracted Text</h4>
//             <p className="text-xs text-muted-foreground line-clamp-3">{image.ocr}</p>
//           </div>
//         )}
//       </div>

//       {fullscreenOverlay}
//     </>
//   );
// };

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DetectedObject {
  label: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

interface ImageData {
  id: string;
  url: string;
  filename: string;
  processedImageUrl?: string;
  thumbnails?: string[];
  ocr?: string;
  objects?: DetectedObject[];
}

interface ImageViewerProps {
  image: ImageData;
  onClose?: () => void;
  className?: string;
  showControls?: boolean;
  showAnalysis?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  onClose,
  className,
  showControls = true,
  showAnalysis = true
}) => {
  // State management
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showObjects, setShowObjects] = useState(true);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Memoized values for performance
  const imageUrl = useMemo(() => {
    return image.processedImageUrl || image.url;
  }, [image.processedImageUrl, image.url]);

  const objectsArray = useMemo(() => {
    return Array.isArray(image.objects) ? image.objects : [];
  }, [image.objects]);

  const hasAnalysis = useMemo(() => {
    return (image.ocr && image.ocr.trim()) || objectsArray.length > 0;
  }, [image.ocr, objectsArray.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
            e.preventDefault();
          } else if (onClose) {
            onClose();
            e.preventDefault();
          }
          break;
        case '+':
        case '=':
          handleZoomIn();
          e.preventDefault();
          break;
        case '-':
          handleZoomOut();
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          handleRotate();
          e.preventDefault();
          break;
        case '0':
          handleReset();
          e.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  // Optimized event handlers with useCallback
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDownload = useCallback(() => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = image.filename;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [imageUrl, image.filename]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
    setImageError(true);
    console.warn('Image failed to load:', imageUrl);
  }, [imageUrl]);

  // Memoized transform style
  const imageTransform = useMemo(() => ({
    transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
    cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
  }), [zoom, rotation, position, isDragging]);

  // Memoized fullscreen overlay
  const fullscreenOverlay = useMemo(() => {
    if (!isFullscreen) return null;

    return (
      <div 
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setIsFullscreen(false)}
      >
        <div className="relative max-w-full max-h-full p-4" onClick={e => e.stopPropagation()}>
          <Button
            onClick={() => setIsFullscreen(false)}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            aria-label="Exit fullscreen"
          >
            <X className="w-4 h-4" />
          </Button>
          <img
            src={imageUrl}
            alt={image.filename}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={() => setIsFullscreen(false)}
          />
        </div>
      </div>
    );
  }, [isFullscreen, imageUrl, image.filename]);

  // Memoized object badges
  const objectBadges = useMemo(() => {
    if (!showObjects || objectsArray.length === 0) return null;

    const displayedObjects = objectsArray.slice(0, 6);
    const remainingCount = objectsArray.length - 6;

    return (
      <div className="flex flex-wrap gap-2">
        {displayedObjects.map((obj, index) => (
          <Badge 
            key={`${obj.label}-${index}`} 
            variant="outline" 
            className="text-xs px-2 py-1"
          >
            {obj.label} ({Math.round(obj.confidence * 100)}%)
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
  }, [objectsArray, showObjects]);

  return (
    <>
      <div 
        className={cn('flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden', className)}
        ref={containerRef}
        role="region"
        aria-label={`Image viewer for ${image.filename}`}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card/50">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate" title={image.filename}>
                {image.filename}
              </h3>
              {objectsArray.length > 0 && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {objectsArray.length} objects detected
                </Badge>
              )}
            </div>
            {hasAnalysis && showAnalysis && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowObjects(!showObjects)}
                className="shrink-0"
                aria-label={showObjects ? "Hide analysis" : "Show analysis"}
              >
                {showObjects ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {showControls && (
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZoomOut} 
                disabled={zoom <= 0.25}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleZoomIn} 
                disabled={zoom >= 3}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRotate}
                aria-label="Rotate image"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFullscreen(true)}
                aria-label="View fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownload}
                aria-label="Download image"
              >
                <Download className="w-4 h-4" />
              </Button>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  aria-label="Close viewer"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Image Container */}
        <div 
          className="flex-1 overflow-hidden relative bg-muted/50"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="img"
          aria-label={`Zoomable image: ${image.filename}`}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {imageError ? (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                  <X className="w-8 h-8" />
                </div>
                <p className="text-sm">Failed to load image</p>
                <p className="text-xs mt-1 opacity-70">{image.filename}</p>
              </div>
            ) : (
              <img
                ref={imageRef}
                src={imageUrl}
                alt={image.filename}
                className={cn(
                  "max-w-full max-h-full object-contain transition-transform duration-200 select-none",
                  !imageLoaded && "opacity-0"
                )}
                style={imageTransform}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onDoubleClick={handleReset}
                draggable={false}
              />
            )}

            {/* Loading indicator */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Zoom indicator */}
          {zoom !== 1 && imageLoaded && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
          )}

          {/* Reset hint */}
          {zoom !== 1 && imageLoaded && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs shadow-lg backdrop-blur-sm">
              Double-click to reset
            </div>
          )}
        </div>

        {/* Enhanced Analysis Section */}
        {showAnalysis && hasAnalysis && showObjects && (
          <div className="border-t bg-card/30">
            {/* Object Detection Results */}
            {objectsArray.length > 0 && (
              <div className="p-4 border-b border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Detected Objects
                </h4>
                {objectBadges}
              </div>
            )}

            {/* OCR Results */}
            {image.ocr && image.ocr.trim() && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Extracted Text</h4>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                    {image.ocr}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {showControls && (
          <div className="px-4 py-2 bg-muted/30 border-t text-xs text-muted-foreground text-center">
            Use <kbd className="px-1 py-0.5 bg-background rounded text-xs">+/-</kbd> to zoom, 
            <kbd className="px-1 py-0.5 bg-background rounded text-xs ml-1">R</kbd> to rotate, 
            <kbd className="px-1 py-0.5 bg-background rounded text-xs ml-1">0</kbd> to reset
          </div>
        )}
      </div>

      {/* Memoized fullscreen overlay */}
      {fullscreenOverlay}
    </>
  );
};