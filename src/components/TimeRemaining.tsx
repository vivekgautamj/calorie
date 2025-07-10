"use client";

import { useState, useEffect } from "react";
import { getTimeRemaining, formatTimeRemaining } from "@/lib/utils";

interface TimeRemainingProps {
  expiresAt: string;
  className?: string;
}

export function TimeRemaining({ expiresAt, className = "" }: TimeRemainingProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    // Update time remaining every minute
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiresAt);
      setTimeRemaining(remaining);
      
      // Clear interval if expired
      if (!remaining) {
        clearInterval(interval);
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeRemaining) {
    return null; // Don't show anything if expired or no expiration
  }

  return (
    <span className={className}>
      Expires: {formatTimeRemaining(timeRemaining)}
    </span>
  );
} 