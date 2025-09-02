import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  supabasePath?: string;
  publicUrl?: string;
}

interface ImageUploaderProps {
  onUploadComplete?: (imageData: { id: string; url: string; filename: string; supabasePath: string }) => void;
  onUploadStart?: (file: File) => void;
  className?: string;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUploadComplete,
  onUploadStart,
  className,
  maxFiles = 5,
}) => {
  const [files, setFiles] = useState<ImageFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, maxFiles).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: 'uploading' as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      newFiles.forEach((fileData) => {
        onUploadStart?.(fileData.file);
        uploadFileToSupabase(fileData);
      });
    },
    [maxFiles, onUploadStart]
  );

  const uploadFileToSupabase = async (fileData: ImageFile) => {
    const filePath = `${Date.now()}-${fileData.file.name}`;
    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, fileData.file, { cacheControl: '3600', upsert: false });

      if (error) throw error;
      if (!data?.path) throw new Error('No path returned from upload.');

      // Get public URL
      const publicUrlResult = supabase.storage.from('images').getPublicUrl(data.path);
      const publicUrl = publicUrlResult.data.publicUrl;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: 'completed', progress: 100, supabasePath: data.path, publicUrl }
            : f
        )
      );

      // Call onUploadComplete callback
      onUploadComplete?.({
        id: fileData.id,
        url: publicUrl,
        filename: fileData.file.name,
        supabasePath: data.path,
      });
    } catch (err: any) {
      console.error('Error uploading file to Supabase:', err.message);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileData.id ? { ...f, status: 'error' } : f))
      );
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf'] },
    maxFiles,
    multiple: true,
  });

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
          'hover:border-primary hover:bg-gradient-hero',
          isDragActive && 'border-primary bg-gradient-hero scale-105',
          isDragReject && 'border-destructive bg-destructive/5',
          'group'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center transition-transform group-hover:scale-110',
              isDragActive && 'animate-pulse-glow'
            )}
          >
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{isDragActive ? 'Drop images here' : 'Upload images'}</h3>
            <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports PNG, JPG, GIF, WebP, PDF up to 10MB</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border animate-fade-in">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground truncate">{file.file.name}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {file.status === 'uploading' && (
                      <>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      </>
                    )}
                    {file.status === 'processing' && (
                      <>
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Analyzing...</span>
                      </>
                    )}
                    {file.status === 'completed' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-xs text-success-foreground">Ready</span>
                      </>
                    )}
                    {file.status === 'error' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <span className="text-xs text-destructive-foreground">Upload failed</span>
                      </>
                    )}
                  </div>
                  {file.status !== 'completed' && file.status !== 'error' && <Progress value={file.progress} className="h-1" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
