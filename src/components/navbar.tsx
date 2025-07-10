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
            <Image
              src="/logo.png"
              alt="CLSH Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900">CLSH</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={cn(
                "transition-colors",
                isActive("/") 
                  ? "text-blue-600 font-semibold" 
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
                  ? "text-blue-600 font-semibold" 
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