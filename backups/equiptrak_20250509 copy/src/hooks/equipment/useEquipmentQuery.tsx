import { useQuery } from '@tanstack/react-query';
import { Equipment } from '@/types/database/types';
import axios from 'axios';

interface UseEquipmentQueryProps {
  companyId: string;
  equipmentTypeFilter?: string;
}

export const useEquipmentQuery = ({ companyId, equipmentTypeFilter }: UseEquipmentQueryProps) => {
  return useQuery({
    queryKey: ['equipment', companyId, equipmentTypeFilter],
    queryFn: async () => {
      let url = `/api/companies/${companyId}/equipment`;
      if (equipmentTypeFilter) {
        url += `?type=${equipmentTypeFilter}`;
      }
      const { data } = await axios.get<Equipment[]>(url);
      return data;
    },
  });
};