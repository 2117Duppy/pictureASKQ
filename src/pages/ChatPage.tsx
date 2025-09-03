import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/ImageViewer';
import { ChatWindow } from '@/components/ChatWindow';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  chat_id: string;
  type: 'user' | 'assistant';
  content: string;
  created_at: string;
  rating?: 'positive' | 'negative';
}

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

const N8N_CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
const N8N_IMAGE_ANALYSIS_WEBHOOK_URL = import.meta.env.VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL;

const ChatPage: React.FC = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const { toast } = useToast();

  // Memoize decoded imageId to avoid multiple decodeURIComponent calls
  const decodedImageId = useMemo(() => {
    return imageId ? decodeURIComponent(imageId) : '';
  }, [imageId]);

  // Memoized image URL construction - only recalculates when decodedImageId changes
  const imageUrl = useMemo(() => {
    if (!decodedImageId) return '';
    
    // Use direct URL if already complete
    if (decodedImageId.startsWith('https://') && decodedImageId.includes('supabase.co')) {
      return decodedImageId;
    }
    
    // Generate URL from Supabase
    return supabase.storage.from('images').getPublicUrl(decodedImageId).data.publicUrl || '';
  }, [decodedImageId]);

  // FIX: Single dependency to prevent infinite loops
  useEffect(() => {
    if (!decodedImageId) {
      setIsLoadingImage(false);
      return;
    }

    const loadSession = async () => {
      try {
        setIsLoadingImage(true);

        // Parallel loading for better performance
        const [messagesResult] = await Promise.all([
          supabase
            .from('messages')
            .select('*')
            .eq('chat_id', decodedImageId)
            .order('created_at', { ascending: true })
        ]);

        // Handle messages
        if (messagesResult.data) {
          setMessages(messagesResult.data);
        }

        // Set basic image data immediately - use imageUrl only after it's computed
        const finalImageUrl = decodedImageId.startsWith('https://') ? decodedImageId : 
          supabase.storage.from('images').getPublicUrl(decodedImageId).data.publicUrl || '';
          
        const filename = decodedImageId.split('/').pop() || 'unknown-image';
        setImage({
          id: decodedImageId,
          url: finalImageUrl,
          filename,
          ocr: '',
          objects: [],
        });

        // Load analysis asynchronously (non-blocking)
        if (N8N_IMAGE_ANALYSIS_WEBHOOK_URL) {
          fetch(N8N_IMAGE_ANALYSIS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: finalImageUrl }),
          })
            .then(response => response.ok ? response.text() : null)
            .then(text => {
              if (!text) return;
              
              try {
                const data = JSON.parse(text);
                setImage(prev => prev ? {
                  ...prev,
                  ocr: data.ocr || '',
                  objects: Array.isArray(data.objects) ? data.objects : [],
                } : null);
              } catch {
                // Silently handle parsing errors
              }
            })
            .catch(() => {
              // Silently handle network errors
            });
        }

        // FIXED: Set loading to false after successful data loading
        setIsLoadingImage(false);

      } catch (error) {
        console.error('Session load error:', error);
        setIsLoadingImage(false);
      }
    };

    loadSession();
  }, [decodedImageId]); // FIXED: Single dependency to prevent infinite loops

  // Optimized message sending
  const handleSendMessage = useCallback(async (content: string) => {
    if (!image || !N8N_CHAT_WEBHOOK_URL) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      chat_id: decodedImageId,
      type: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Parallel operations for better performance
      const [userInsert, n8nResponse] = await Promise.all([
        supabase.from('messages').insert([{
          id: userMessage.id,
          chat_id: userMessage.chat_id,
          type: userMessage.type,
          content: userMessage.content,
          created_at: userMessage.created_at,
          rating: null
        }]),
        fetch(N8N_CHAT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            imageId: decodedImageId,
            imageUrl: image.url,
            ocrText: image.ocr || '',
            detectedObjects: Array.isArray(image.objects) ? image.objects : [],
            chatHistory: messages.map(msg => ({ type: msg.type, content: msg.content })),
            sessionId: decodedImageId,
            timestamp: new Date().toISOString(),
          }),
        })
      ]);

      if (!n8nResponse.ok) {
        throw new Error(`n8n error: ${n8nResponse.status}`);
      }

      // Parse AI response with comprehensive key support
      const responseText = await n8nResponse.text();
      let aiResponse = '';
      let parsedData = null;

      console.log('🔍 Raw n8n response:', responseText);

      try {
        parsedData = JSON.parse(responseText);
        console.log('📦 Parsed n8n data:', parsedData);
        
        // Handle n8n array responses (common pattern)
        const responseData = Array.isArray(parsedData) ? parsedData[0] : parsedData;
        
        // Comprehensive response key checking
        aiResponse = responseData.output ||           // Chat workflow output
                    responseData.response ||          // Alternative response key
                    responseData.message ||           // Standard message key
                    responseData.text ||              // Text content
                    responseData.answer ||            // Answer key
                    responseData.description ||       // Image analysis description
                    (responseData.objects && `Detected objects: ${responseData.objects.join(', ')}`) || // Objects array
                    responseData;                     // Fallback to raw data
        
        // If response is still an object, stringify it
        if (typeof aiResponse === 'object') {
          aiResponse = JSON.stringify(aiResponse, null, 2);
        }
        
        console.log('✅ Final parsed AI response:', aiResponse);
        
      } catch (parseError) {
        console.log('⚠️ JSON parse failed, using raw text:', parseError);
        aiResponse = responseText;
      }

      // Validate response content
      if (!aiResponse || (typeof aiResponse === 'string' && !aiResponse.trim())) {
        console.warn('⚠️ Empty or invalid AI response, using fallback');
        aiResponse = "I received your message but couldn't generate a response. Please try again.";
      }

      // Ensure aiResponse is always a string
      if (typeof aiResponse !== 'string') {
        aiResponse = String(aiResponse);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        chat_id: decodedImageId,
        type: 'assistant',
        content: aiResponse.trim(),
        created_at: new Date().toISOString(),
      };

      console.log('💬 Adding AI message to chat:', aiMessage);
      
      // Parallel UI update and database save
      setMessages(prev => [...prev, aiMessage]);
      
      await supabase.from('messages').insert([{
        id: aiMessage.id,
        chat_id: aiMessage.chat_id,
        type: aiMessage.type,
        content: aiMessage.content,
        created_at: aiMessage.created_at,
        rating: null
      }]);

    } catch (error) {
      console.error('Message send error:', error);
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          chat_id: decodedImageId,
          type: 'assistant',
          content: 'Oops! Something went wrong while getting an AI response. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [decodedImageId, image, messages]);

  // Memoized objects array
  const objectsArray = useMemo(() => {
    return Array.isArray(image?.objects) ? image.objects : [];
  }, [image?.objects]);

  const handleRateMessage = useCallback((messageId: string, rating: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating } : msg
    ));
    
    supabase.from('messages')
      .update({ rating })
      .eq('id', messageId);
  }, []);

  const handleExport = useCallback(() => {
    if (!image) return;
    
    const exportData = {
      image: {
        filename: image.filename,
        url: image.url,
        uploadedAt: new Date().toISOString(),
        ocr: image.ocr,
        objects: objectsArray,
      },
      conversation: messages,
      exportedAt: new Date().toISOString(),
      platform: 'PictureASKQ',
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${image.filename.replace(/\.[^/.]+$/, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [image, objectsArray, messages]);

  const handleShare = useCallback(() => {
    if (!imageId) return;
    
    const shareUrl = `${window.location.origin}/chat/${encodeURIComponent(imageId)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Conversation link has been copied to your clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    });
  }, [imageId, toast]);

  // Loading state
  if (isLoadingImage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Loading your image...</h2>
          <p className="text-muted-foreground">Preparing your chat session.</p>
        </Card>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-destructive mb-2">Image not found</h2>
          <p className="text-muted-foreground">The image you are looking for could not be loaded.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-semibold text-foreground truncate max-w-xs">{image.filename}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r">
          <ImageViewer image={image} className="h-full" />
        </div>
        <div className="w-1/2">
          <ChatWindow
            imageId={imageId}
            messages={messages}
            onSendMessage={handleSendMessage}
            onRateMessage={handleRateMessage}
            isTyping={isTyping}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;