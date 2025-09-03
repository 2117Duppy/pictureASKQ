import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid3x3, LayoutList, MessageSquare, Calendar, Upload, ArrowLeft, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  messageCount: number;
  status: 'completed' | 'processing' | 'failed';
  tags: string[];
  size: string;
  isFavorited?: boolean; // Added for favorite functionality
}

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [deleteImageName, setDeleteImageName] = useState<string>('');
  const { toast } = useToast();

  // Fetch images from database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        if (data) {
          const galleryImages: GalleryImage[] = data.map(img => ({
            id: img.supabase_path,
            filename: img.filename,
            url: img.public_url,
            uploadedAt: new Date(img.uploaded_at),
            messageCount: img.message_count || 0,
            status: img.status || 'completed',
            tags: img.tags || [],
            size: img.file_size || 'Unknown',
            ocr: img.ocr_text,
            objects: img.detected_objects,
            isFavorited: img.is_favorited, // Assuming is_favorited is stored in the database
          }));
          setImages(galleryImages);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const filteredImages = images.filter(image => {
    const matchesSearch = image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || image.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedImages = [...filteredImages].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.uploadedAt.getTime() - a.uploadedAt.getTime();
      case 'oldest':
        return a.uploadedAt.getTime() - b.uploadedAt.getTime();
      case 'name':
        return a.filename.localeCompare(b.filename);
      case 'messages':
        return b.messageCount - a.messageCount;
      default:
        return 0;
    }
  });

  const handleImageClick = (imageId: string) => {
    navigate(`/chat/${imageId}`);
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      // Delete from Supabase Storage
      await supabase.storage.from('images').remove([imageId]);
      
      // Delete from database
      await supabase.from('images').delete().eq('supabase_path', imageId);
      
      // Delete associated messages
      await supabase.from('messages').delete().eq('chat_id', imageId);
      
      // Remove from UI
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      toast({
        title: "Image deleted",
        description: "Image and all associated data have been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the image. Please try again.",
        variant: "destructive",
      });
    }
    setDeleteImageId(null);
    setDeleteImageName('');
  };

  const handleToggleFavorite = async (imageId: string, currentlyFavorited: boolean) => {
    try {
      // Update database
      await supabase
        .from('images')
        .update({ is_favorited: !currentlyFavorited })
        .eq('supabase_path', imageId);
      
      // Update UI
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, isFavorited: !currentlyFavorited }
          : img
      ));
      
      toast({
        title: currentlyFavorited ? "Removed from favorites" : "Added to favorites",
        description: currentlyFavorited 
          ? "Image removed from your favorites." 
          : "Image added to your favorites.",
      });
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast({
        title: "Update failed",
        description: "Could not update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
                <p className="text-muted-foreground">Browse and manage your images</p>
              </div>
            </div>
            <Button onClick={() => navigate('/dashboard')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search images by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {sortedImages.length} of {images.length} images
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Gallery Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedImages.map((image) => (
              <Card
                key={image.id}
                className="group cursor-pointer overflow-hidden hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => handleImageClick(image.id)}
              >
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={image.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {image.status}
                    </Badge>
                  </div>
                  {image.messageCount > 0 && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {image.messageCount}
                    </div>
                  )}
                  {/* Favorite Button - Top Left */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(image.id, image.isFavorited || false);
                    }}
                    className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-yellow-500/90 hover:bg-yellow-600 text-white rounded-full p-2"
                  >
                    <Heart className={`w-4 h-4 ${image.isFavorited ? 'fill-current' : ''}`} />
                  </Button>

                  {/* Delete Button - Top Right */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteImageId(image.id);
                      setDeleteImageName(image.filename);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground truncate mb-2">
                    {image.filename}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{image.uploadedAt.toLocaleDateString()}</span>
                    <span>{image.size}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{image.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedImages.map((image) => (
              <Card
                key={image.id}
                className="group cursor-pointer hover:shadow-soft transition-all duration-200"
                onClick={() => handleImageClick(image.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {image.filename}
                        </h3>
                        <Badge
                          variant={image.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {image.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {image.uploadedAt.toLocaleDateString()} • {image.size}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          {image.messageCount} messages
                        </div>
                        <div className="flex gap-1">
                          {image.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image.id);
                        }}
                        className="bg-blue-500/90 hover:bg-blue-600 text-white"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(image.id, image.isFavorited || false);
                        }}
                        className="bg-yellow-500/90 hover:bg-yellow-600 text-white"
                      >
                        <Heart className={`w-4 h-4 ${image.isFavorited ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteImageId(image.id);
                          setDeleteImageName(image.filename);
                        }}
                        className="bg-red-500/90 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sortedImages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No images found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search terms or filters' : 'Upload your first image to get started'}
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteImageId} onOpenChange={() => setDeleteImageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteImageName}"? This action cannot be undone and will also delete all associated chat messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteImageId && handleDeleteImage(deleteImageId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Gallery;