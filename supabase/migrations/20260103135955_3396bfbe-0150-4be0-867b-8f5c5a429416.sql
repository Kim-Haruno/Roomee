-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Authenticated users can add participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

-- Create a security definer function to check conversation participation (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$;

-- Create new policies for conversation_participants
-- Users can view their own participation records
CREATE POLICY "Users can view own participation"
ON public.conversation_participants
FOR SELECT
USING (user_id = auth.uid());

-- Users can view other participants in conversations they're part of
CREATE POLICY "Users can view co-participants"
ON public.conversation_participants
FOR SELECT
USING (is_conversation_participant(conversation_id));

-- Authenticated users can add participants
CREATE POLICY "Authenticated users can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create new policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (is_conversation_participant(id));

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow updating conversation timestamp
CREATE POLICY "Participants can update conversation"
ON public.conversations
FOR UPDATE
USING (is_conversation_participant(id));

-- Create new policies for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (is_conversation_participant(conversation_id));

CREATE POLICY "Users can send messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (sender_id = auth.uid() AND is_conversation_participant(conversation_id));