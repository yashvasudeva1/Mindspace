import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  emotion?: string;
}

const getAIResponse = async (message: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body: { message }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data.response || "I'm here to listen and support you. Can you tell me more about what's on your mind?";
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "I'm here to listen and support you. Can you tell me more about what's on your mind?";
  }
};

export default function ChatWidget({ isExpanded = false }: { isExpanded?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm here to listen and support you. Feel free to share what's on your mind, or ask me anything about wellness and self-care. 💜",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll functionality as requested

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(currentMessage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm here to listen and support you. Can you tell me more about what's on your mind?",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
  };

  return (
    <div className={cn(
      "bg-card border border-border-soft rounded-radius-lg shadow-medium transition-all duration-300",
      isExpanded ? "h-[600px]" : "h-[400px]"
    )}>
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-border-soft bg-gradient-to-r from-primary-soft to-secondary-soft rounded-t-radius-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">Wellness Assistant</h3>
            <p className="text-xs text-primary-foreground/80">Always here to listen</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-success rounded-full animate-gentle-bounce" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: isExpanded ? '480px' : '280px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex animate-fade-in",
              message.isBot ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-radius text-sm",
                message.isBot
                  ? "bg-gradient-to-r from-secondary-soft to-accent-soft text-secondary-foreground"
                  : "bg-gradient-primary text-primary-foreground"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-3 rounded-radius text-sm chat-bubble-typing">
              <span className="inline-block w-2 h-2 bg-muted-foreground rounded-full mr-1 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-2 h-2 bg-muted-foreground rounded-full mr-1 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border-soft">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Share what's on your mind... I'm here to listen 💜"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="wellness-input resize-none pr-12 min-h-[44px] max-h-[100px]"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceInput}
              className={cn(
                "absolute right-2 top-2 h-8 w-8 p-0 transition-colors",
                isListening && "text-accent animate-pulse"
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="h-11 px-4 bg-gradient-primary hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}