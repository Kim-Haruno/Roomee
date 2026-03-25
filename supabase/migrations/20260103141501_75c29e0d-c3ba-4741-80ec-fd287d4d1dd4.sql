-- Allow users to update messages in their conversations (for marking as read)
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (is_conversation_participant(conversation_id));