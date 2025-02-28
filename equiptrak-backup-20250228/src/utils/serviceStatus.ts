import type { Database } from "@/integrations/supabase/types";

type ServiceStatus = Database["public"]["Enums"]["service_status"];

export function getStatus(testDate: string): "valid" | "upcoming" | "expired" {
  const now = new Date();
  const testDateObj = new Date(testDate);
  const diffInDays = Math.ceil((testDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return "expired";
  } else if (diffInDays <= 30) {
    return "upcoming";
  } else {
    return "valid";
  }
}

export const getStatusColor = (retestDate: string) => {
  const status = getStatus(retestDate);
  switch (status) {
    case "valid":
      return "bg-green-500";
    case "upcoming":
      return "bg-yellow-500";
    case "expired":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};