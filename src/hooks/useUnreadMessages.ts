/**
 * Hook to track unread message count for the current user
 * Used to display notification badges in the navbar
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUnreadCount(0);
        return;
      }

      // Get all conversations the user is part of
      const { data: participantData } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participantData || participantData.length === 0) {
        setUnreadCount(0);
        return;
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Count unread messages (messages not sent by user and not read)
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Subscribe to new messages for real-time updates
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('unread-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            // If the new message is not from the current user, increment count
            if (payload.new && (payload.new as any).sender_id !== user.id) {
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            // If a message was marked as read, decrement count
            if (payload.new && (payload.new as any).read_at && !(payload.old as any)?.read_at) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUnreadCount();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      subscription.unsubscribe();
    };
  }, []);

  return { unreadCount };
};
