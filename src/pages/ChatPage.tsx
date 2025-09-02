import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageViewer } from '@/components/ImageViewer';
import { ChatWindow } from '@/components/ChatWindow';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

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

// Environment variables
const N8N_CHAT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;
const N8N_IMAGE_ANALYSIS_WEBHOOK_URL = import.meta.env.VITE_N8N_IMAGE_ANALYSIS_WEBHOOK_URL;

const ChatPage: React.FC = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    const loadChatSession = async () => {
      if (!imageId) {
        setIsLoadingImage(false);
        return;
      }

      setIsLoadingImage(true);
      const decodedImageId = decodeURIComponent(imageId);

      try {
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(decodedImageId);

        if (!publicUrlData?.publicUrl) throw new Error('Could not get public URL for image');
        const imageUrl = publicUrlData.publicUrl;

        // Trigger n8n image analysis
        let ocrResult = '';
        let objectDetectionResults: Array<{ label: string; confidence: number; bbox?: [number, number, number, number] }> = [];

        if (N8N_IMAGE_ANALYSIS_WEBHOOK_URL) {
          try {
            const analysisResponse = await fetch(N8N_IMAGE_ANALYSIS_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl }),
            });
            if (!analysisResponse.ok) throw new Error(`Image analysis HTTP error: ${analysisResponse.status}`);
            const analysisData = await analysisResponse.json();
            ocrResult = analysisData.ocr || '';
            objectDetectionResults = analysisData.objects || [];
          } catch (err) {
            console.error('Error calling image analysis webhook:', err);
          }
        }

        // Set image state
        setImage({
          id: decodedImageId,
          url: imageUrl,
          filename: decodedImageId.split('/').pop() || 'unknown-image',
          ocr: ocrResult,
          objects: objectDetectionResults,
        });

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', decodedImageId)
          .order('created_at', { ascending: true });

        if (messagesError) console.error('Error fetching messages:', messagesError);
        else if (messagesData) {
          const loadedMessages: Message[] = messagesData.map(msg => ({
            id: msg.id,
            chat_id: msg.chat_id,
            type: msg.type,
            content: msg.content,
            created_at: msg.created_at,
            rating: msg.rating,
          }));
          setMessages(loadedMessages);

          if (loadedMessages.length === 0) {
            const initialAiMessage: Message = {
              id: `ai-initial-${Date.now()}`,
              chat_id: decodedImageId,
              type: 'assistant',
              content: 'I\'ve analyzed your image. What would you like to know about it?',
              created_at: new Date().toISOString(),
            };
            setMessages([initialAiMessage]);
            await supabase.from('messages').insert([initialAiMessage]);
          }
        }
      } catch (err: any) {
        console.error('Error loading chat session or image:', err.message);
      } finally {
        setIsLoadingImage(false);
      }
    };

    loadChatSession();
  }, [imageId]);

  const handleSendMessage = async (content: string) => {
    if (!imageId || !image) return;

    const decodedImageId = decodeURIComponent(imageId);
    const userMessage: Message = {
      id: Date.now().toString(),
      chat_id: decodedImageId,
      type: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Insert user message
    const { error: userInsertError } = await supabase.from('messages').insert([
      {
        id: userMessage.id,
        chat_id: userMessage.chat_id,
        type: userMessage.type,
        content: userMessage.content,
        created_at: userMessage.created_at,
      }
    ]);
    if (userInsertError) console.error('Error inserting user message:', userInsertError);

    try {
      if (!N8N_CHAT_WEBHOOK_URL) throw new Error('VITE_N8N_CHAT_WEBHOOK_URL is not set.');

      const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          imageId,
          imageUrl: image.url,
          ocrText: image.ocr,
          detectedObjects: image.objects,
          chatHistory: messages.map(msg => ({ type: msg.type, content: msg.content })),
        }),
      });

      if (!response.ok) throw new Error(`Chat webhook HTTP error: ${response.status}`);

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        chat_id: decodedImageId,
        type: 'assistant',
        content: data.aiResponse || "I'm sorry, I couldn't get a response from the AI.",
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
      const { error: aiInsertError } = await supabase.from('messages').insert([
        {
          id: aiMessage.id,
          chat_id: aiMessage.chat_id,
          type: aiMessage.type,
          content: aiMessage.content,
          created_at: aiMessage.created_at,
        }
      ]);
      if (aiInsertError) console.error('Error inserting AI message:', aiInsertError);
    } catch (err) {
      console.error('Error sending message to chat webhook:', err);
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
  };

  const handleRateMessage = (messageId: string, rating: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, rating } : msg)));
    supabase.from('messages').update({ rating }).eq('id', messageId).then(({ error }) => {
      if (error) console.error('Error updating message rating:', error);
    });
  };

  const handleExport = () => console.log('Exporting conversation...');

  if (isLoadingImage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Loading image and analysis...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your chat session.</p>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-2">Image not found</h2>
          <p className="text-muted-foreground">The image you are looking for could not be loaded or analyzed.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">Go to Dashboard</Button>
        </div>
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
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
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
