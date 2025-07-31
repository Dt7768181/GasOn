import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Centralized function to determine badge variant based on order status
export function getBadgeVariant(status: string): "default" | "secondary" | "destructive" | "accent" {
  switch (status) {
    case "Pending":
    case "Cancelled":
    case "Cancelled - Out of Stock":
      return "destructive";
    case "Booked":
    case "Confirmed":
      return "secondary";
    case "Out for Delivery":
      return "default";
    case "Delivered":
      return "accent"; // Use accent color for successful delivery
    default:
      return "default";
  }
}
