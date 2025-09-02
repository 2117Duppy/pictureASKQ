import React, { useState } from 'react';
import { ArrowRight, MessageSquare, Upload, Zap, Shield, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Drag & drop any image format. Our AI processes and analyzes instantly.',
      color: 'text-primary'
    },
    {
      icon: MessageSquare,
      title: 'Natural Chat',
      description: 'Ask questions in plain English. Get detailed answers about your images.',
      color: 'text-accent'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time responses powered by advanced AI. No waiting around.',
      color: 'text-warning'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your images are processed securely. Complete privacy guaranteed.',
      color: 'text-success'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Designer',
      content: 'Game-changer for analyzing user interface screenshots. Saves me hours every week.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Data Scientist', 
      content: 'The OCR capabilities are incredible. Perfect for extracting data from charts and graphs.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Marketing Manager',
      content: 'Finally, an AI that understands context in images. Great for content analysis.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ImageChat AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="hero" onClick={() => navigate('/dashboard')}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-primary/10 text-primary border-primary/20">
              🚀 Powered by Advanced AI
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Chat with your
              <span className="bg-gradient-primary bg-clip-text text-transparent"> images</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload any image and ask natural questions. Get intelligent answers about objects, text, scenes, and more. 
              The future of image analysis is conversational.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate('/dashboard')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="text-lg px-8 py-6"
              >
                Start Analyzing Images
                <ArrowRight className={`w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/gallery')}
                className="text-lg px-8 py-6"
              >
                View Gallery
              </Button>
            </div>

            {/* Demo Preview */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant bg-card border">
                <div className="flex items-center gap-2 p-4 border-b bg-muted/50">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="ml-4 text-sm text-muted-foreground">ImageChat AI Demo</span>
                </div>
                <div className="p-8 bg-gradient-hero">
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-pulse-glow">
                      <MessageSquare className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <p className="text-muted-foreground">Interactive demo coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for image analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI capabilities in a simple, intuitive interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-primary/10 flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our users are saying
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative group hover:shadow-soft transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to transform how you analyze images?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals using ImageChat AI to unlock insights from their visual content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate('/dashboard')}
                className="text-lg px-8 py-6"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">ImageChat AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ImageChat AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;