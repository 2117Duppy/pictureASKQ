import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ThumbsUp, ThumbsDown, Copy, MoreHorizontal, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  rating?: 'positive' | 'negative';
  isTyping?: boolean;
  created_at: string;
}

interface ChatWindowProps {
  imageId?: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onRateMessage: (messageId: string, rating: 'positive' | 'negative') => void;
  isTyping?: boolean;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  imageId,
  messages,
  onSendMessage,
  onRateMessage,
  isTyping = false,
  className
}) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    const message = input.trim();
    setInput('');
    setIsSubmitting(true);

    try {
      await onSendMessage(message);
    } finally {
      setIsSubmitting(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Clean Header */}
      <div className="relative overflow-hidden border-b bg-card/80 backdrop-blur-sm">
        <div className="relative flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shadow-lg border-2 border-border">
                <MessageSquare className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full shadow-sm border-2 border-background" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-xl">
                  PictureASKQ AI
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Online
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                AI-powered image analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {messages.length} messages
              </p>
              <p className="text-xs text-muted-foreground">
                Ask anything about your image
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Messages Area */}
      <ScrollArea className="flex-1 relative">
        <div className="relative p-6 space-y-8 min-h-full">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-card flex items-center justify-center shadow-xl border-2 border-border">
                  <Bot className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to analyze your image
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed mb-6">
                Ask me anything about the image on PictureASKQ. I can identify objects, read text, describe scenes, and more.
              </p>
              <div className="flex justify-center gap-3">
                <Badge variant="outline" className="px-4 py-2">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Object Detection
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Text Analysis
                </Badge>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 items-start ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className="w-12 h-12 flex-shrink-0 shadow-lg border-2 border-border">
                <AvatarFallback className={`text-sm font-bold ${message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-accent text-accent-foreground'}`}>
                  {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex flex-col space-y-3 max-w-[75%] min-w-0 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`relative px-6 py-4 rounded-2xl shadow-xl ${message.type === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card text-card-foreground border border-border rounded-bl-md'}`}>
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                <div className={`flex items-center gap-3 text-xs text-muted-foreground px-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-medium">
                    {message.created_at ? new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>

                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRateMessage(message.id, 'positive')}
                        className={`h-7 w-7 p-0 rounded-full hover:bg-success/10 transition-all duration-200 ${message.rating === 'positive' ? 'bg-success/20 text-success' : ''}`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRateMessage(message.id, 'negative')}
                        className={`h-7 w-7 p-0 rounded-full hover:bg-destructive/10 transition-all duration-200 ${message.rating === 'negative' ? 'bg-destructive/20 text-destructive' : ''}`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-muted/50 transition-all duration-200">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                          <DropdownMenuItem onClick={() => copyMessage(message.content)} className="gap-2">
                            <Copy className="w-4 h-4" />
                            Copy message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Clean Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 items-start">
              <Avatar className="w-12 h-12 shadow-lg border-2 border-border">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border px-6 py-4 rounded-2xl rounded-bl-md shadow-xl">
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium ml-2">
                    PictureASKQ is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Clean Input Area */}
      <div className="relative overflow-hidden border-t bg-card/80 backdrop-blur-sm">
        <div className="relative p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your image..."
                className="resize-none min-h-[60px] max-h-40 pr-20 rounded-2xl shadow-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base leading-relaxed"
                rows={1}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="absolute right-4 bottom-4 h-10 w-10 p-0 rounded-xl shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p className="font-medium">
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> to send, <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift+Enter</kbd> for new line
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>AI Ready</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
