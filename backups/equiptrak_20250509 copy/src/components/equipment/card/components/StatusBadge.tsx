import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "valid" | "expired" | "upcoming";
  hasServiceRecord?: boolean;
}

export function StatusBadge({ status, hasServiceRecord }: StatusBadgeProps) {
  const statusConfig = {
    valid: {
      color: "bg-green-500",
      text: "Valid"
    },
    expired: {
      color: "bg-red-500",
      text: "Expired"
    },
    upcoming: {
      color: "bg-yellow-500",
      text: "Upcoming"
    }
  };

  return (
    <Badge 
      className={`px-3 py-1 text-white font-semibold ${statusConfig[status].color}`}
    >
      {statusConfig[status].text}
    </Badge>
  );
}