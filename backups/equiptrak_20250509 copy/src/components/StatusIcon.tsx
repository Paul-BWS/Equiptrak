import React from "react";
import { Circle } from "lucide-react";
import { clsx } from "clsx";

interface StatusIconProps {
  status: "valid" | "expired" | "upcoming";
  className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const statusConfig = {
    valid: "text-green-500",
    expired: "text-red-500",
    upcoming: "text-yellow-500"
  };

  return (
    <Circle 
      className={clsx("h-3 w-3 fill-current", statusConfig[status], className)} 
      aria-label={`Status: ${status}`}
    />
  );
} 