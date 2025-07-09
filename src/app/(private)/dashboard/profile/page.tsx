"use client";

import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Key,
  Calendar,
  LogOut,
  Shield,
  Clock,
} from "lucide-react";
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

  console.log(">>>", session);

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto lg:my-8">
      <div>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">Profile</h1>
       
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <Card>
          
          <CardContent>
            <div className="flex flex-col items-center gap-6 py-4">
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
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900 font-semibold">
                      {userInfo.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900 font-semibold">
                      {userInfo.email}
                    </p>
                  </div>
                </div>

                

                

                {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Key className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Auth ID</p>
                    <p className="text-gray-900 font-mono text-xs">
                      {userInfo.id}
                    </p>
                  </div>
                </div> */}

                {/* <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">User ID</p>
                    <p className="text-gray-900 font-mono text-xs">
                      {userInfo.userId}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
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
                    <p className="text-sm font-medium text-red-700">Sign Out</p>
                    
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
  );
};

export default ProfilePage;
