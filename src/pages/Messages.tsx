import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageThread } from '@/components/chat/MessageThread';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Messages = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    conversations,
    messages,
    currentConversation,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setCurrentConversation,
  } = useChat();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(user.id);
      setAuthLoading(false);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  const handleSelectConversation = (id: string) => {
    fetchMessages(id);
  };

  const handleBack = () => {
    setCurrentConversation(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mt-16">
          <Skeleton className="h-[600px] w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <Card className="h-[calc(100vh-200px)] min-h-[500px]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-65px)]">
            <div className="flex h-full">
              {/* Conversation List - Hidden on mobile when viewing a conversation */}
              <div
                className={`w-full md:w-80 border-r ${
                  currentConversation ? 'hidden md:block' : 'block'
                }`}
              >
                {loading && !conversations.length ? (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <ConversationList
                    conversations={conversations}
                    currentUserId={currentUserId || ''}
                    selectedId={currentConversation}
                    onSelect={handleSelectConversation}
                  />
                )}
              </div>

              {/* Message Thread */}
              <div
                className={`flex-1 flex flex-col ${
                  !currentConversation ? 'hidden md:flex' : 'flex'
                }`}
              >
                {currentConversation ? (
                  <>
                    {/* Mobile back button */}
                    <div className="md:hidden p-2 border-b">
                      <Button variant="ghost" size="sm" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <MessageThread
                        messages={messages}
                        currentUserId={currentUserId || ''}
                      />
                    </div>
                    <ChatInput onSend={sendMessage} disabled={loading} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
