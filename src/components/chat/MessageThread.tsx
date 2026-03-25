import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Message } from '@/hooks/useChat';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageThread = ({ messages, currentUserId }: MessageThreadProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="space-y-4 p-4">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          const name = msg.sender?.full_name || 'Unknown';
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={msg.id}
              className={cn('flex gap-3', isOwn && 'flex-row-reverse')}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.sender?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}
                >
                  {format(new Date(msg.created_at), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
