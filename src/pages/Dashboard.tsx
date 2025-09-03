import React, { useState } from 'react';
import { Plus, MessageSquare, Image as ImageIcon, TrendingUp, Clock, Star, Upload, Zap, BarChart3, Share2, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/ImageUploader';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RecentImage {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  messageCount: number;
  status: 'completed' | 'processing' | 'failed';
  supabasePath: string; // Add this field
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
    // Navigate to chat page using the full public URL
    navigate(`/chat/${encodeURIComponent(imageData.url)}`);
  };

  const handleImageClick = (imageId: string) => {
    // For existing images, we need to get the full URL from database
    // For now, assume imageId is the full URL or we need to fetch it
    navigate(`/chat/${encodeURIComponent(imageId)}`);
  };

  // Simple n8n test
  useEffect(() => {
    if (import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL) {
      console.log('✅ n8n webhook URL found:', import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL);
    } else {
      console.error('❌ n8n webhook URL not found. Please check your .env file.');
      console.error('Expected: VITE_N8N_CHAT_WEBHOOK_URL=your-webhook-url');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40 shadow-soft">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">Analyze images with AI-powered insights</p>
            </div>
            <Button 
              onClick={() => setShowUploader(!showUploader)}
              className="bg-primary hover:bg-primary/90 transition-all duration-300 px-6 py-3 text-base font-medium"
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
          <div className="bg-muted/30 rounded-3xl p-12 border border-border/50">
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
                  className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 py-4 text-lg font-semibold"
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
              <Card className="animate-scale-in shadow-xl border-0 bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ImageIcon className="w-6 h-6 text-primary" />
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
            <Card className="shadow-xl border-0 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Clock className="w-6 h-6 text-muted-foreground" />
                      Recent Images
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Your uploaded images will appear here once connected to n8n
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/gallery')}
                    className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentImages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
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
                      className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 py-4 text-lg"
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

          {/* Clean Sidebar */}
          <div className="space-y-8">
            {/* Clean Stats Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-soft border-0 bg-card hover:shadow-xl transition-all duration-300">
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

              <Card className="shadow-soft border-0 bg-card hover:shadow-xl transition-all duration-300">
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

              <Card className="shadow-soft border-0 bg-card hover:shadow-xl transition-all duration-300">
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

              <Card className="shadow-soft border-0 bg-card hover:shadow-xl transition-all duration-300">
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

            {/* Clean Quick Actions */}
            <Card className="shadow-xl border-0 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => navigate('/gallery')}
                >
                  <ImageIcon className="w-4 h-4 mr-3" />
                  Browse Gallery
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                  onClick={() => setShowUploader(true)}
                >
                  <Upload className="w-4 h-4 mr-3" />
                  New Upload
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => navigate('/profile')}
                >
                  <Star className="w-4 h-4 mr-3" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Environment Variables Debug */}
            <Card className="shadow-xl border-0 bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Settings className="w-6 h-6 text-purple-500" />
                  </div>
                  Environment Variables Debug
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Check if your .env file is being loaded correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">VITE_N8N_CHAT_WEBHOOK_URL:</span>
                      <span className={`text-sm px-2 py-1 rounded ${import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL ? '✅ Set' : '❌ Not set'}
                      </span>
                    </div>
                    <code className="text-xs text-muted-foreground block">
                      {import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || 'undefined'}
                    </code>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL:</span>
                      <span className={`text-sm px-2 py-1 rounded ${import.meta.env.VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {import.meta.env.VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL ? '✅ Set' : 'ℹ️ Not set (optional)'}
                      </span>
                    </div>
                    <code className="text-xs text-muted-foreground block">
                      {import.meta.env.VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL || 'undefined'}
                    </code>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📋 .env File Format:</h4>
                    <pre className="text-xs text-blue-700 whitespace-pre-wrap">
{`# Create this in your project root
VITE_N8N_CHAT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL=https://your-n8n-instance.com/webhook/image-analysis-id`}
                    </pre>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Refresh Page
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => console.log('All env vars:', import.meta.env)}
                    >
                      Log All Env Vars
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;