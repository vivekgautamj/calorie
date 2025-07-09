"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
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
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* Auth Button */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard/profile">
                  <div className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                    {session.user?.image && (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </div>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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