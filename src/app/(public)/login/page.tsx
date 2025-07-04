"use client";

import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/ui/login";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignIn() {
    const { data: session } = useSession();

    if (session) {
        redirect("/dashboard");
    }

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <div className="flex items-center justify-center space-x-3 mb-2">
                            <Image
                                src="/logo.png"
                                alt="CLSH Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <h1 className="text-4xl font-bold text-gray-900">
                                CLSH
                            </h1>
                        </div>
                    </Link>
                    <p className="text-gray-600">Create. Share. Clash.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        
                        <p className="text-gray-600">
                            Sign in to start creating and testing your ideas
                        </p>
                    </div>

                    {/* Sign In Button */}
                    <Button 
                        onClick={() => signIn("google")}
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

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center">
                        <Link 
                            href="/" 
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition duration-200"
                        >
                            ← Back to home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="Password" />
            <Button>Login</Button>
          </CardContent>
          <CardFooter>
            <Button>Login</Button>
            </CardFooter>
        </Card>
      </>
    );
}
