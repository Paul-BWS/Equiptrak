import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A"
  
  try {
    return format(new Date(dateString), "dd/MM/yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}
