import { useQuery } from '@tanstack/react-query';
import { Conversation } from '@/types/database/types';
import axios from 'axios';

interface UseConversationsQueryProps {
  companyId: string;
  status?: string;
}

export const useConversationsQuery = ({ companyId, status }: UseConversationsQueryProps) => {
  return useQuery({
    queryKey: ['conversations', companyId, status],
    queryFn: async () => {
      let url = `/api/conversations?company_id=${companyId}`;
      if (status) {
        url += `&status=${status}`;
      }
      const { data } = await axios.get<Conversation[]>(url);
      return data;
    },
  });
}; 