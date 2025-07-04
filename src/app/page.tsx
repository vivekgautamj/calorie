"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
              src="/logo.png"
              alt="CLSH Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <h1 className="text-6xl font-bold text-gray-900">
              CLSH
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Create. Share. Clash.
          </p>
          <p className="text-lg text-gray-500">
            AB test your thumbnails quickly and with fun
          </p>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Thumbnail A vs B</h3>
              <p className="text-gray-600">Test which thumbnail performs better</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Quick & Fast</h3>
              <p className="text-gray-600">Get results in minutes, not days</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Fun Testing</h3>
              <p className="text-gray-600">Make AB testing enjoyable and engaging</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {status === "loading" ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ) : session ? (
              // User is logged in
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome back!
                </h2>
                <div className="flex items-center justify-center space-x-3 mb-6">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <span className="text-gray-700 font-medium">
                    {session.user?.name}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">
                  Ready to test your next thumbnail?
                </p>
                <Link 
                  href="/dashboard"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              // User is not logged in
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to Start?
                </h2>
                <p className="text-gray-600 mb-8">
                  Sign in with Google to begin testing your thumbnails.
                </p>
                <Button 
                        onClick={() => signIn("google" , {callbackUrl : '/dashboard'})}
                        className="w-full h-12 text-base"
                        variant="outline"
                    >
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
