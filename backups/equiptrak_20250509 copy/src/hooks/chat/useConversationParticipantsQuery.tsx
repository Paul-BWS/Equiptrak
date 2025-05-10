import { useQuery } from '@tanstack/react-query';
import { ConversationParticipant } from '@/types/database/types';
import axios from 'axios';

interface UseConversationParticipantsQueryProps {
  companyId: string;
  conversationId: string;
}

export const useConversationParticipantsQuery = ({ companyId, conversationId }: UseConversationParticipantsQueryProps) => {
  return useQuery({
    queryKey: ['conversation_participants', companyId, conversationId],
    queryFn: async () => {
      const { data } = await axios.get<ConversationParticipant[]>(
        `/api/conversations/${conversationId}/participants?company_id=${companyId}`
      );
      return data;
    },
  });
}; 