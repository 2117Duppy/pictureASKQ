import React, { useState } from 'react';
import { Search, Filter, Grid3x3, LayoutList, MessageSquare, Calendar, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  messageCount: number;
  status: 'completed' | 'processing' | 'failed';
  tags: string[];
  size: string;
}

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const [images] = useState<GalleryImage[]>([
    {
      id: '1',
      filename: 'product-mockup.jpg',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-20T10:30:00'),
      messageCount: 12,
      status: 'completed',
      tags: ['product', 'design'],
      size: '2.4 MB'
    },
    {
      id: '2',
      filename: 'architecture-plan.pdf',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-19T15:45:00'),
      messageCount: 8,
      status: 'completed',
      tags: ['architecture', 'blueprint'],
      size: '5.1 MB'
    },
    {
      id: '3',
      filename: 'data-visualization.png',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-19T09:15:00'),
      messageCount: 5,
      status: 'processing',
      tags: ['data', 'chart'],
      size: '1.8 MB'
    },
    {
      id: '4',
      filename: 'ui-screenshot.png',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-18T14:20:00'),
      messageCount: 15,
      status: 'completed',
      tags: ['ui', 'interface'],
      size: '3.2 MB'
    },
    {
      id: '5',
      filename: 'invoice-scan.jpg',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-17T11:10:00'),
      messageCount: 3,
      status: 'completed',
      tags: ['document', 'ocr'],
      size: '1.1 MB'
    },
    {
      id: '6',
      filename: 'logo-design.svg',
      url: '/placeholder.svg',
      uploadedAt: new Date('2024-01-16T16:30:00'),
      messageCount: 7,
      status: 'failed',
      tags: ['logo', 'branding'],
      size: '0.8 MB'
    }
  ]);

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
                    
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
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
    </div>
  );
};

export default Gallery;