import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      full_name: string;
      avatar_url: string | null;
    };
  }[];
  last_message?: Message;
}

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      if (!participantData || participantData.length === 0) {
        setConversations([]);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch participants and last message for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);

          const participantProfiles = await Promise.all(
            (participants || []).map(async (p) => {
              const { data: profile } = await supabase
                .from('profiles_public')
                .select('full_name, avatar_url')
                .eq('user_id', p.user_id)
                .single();
              return { user_id: p.user_id, profile: profile || { full_name: 'Unknown', avatar_url: null } };
            })
          );

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            participants: participantProfiles,
            last_message: lastMessage || undefined,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mark unread messages as read (messages not sent by current user)
      const unreadMessageIds = (data || [])
        .filter(msg => msg.sender_id !== user.id && !msg.read_at)
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessageIds);
      }

      // Fetch sender profiles
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', msg.sender_id)
            .single();
          return { ...msg, sender: profile || { full_name: 'Unknown', avatar_url: null } };
        })
      );

      setMessages(messagesWithSenders);
      setCurrentConversation(conversationId);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversation);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [currentConversation, toast]);

  // Start a new conversation with a user
  const startConversation = useCallback(async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingParticipants) {
        for (const p of existingParticipants) {
          const { data: otherParticipant } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('conversation_id', p.conversation_id)
            .eq('user_id', otherUserId)
            .single();

          if (otherParticipant) {
            setCurrentConversation(p.conversation_id);
            await fetchMessages(p.conversation_id);
            return p.conversation_id;
          }
        }
      }

      // Create new conversation - generate ID client-side to avoid needing .select()
      // which would fail because we're not yet a participant
      const conversationId = crypto.randomUUID();
      const { error: convError } = await supabase
        .from('conversations')
        .insert({ id: conversationId });

      if (convError) throw convError;

      // Add participants using the client-generated conversation ID
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: otherUserId },
        ]);

      if (participantError) throw participantError;

      setCurrentConversation(conversationId);
      await fetchConversations();
      return conversationId;
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
      return null;
    }
  }, [fetchConversations, fetchMessages, toast]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!currentConversation) return;

    const channel = supabase
      .channel(`messages:${currentConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, sender: profile || { full_name: 'Unknown', avatar_url: null } },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation]);

  return {
    conversations,
    messages,
    currentConversation,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    setCurrentConversation,
  };
};
