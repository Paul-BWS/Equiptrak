import { useQuery } from '@tanstack/react-query';
import { ServiceRecord } from '@/types/database/types';
import axios from 'axios';

interface UseServiceRecordsQueryProps {
  companyId: string;
  status?: string;
}

export const useServiceRecordsQuery = ({ companyId, status }: UseServiceRecordsQueryProps) => {
  return useQuery({
    queryKey: ['service_records', companyId, status],
    queryFn: async () => {
      let url = `/api/service-records?company_id=${companyId}`;
      if (status) {
        url += `&status=${status}`;
      }
      const { data } = await axios.get<ServiceRecord[]>(url);
      return data;
    },
  });
}; 