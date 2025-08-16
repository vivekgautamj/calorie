"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 w">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-emerald-600">CalorieAI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={cn(
                "transition-colors",
                isActive("/") 
                  ? "text-emerald-600 font-semibold" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={cn(
                "transition-colors",
                isActive("/about") 
                  ? "text-emerald-600 font-semibold" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className={cn(
                "transition-colors",
                isActive("/pricing") 
                  ? "text-blue-600 font-semibold" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Button */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button 
                    size="sm" 
                    className={cn(
                      isActive("/dashboard") 
                        ? "bg-blue-700 hover:bg-blue-800" 
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Button 
                onClick={() => signIn("google", { callbackUrl: '/dashboard' })}
                variant="outline"
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 