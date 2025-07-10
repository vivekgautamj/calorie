"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { User, Mail, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/back-button";

interface ExtendedUser {
  userId?: string;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();

  // Helper function to get user info with fallbacks
  const getUserInfo = () => {
    const user = session?.user;
    return {
      name: user?.name || "Unknown User",
      email: user?.email || "No email available",
      image: user?.image || "/images/avatar.png",
      id: user?.id || "Not available",
      userId: (user as ExtendedUser)?.userId || "Not available",
      isVerified: !!user?.email,
      memberSince: user ? new Date().toLocaleDateString() : "Unknown",
    };
  };

  const userInfo = getUserInfo();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <BackButton href="/dashboard/clashes" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <Card className="bg-white">
              <CardContent>
                <div className="flex flex-col items-center gap-6 py-6">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
                    <Image
                      src={userInfo.image}
                      alt={userInfo.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* User Info */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Name
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {userInfo.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Email
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Subscription
                        </p>
                        <p className="text-purple-900 font-semibold">
                          Coming soon
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-600 text-purple-700"
                      >
                        Free
                      </Badge>
                    </div>
                  </div>

                  {/* Logout Section */}
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Sign Out
                        </p>
                        <p className="text-red-600 text-xs">
                          Sign out of your account
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="border-red-600 text-red-700 hover:bg-red-100"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
