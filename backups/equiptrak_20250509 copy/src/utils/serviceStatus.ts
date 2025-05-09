import type { Database } from "@/integrations/supabase/types";

type ServiceStatus = Database["public"]["Enums"]["service_status"];

export function getStatus(retestDate: string | null): "valid" | "upcoming" | "invalid" {
  if (!retestDate) return "invalid";
  
  const today = new Date();
  const retest = new Date(retestDate);
  
  // Calculate the difference in days
  const diffTime = retest.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return "invalid"; // Past retest date
  } else if (diffDays <= 30) {
    return "upcoming"; // Within 30 days of retest
  } else {
    return "valid"; // More than 30 days until retest
  }
}

export const getStatusColor = (retestDate: string | null) => {
  const status = getStatus(retestDate);
  switch (status) {
    case "valid":
      return "bg-green-500 text-white";
    case "upcoming":
      return "bg-yellow-500 text-white";
    case "invalid":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};