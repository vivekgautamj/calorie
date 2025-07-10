"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ClashLogo from "../../public/logo.png";
import Image from "next/image";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard/clashes") {
      return pathname === "/dashboard/clashes" || pathname === "/dashboard";
    }
    return pathname === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        <Link
          href="/dashboard/clashes"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard/clashes")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Image src={ClashLogo} alt="Clash Logo" className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Clashes</span>
        </Link>

        <Link
          href="/dashboard/create"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard/create")
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Create</span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={cn(
            "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
            isActive("/dashboard/profile")
              ? "text-blue-600 bg-blue-50"
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