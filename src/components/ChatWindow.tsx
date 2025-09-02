import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ThumbsUp, ThumbsDown, Copy, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Ask questions about your image
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready to analyze your image
              </h3>
              <p className="text-muted-foreground">
                Ask me anything about the image you've uploaded. I can help identify objects, read text, describe scenes, and more.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 animate-fade-in',
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={cn(
                  'text-xs font-medium',
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                )}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              <div className={cn(
                'flex flex-col space-y-2 max-w-[80%]',
                message.type === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  'px-4 py-3 rounded-2xl shadow-soft',
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-muted-foreground">
                  {message.created_at ? new Date(message.created_at).toLocaleTimeString() : ''}
                </span>


                  {message.type === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRateMessage(message.id, 'positive')}
                        className={cn(
                          'h-6 w-6 p-0',
                          message.rating === 'positive' && 'text-success bg-success/10'
                        )}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRateMessage(message.id, 'negative')}
                        className={cn(
                          'h-6 w-6 p-0',
                          message.rating === 'negative' && 'text-destructive bg-destructive/10'
                        )}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => copyMessage(message.content)}>
                            <Copy className="w-4 h-4 mr-2" />
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

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border px-4 py-3 rounded-2xl shadow-soft">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-card/30">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your image..."
              className="resize-none min-h-[44px] max-h-32 pr-12"
              rows={1}
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!input.trim() || isSubmitting}
              className="absolute right-2 top-2 h-8 w-8 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
        
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};