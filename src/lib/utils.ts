import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeRemaining(expiresAt: string): {
  days: number;
  hours: number;
  minutes: number;
  totalMilliseconds: number;
} | null {
  const now = new Date().getTime();
  const expirationTime = new Date(expiresAt).getTime();
  const timeRemaining = expirationTime - now;

  if (timeRemaining <= 0) {
    return null; // Already expired
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return {
    days,
    hours,
    minutes,
    totalMilliseconds: timeRemaining,
  };
}

export function formatTimeRemaining(timeRemaining: {
  days: number;
  hours: number;
  minutes: number;
}): string {
  const { days, hours, minutes } = timeRemaining;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
} 