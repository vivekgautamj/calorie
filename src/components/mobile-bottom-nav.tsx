"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/add";
    }
    return pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard")
              ? "text-emerald-600 bg-emerald-50"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Add</span>
        </Link>

        <Link
          href="/dashboard/summary"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard/summary")
              ? "text-emerald-600 bg-emerald-50"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Summary</span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard/profile")
              ? "text-emerald-600 bg-emerald-50"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
} 