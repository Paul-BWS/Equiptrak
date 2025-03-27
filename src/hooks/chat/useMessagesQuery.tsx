import { useQuery } from '@tanstack/react-query';
import { Message } from '@/types/database/types';
import axios from 'axios';

interface UseMessagesQueryProps {
  companyId: string;
  conversationId: string;
}

export const useMessagesQuery = ({ companyId, conversationId }: UseMessagesQueryProps) => {
  return useQuery({
    queryKey: ['messages', companyId, conversationId],
    queryFn: async () => {
      const { data } = await axios.get<Message[]>(
        `/api/conversations/${conversationId}/messages?company_id=${companyId}`
      );
      return data;
    },
  });
}; 