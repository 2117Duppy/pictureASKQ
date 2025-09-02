import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ImageData {
  id: string;
  url: string;
  filename: string;
  processedImageUrl?: string;
  thumbnails?: string[];
  ocr?: string;
  objects?: Array<{
    label: string;
    confidence: number;
    bbox?: [number, number, number, number];
  }>;
}

interface ImageViewerProps {
  image: ImageData;
  onClose?: () => void;
  className?: string;
  showControls?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  onClose,
  className,
  showControls = true
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.processedImageUrl || image.url;
    link.download = image.filename;
    link.click();
  };

  const imageUrl = image.processedImageUrl || image.url;

  const fullscreenOverlay = isFullscreen && (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative max-w-full max-h-full">
        <Button
          onClick={() => setIsFullscreen(false)}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
        >
          <X className="w-4 h-4" />
        </Button>
        <img
          src={imageUrl}
          alt={image.filename}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className={cn('flex flex-col h-full bg-card', className)} ref={containerRef}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground truncate">{image.filename}</h3>
            {image.objects && image.objects.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {image.objects.length} objects detected
              </Badge>
            )}
          </div>

          {showControls && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.25}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRotate}>
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 overflow-hidden relative bg-muted cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              ref={imageRef}
              src={imageUrl}
              alt={image.filename}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onDoubleClick={handleReset}
            />
          </div>

          {/* Zoom Level Indicator */}
          {zoom !== 1 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {Math.round(zoom * 100)}%
            </div>
          )}
        </div>

        {/* Object Detection Results */}
        {image.objects && image.objects.length > 0 && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium text-foreground mb-2">Detected Objects</h4>
            <div className="flex flex-wrap gap-2">
              {image.objects.slice(0, 6).map((obj, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {obj.label} ({Math.round(obj.confidence * 100)}%)
                </Badge>
              ))}
              {image.objects.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{image.objects.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* OCR Results */}
        {image.ocr && (
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium text-foreground mb-2">Extracted Text</h4>
            <p className="text-xs text-muted-foreground line-clamp-3">{image.ocr}</p>
          </div>
        )}
      </div>

      {fullscreenOverlay}
    </>
  );
};