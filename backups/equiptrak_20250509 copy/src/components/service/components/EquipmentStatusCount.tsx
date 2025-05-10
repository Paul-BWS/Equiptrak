import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface EquipmentStatusCountProps {
  companyId: string;
  status: "valid" | "upcoming" | "invalid";
}

export function EquipmentStatusCount({ companyId, status }: EquipmentStatusCountProps) {
  const [count, setCount] = useState<number>(0);

  const { data: records, isLoading } = useQuery({
    queryKey: ["service-records-count", companyId, status],
    queryFn: async () => {
      // Get authentication token
      const storedUser = localStorage.getItem('equiptrak_user');
      let headers = {};
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.token) {
            headers = {
              'Authorization': `Bearer ${userData.token}`,
              'Content-Type': 'application/json'
            };
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      
      const url = `/api/service-records?company_id=${companyId}`;
      
      try {
        const response = await fetch(url, {
          headers,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch service records: ${response.status}`);
        }
        
        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error("Error in service records count request:", error);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
  });

  useEffect(() => {
    if (records && records.length > 0) {
      // Calculate counts based on status
      const statusCount = records.filter(record => {
        if (!record.retest_date && !record.next_service_date) {
          return status === "invalid";
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const retestDate = new Date(record.retest_date || record.next_service_date);
        retestDate.setHours(0, 0, 0, 0);
        
        const diffTime = retestDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          return status === "invalid";
        } else if (diffDays <= 30) {
          return status === "upcoming";
        } else {
          return status === "valid";
        }
      }).length;
      
      setCount(statusCount);
    }
  }, [records, status]);

  if (isLoading) {
    return <span className="text-gray-400">...</span>;
  }

  return <span>{count}</span>;
} 