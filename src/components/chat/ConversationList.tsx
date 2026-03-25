import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useChat';

interface ConversationListProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  currentUserId,
  selectedId,
  onSelect,
}: ConversationListProps) => {
  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.user_id !== currentUserId);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        <p className="text-center text-sm">No conversations yet. Start chatting by messaging a landlord or student!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conv) => {
          const other = getOtherParticipant(conv);
          const name = other?.profile.full_name || 'Unknown User';
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                selectedId === conv.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted'
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={other?.profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{name}</p>
                  {conv.last_message && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.last_message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                {conv.last_message && (
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
