import React, { useState } from 'react';
import { Plus, MessageSquare, Image as ImageIcon, TrendingUp, Clock, Star, Upload, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/ImageUploader';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface RecentImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  messageCount: number;
  status: 'completed' | 'processing' | 'failed';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showUploader, setShowUploader] = useState(false);
  
  // Will be connected to your n8n backend
  const [recentImages] = useState<RecentImage[]>([]);

  const stats = {
    totalImages: 0,
    totalConversations: 0,
    avgResponseTime: '0s',
    satisfaction: 0
  };

  const handleUploadComplete = (imageData: any) => {
    // Navigate to chat page for the uploaded image
    navigate(`/chat/${imageData.id}`);
  };

  const handleImageClick = (imageId: string) => {
    navigate(`/chat/${imageId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Enhanced Header */}
      <div className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-40 shadow-soft">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Analyze images with AI-powered insights</p>
            </div>
            <Button 
              onClick={() => setShowUploader(!showUploader)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-6 py-3 text-base font-medium"
              size="lg"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <div className="bg-gradient-hero rounded-3xl p-12 border border-border/50 shadow-elegant">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Welcome to AI Image Analysis
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Upload any image and start conversing with our AI to uncover insights, 
                extract information, and get detailed analysis.
              </p>
              {!showUploader && (
                <Button
                  onClick={() => setShowUploader(true)}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg font-semibold"
                  size="lg"
                >
                  <Zap className="w-6 h-6 mr-3" />
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Enhanced Upload Section */}
            {showUploader && (
              <Card className="animate-scale-in shadow-elegant border-0 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    Upload New Image
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Upload an image to start analyzing with AI-powered insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ImageUploader 
                    onUploadComplete={handleUploadComplete}
                    maxFiles={1}
                  />
                </CardContent>
              </Card>
            )}

            {/* Enhanced Recent Images */}
            <Card className="shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-gradient-accent">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      Recent Images
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Your uploaded images will appear here once connected to n8n
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/gallery')}
                    className="hover:bg-gradient-primary hover:text-white transition-all duration-300"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentImages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-hero flex items-center justify-center mb-6">
                      <ImageIcon className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">
                      Ready for your first upload
                    </h3>
                    <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                      Upload an image to start analyzing with AI. Your images will be processed 
                      by your n8n workflows and appear here.
                    </p>
                    <Button 
                      onClick={() => setShowUploader(true)}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300 px-8 py-4 text-lg"
                      size="lg"
                    >
                      <Upload className="w-5 h-5 mr-3" />
                      Upload First Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-primary/5 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">Total Images</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalImages}</p>
                  <p className="text-sm text-muted-foreground mt-1">Processed by AI</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-accent/5 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <MessageSquare className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-medium text-foreground">Conversations</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.totalConversations}</p>
                  <p className="text-sm text-muted-foreground mt-1">AI interactions</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-success/5 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Zap className="w-5 h-5 text-success" />
                    </div>
                    <span className="font-medium text-foreground">Avg Response</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.avgResponseTime}</p>
                  <p className="text-sm text-muted-foreground mt-1">Lightning fast</p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-gradient-to-br from-card to-warning/5 hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                    <span className="font-medium text-foreground">Satisfaction</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{stats.satisfaction}</p>
                  <p className="text-sm text-muted-foreground mt-1">User rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Quick Actions */}
            <Card className="shadow-elegant border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={() => navigate('/gallery')}
                >
                  <ImageIcon className="w-4 h-4 mr-3" />
                  Browse Gallery
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-accent hover:text-white hover:border-accent transition-all duration-300"
                  onClick={() => setShowUploader(true)}
                >
                  <Upload className="w-4 h-4 mr-3" />
                  New Upload
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gradient-primary hover:text-white hover:border-primary transition-all duration-300"
                  onClick={() => navigate('/profile')}
                >
                  <Star className="w-4 h-4 mr-3" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;