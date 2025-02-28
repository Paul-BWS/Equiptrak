import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getStatus } from "@/utils/serviceStatus";

interface UseEquipmentQueryProps {
  customerId?: string;
  equipmentTypeFilter?: string;
}

export function useEquipmentQuery({ customerId, equipmentTypeFilter }: UseEquipmentQueryProps) {
  return useQuery({
    queryKey: ["equipment", customerId, equipmentTypeFilter],
    queryFn: async () => {
      console.log("Starting equipment fetch with customerId:", customerId);
      console.log("Equipment type filter:", equipmentTypeFilter);
      
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      console.log("User profile:", userProfile);

      // For non-admin users, only show their customer's equipment
      if (userProfile?.role !== 'admin' && !customerId) {
        console.log("Non-admin user without customerId, returning no equipment");
        return [];
      }

      // First get the latest service records for each equipment
      const { data: latestServiceRecords } = await supabase
        .from('spot_welder_service_records')
        .select('equipment_id, retest_date, status')
        .order('test_date', { ascending: false });

      console.log("Latest service records:", latestServiceRecords);

      let query = supabase
        .from("equipment")
        .select(`
          *,
          companies (
            company_name,
            email
          ),
          equipment_types!inner (
            name,
            description
          )
        `);

      // Apply filters based on user role and parameters
      if (userProfile?.role !== 'admin') {
        // Non-admin users can only see their customer's equipment
        if (customerId && customerId !== 'undefined' && customerId !== ':customerId') {
          query = query.eq('customer_id', customerId);
        }
      } else {
        // Admin users can see all equipment or filter by customer
        if (customerId && customerId !== 'undefined' && customerId !== ':customerId') {
          query = query.eq('customer_id', customerId);
        }
      }

      // Apply equipment type filter if specified
      if (equipmentTypeFilter) {
        query = query.eq('equipment_types.name', equipmentTypeFilter);
      }

      const { data: equipmentData, error } = await query;

      if (error) {
        console.error("Error fetching equipment:", error);
        throw error;
      }

      console.log("Raw equipment data:", equipmentData);

      const validEquipment = equipmentData?.filter(item => 
        item && 
        item.id && 
        item.name && 
        item.serial_number
      ).map(item => {
        // Find the latest service record for this equipment
        const latestRecord = latestServiceRecords?.find(
          record => record.equipment_id === item.id
        );

        // Use the retest_date from service record if available
        const nextTestDate = latestRecord?.retest_date || item.next_test_date;
        const status = latestRecord?.status || getStatus(nextTestDate);

        return {
          ...item,
          next_test_date: nextTestDate,
          status,
          companies: item.companies && !('error' in item.companies) ? item.companies : null,
          equipment_types: item.equipment_types && !('error' in item.equipment_types) ? item.equipment_types : null
        };
      }) || [];

      console.log("Processed equipment with service records:", validEquipment);
      return validEquipment;
    },
  });
}